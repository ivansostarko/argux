<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CelesTrakController extends Controller
{
    /**
     * Fetch satellite positions from CelesTrak GP data.
     * GET /mock-api/satellites?group=active&limit=100
     */
    public function index(Request $request): JsonResponse
    {
        $group = $request->string('group', 'stations');
        $limit = $request->integer('limit', 50);

        $cacheKey = "celestrak_{$group}_{$limit}";

        $data = Cache::remember($cacheKey, 120, function () use ($group, $limit) {
            return $this->fetchFromCelesTrak($group, $limit);
        });

        return response()->json($data);
    }

    private function fetchFromCelesTrak(string $group, int $limit): array
    {
        try {
            // CelesTrak GP (General Perturbations) JSON endpoint
            $url = "https://celestrak.org/NORAD/elements/gp.php";
            $response = Http::timeout(15)->get($url, [
                'GROUP' => $group,
                'FORMAT' => 'json',
            ]);

            if (!$response->successful()) {
                Log::warning('CelesTrak API error', ['status' => $response->status()]);
                return ['satellites' => [], 'source' => 'error', 'error' => 'API returned ' . $response->status()];
            }

            $gpData = $response->json();
            if (!is_array($gpData)) {
                return ['satellites' => [], 'source' => 'error', 'error' => 'Invalid response format'];
            }

            $satellites = collect($gpData)->take($limit)->map(function ($gp) {
                return $this->gpToPosition($gp);
            })->filter()->values()->toArray();

            Log::info('CelesTrak fetch', ['group' => $group, 'satellites' => count($satellites)]);

            return [
                'satellites' => $satellites,
                'source' => 'live',
                'count' => count($satellites),
                'time' => now()->toISOString(),
            ];
        } catch (\Exception $e) {
            Log::error('CelesTrak fetch failed', ['error' => $e->getMessage()]);
            return ['satellites' => [], 'source' => 'error', 'error' => $e->getMessage()];
        }
    }

    /**
     * Simplified position from GP orbital elements.
     * For accurate positions you'd use SGP4 propagation with satellite.js on the frontend.
     * This gives an approximate current position based on mean motion and epoch.
     */
    private function gpToPosition(array $gp): ?array
    {
        $name = trim($gp['OBJECT_NAME'] ?? '');
        $noradId = (int) ($gp['NORAD_CAT_ID'] ?? 0);
        if (!$name || !$noradId) return null;

        $inclination = (float) ($gp['INCLINATION'] ?? 0);
        $meanMotion = (float) ($gp['MEAN_MOTION'] ?? 15);
        $eccentricity = (float) ($gp['ECCENTRICITY'] ?? 0);
        $epoch = $gp['EPOCH'] ?? now()->toISOString();
        $raan = (float) ($gp['RA_OF_ASC_NODE'] ?? 0);
        $argPeri = (float) ($gp['ARG_OF_PERICENTER'] ?? 0);
        $meanAnomaly = (float) ($gp['MEAN_ANOMALY'] ?? 0);
        $intlDes = $gp['OBJECT_ID'] ?? '';
        $country = $gp['COUNTRY_CODE'] ?? '';
        $launchDate = $gp['LAUNCH_DATE'] ?? '';
        $rcs = $gp['RCS_SIZE'] ?? null;
        $objectType = $gp['OBJECT_TYPE'] ?? 'PAYLOAD';

        // Derive altitude from mean motion (Kepler's 3rd law simplified)
        $period = 1440.0 / $meanMotion; // minutes
        $semiMajor = pow(($period / (2 * M_PI) * 0.00981) * (86400.0 / (2 * M_PI)), 2.0 / 3.0); // very rough km
        // Better approximation:
        $semiMajorKm = pow(398600.4418 * pow($period * 60 / (2 * M_PI), 2), 1.0 / 3.0);
        $alt = max(0, $semiMajorKm - 6371); // subtract Earth radius

        // Approximate current position (simplified, not SGP4)
        $now = now();
        try { $epochTime = \Carbon\Carbon::parse($epoch); } catch (\Exception $e) { $epochTime = now(); }
        $elapsedMin = $now->diffInSeconds($epochTime) / 60.0;
        $currentAnomaly = fmod($meanAnomaly + ($meanMotion * 360.0 / 1440.0) * $elapsedMin, 360.0);
        $currentRaan = fmod($raan - 0.0042 * $elapsedMin, 360.0); // Earth rotation effect

        // Convert orbital elements to lat/lng (simplified)
        $argLat = deg2rad($currentAnomaly + $argPeri);
        $raanRad = deg2rad($currentRaan);
        $incRad = deg2rad($inclination);

        $lat = rad2deg(asin(sin($incRad) * sin($argLat)));
        $lng = rad2deg($raanRad + atan2(cos($incRad) * sin($argLat), cos($argLat)));
        // Adjust for Greenwich sidereal time (simplified)
        $gmst = fmod(280.46061837 + 360.98564736629 * ($now->julianDay() - 2451545.0), 360.0);
        $lng = fmod($lng - $gmst + 540, 360) - 180;

        $velocity = 2 * M_PI * $semiMajorKm / ($period * 60); // km/s

        return [
            'noradId' => $noradId,
            'name' => $name,
            'intlDesignator' => $intlDes,
            'lat' => round($lat, 4),
            'lng' => round($lng, 4),
            'alt' => round($alt, 0),
            'velocity' => round($velocity, 2),
            'inclination' => round($inclination, 1),
            'period' => round($period, 1),
            'category' => $this->categorize($name, $objectType, $alt),
            'country' => $country,
            'launchDate' => $launchDate,
            'status' => $objectType === 'DEBRIS' ? 'inactive' : 'active',
            'orbitType' => $this->orbitType($alt, $inclination, $period),
        ];
    }

    private function categorize(string $name, string $type, float $alt): string
    {
        if (str_contains($name, 'ISS') || str_contains($name, 'TIANHE') || str_contains($name, 'CSS')) return 'space-station';
        if ($type === 'DEBRIS' || str_contains($name, 'DEB')) return 'debris';
        if (str_contains($name, 'STARLINK') || str_contains($name, 'ONEWEB')) return 'starlink';
        if (str_contains($name, 'GPS') || str_contains($name, 'NAVSTAR') || str_contains($name, 'GLONASS') || str_contains($name, 'GALILEO') || str_contains($name, 'BEIDOU')) return 'navigation';
        if (str_contains($name, 'METEOSAT') || str_contains($name, 'NOAA') || str_contains($name, 'GOES') || str_contains($name, 'HIMAWARI') || str_contains($name, 'METOP')) return 'weather';
        if (str_contains($name, 'LANDSAT') || str_contains($name, 'SENTINEL') || str_contains($name, 'CRYOSAT') || str_contains($name, 'TERRA') || str_contains($name, 'AQUA')) return 'earth-observation';
        if (str_contains($name, 'USA-') || str_contains($name, 'NROL') || str_contains($name, 'COSMOS 2')) return 'military';
        if (str_contains($name, 'HUBBLE') || str_contains($name, 'CHANDRA') || str_contains($name, 'JWST') || str_contains($name, 'FERMI')) return 'scientific';
        if ($alt > 30000) return 'communication';
        return 'communication';
    }

    private function orbitType(float $alt, float $inc, float $period): string
    {
        if ($period > 1400 && $period < 1500 && $alt > 34000) return 'GEO';
        if ($alt > 1500 && $alt < 26000) return 'MEO';
        if ($inc > 96 && $inc < 100 && $alt < 1000) return 'SSO';
        if ($period > 700 && $alt > 30000) return 'HEO';
        return 'LEO';
    }
}
