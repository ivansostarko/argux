<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenSkyController extends Controller
{
    /**
     * Proxy live flight data from OpenSky Network API.
     * GET /mock-api/flights?lamin=42&lamax=47&lomin=13&lomax=20
     */
    public function index(Request $request): JsonResponse
    {
        $bounds = [
            'lamin' => $request->float('lamin', config('opensky.bounds.lamin')),
            'lamax' => $request->float('lamax', config('opensky.bounds.lamax')),
            'lomin' => $request->float('lomin', config('opensky.bounds.lomin')),
            'lomax' => $request->float('lomax', config('opensky.bounds.lomax')),
        ];

        $cacheKey = 'opensky_' . md5(json_encode($bounds));
        $ttl = config('opensky.cache_ttl', 8);

        $data = Cache::remember($cacheKey, $ttl, function () use ($bounds) {
            return $this->fetchFromOpenSky($bounds);
        });

        return response()->json($data);
    }

    private function fetchFromOpenSky(array $bounds): array
    {
        $credentials = $this->getCredentials();
        $url = config('opensky.api_url');

        try {
            $http = Http::timeout(10);

            if ($credentials['username'] && $credentials['password']) {
                $http = $http->withBasicAuth($credentials['username'], $credentials['password']);
            }

            $response = $http->get($url, $bounds);

            if (!$response->successful()) {
                Log::warning('OpenSky API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return ['flights' => [], 'error' => 'API returned ' . $response->status(), 'source' => 'error', 'time' => now()->toISOString()];
            }

            $body = $response->json();
            $states = $body['states'] ?? [];

            $flights = collect($states)->map(function ($s) {
                // OpenSky state vector: https://openskynetwork.github.io/opensky-api/rest.html
                // [0]=icao24, [1]=callsign, [2]=origin_country, [3]=time_position, [4]=last_contact,
                // [5]=longitude, [6]=latitude, [7]=baro_altitude, [8]=on_ground, [9]=velocity,
                // [10]=true_track, [11]=vertical_rate, [12]=sensors, [13]=geo_altitude, [14]=squawk,
                // [15]=spi, [16]=position_source, [17]=category
                if (!is_array($s) || count($s) < 17) return null;
                if ($s[5] === null || $s[6] === null) return null;

                $callsign = trim($s[1] ?? '');
                $category = $this->categorizeAircraft($s[17] ?? 0, $callsign);

                return [
                    'icao24' => $s[0] ?? '',
                    'callsign' => $callsign ?: strtoupper($s[0] ?? ''),
                    'originCountry' => $s[2] ?? '',
                    'lat' => round((float) $s[6], 5),
                    'lng' => round((float) $s[5], 5),
                    'baroAlt' => round((float) ($s[7] ?? 0), 0),
                    'geoAlt' => round((float) ($s[13] ?? 0), 0),
                    'velocity' => round((float) ($s[9] ?? 0), 1),
                    'heading' => round((float) ($s[10] ?? 0), 1),
                    'verticalRate' => round((float) ($s[11] ?? 0), 1),
                    'onGround' => (bool) ($s[8] ?? false),
                    'squawk' => $s[14] ?? '',
                    'category' => $category,
                    'lastContact' => $s[4] ?? null,
                ];
            })->filter()->values()->toArray();

            Log::info('OpenSky fetch', ['flights' => count($flights), 'bounds' => $bounds]);

            return [
                'flights' => $flights,
                'time' => $body['time'] ?? now()->timestamp,
                'source' => 'live',
                'count' => count($flights),
            ];
        } catch (\Exception $e) {
            Log::error('OpenSky fetch failed', ['error' => $e->getMessage()]);
            return ['flights' => [], 'error' => $e->getMessage(), 'source' => 'error', 'time' => now()->toISOString()];
        }
    }

    private function getCredentials(): array
    {
        // Priority 1: .env variables
        $username = config('opensky.username');
        $password = config('opensky.password');

        if ($username && $password) {
            return ['username' => $username, 'password' => $password];
        }

        // Priority 2: credentials.json file
        $credPath = config('opensky.credentials_path');
        if ($credPath && file_exists($credPath)) {
            try {
                $json = json_decode(file_get_contents($credPath), true);
                if (is_array($json) && isset($json['username'], $json['password'])) {
                    return ['username' => $json['username'], 'password' => $json['password']];
                }
            } catch (\Exception $e) {
                Log::warning('Failed to read credentials.json', ['error' => $e->getMessage()]);
            }
        }

        // No credentials — anonymous access (lower rate limits)
        return ['username' => '', 'password' => ''];
    }

    private function categorizeAircraft(int $categoryCode, string $callsign): string
    {
        // OpenSky category codes: https://openskynetwork.github.io/opensky-api/rest.html
        // 0=No info, 1=No ADS-B emitter cat, 2=Light, 3=Small, 4=Large, 5=High vortex
        // 6=Heavy, 7=High performance, 8=Rotorcraft, 9=Glider, 10=Lighter than air
        // 11=Parachutist, 12=Ultralight, 13=Reserved, 14=UAV, 15=Space, 16=Surface emergency, 17=Surface service

        if ($categoryCode === 8) return 'helicopter';
        if (in_array($categoryCode, [2, 3, 9, 12])) return 'private';

        // Military detection by callsign patterns
        $milPrefixes = ['RCH', 'CNV', 'DUKE', 'REACH', 'GAF', 'BAF', 'FAF', 'IAM', 'MMF', 'RRR', 'NATO', 'USAF'];
        foreach ($milPrefixes as $p) {
            if (str_starts_with($callsign, $p)) return 'military';
        }

        // Cargo detection
        $cargoPrefixes = ['FDX', 'UPS', 'GTI', 'ABX', 'CLX', 'BOX', 'DHL', 'GEC', 'MPH', 'SQC', 'CAO'];
        foreach ($cargoPrefixes as $p) {
            if (str_starts_with($callsign, $p)) return 'cargo';
        }

        if (in_array($categoryCode, [4, 5, 6, 7])) return 'commercial';

        return 'commercial';
    }
}
