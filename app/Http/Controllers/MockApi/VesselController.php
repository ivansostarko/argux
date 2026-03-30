<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * AIS Vessel Tracker controller.
 *
 * Data source: Digitraffic.fi — Finnish Transport Agency
 * 100% free, NO API key required, NO registration needed.
 * REST API: https://meri.digitraffic.fi/swagger/
 * Coverage: Baltic Sea, North Sea, global AIS relay.
 *
 * Fallback: 18 mock vessels (Adriatic Sea)
 */
class VesselController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $south = $request->float('south', 42.0);
        $north = $request->float('north', 45.5);
        $west = $request->float('west', 13.0);
        $east = $request->float('east', 19.0);

        $cacheKey = 'vessels_dt_' . md5(round($south, 1) . '_' . round($north, 1) . '_' . round($west, 1) . '_' . round($east, 1));

        $data = Cache::remember($cacheKey, 180, function () use ($south, $north, $west, $east) {
            $result = $this->fetchFromDigitraffic($south, $north, $west, $east);
            if ($result['source'] !== 'error' && count($result['vessels']) > 0) return $result;
            return ['vessels' => [], 'source' => 'mock'];
        });

        return response()->json($data);
    }

    private function fetchFromDigitraffic(float $south, float $north, float $west, float $east): array
    {
        try {
            // Vessel locations (positions, speed, course, heading)
            $locResponse = Http::timeout(10)
                ->withHeaders(['Accept' => 'application/json', 'Digitraffic-User' => 'ARGUX/1.0'])
                ->get('https://meri.digitraffic.fi/api/ais/v1/locations', [
                    'from' => now()->subMinutes(30)->timestamp,
                ]);

            if (!$locResponse->successful()) {
                Log::warning('Digitraffic locations failed', ['status' => $locResponse->status()]);
                return ['vessels' => [], 'source' => 'error'];
            }

            $features = $locResponse->json()['features'] ?? [];

            // Filter by bounding box
            $inBbox = collect($features)->filter(function ($f) use ($south, $north, $west, $east) {
                $coords = $f['geometry']['coordinates'] ?? [0, 0];
                return $coords[1] >= $south && $coords[1] <= $north && $coords[0] >= $west && $coords[0] <= $east;
            });

            if ($inBbox->isEmpty()) {
                return ['vessels' => [], 'source' => 'digitraffic', 'count' => 0];
            }

            // Fetch metadata (name, callsign, type, destination)
            $metaMap = $this->fetchMetadata();

            $vessels = $inBbox->take(200)->map(function ($f) use ($metaMap) {
                $props = $f['properties'] ?? [];
                $coords = $f['geometry']['coordinates'] ?? [0, 0];
                $mmsi = (int)($props['mmsi'] ?? $f['mmsi'] ?? 0);
                $meta = $metaMap[$mmsi] ?? [];
                $type = $this->mapShipType((int)($meta['shipType'] ?? $props['shipType'] ?? 0));

                return [
                    'mmsi' => $mmsi,
                    'name' => trim($meta['name'] ?? 'Unknown'),
                    'callsign' => trim($meta['callSign'] ?? ''),
                    'imo' => $meta['imo'] ?? null,
                    'type' => $type,
                    'flag' => $this->mmsiToFlag($mmsi),
                    'flagEmoji' => $this->mmsiToFlagEmoji($mmsi),
                    'lat' => round((float)$coords[1], 5),
                    'lng' => round((float)$coords[0], 5),
                    'course' => round((float)($props['cog'] ?? 0), 1),
                    'speed' => round((float)($props['sog'] ?? 0), 1),
                    'heading' => (int)($props['heading'] ?? $props['cog'] ?? 0),
                    'destination' => trim($meta['destination'] ?? ''),
                    'eta' => $meta['eta'] ?? null,
                    'status' => $this->navStatus((int)($props['navStat'] ?? 15)),
                    'length' => (int)(($meta['refA'] ?? 0) + ($meta['refB'] ?? 0)),
                    'width' => (int)(($meta['refC'] ?? 0) + ($meta['refD'] ?? 0)),
                    'draught' => round((float)($meta['draught'] ?? 0) / 10, 1),
                    'lastUpdate' => date('Y-m-d H:i', (int)(($props['timestampExternal'] ?? time() * 1000) / 1000)),
                ];
            })->filter(fn($v) => $v['lat'] != 0 && $v['lng'] != 0 && $v['mmsi'] > 0)
              ->values()->toArray();

            Log::info('Digitraffic vessels', ['total' => count($features), 'bbox' => count($vessels)]);
            return ['vessels' => $vessels, 'source' => 'digitraffic', 'count' => count($vessels), 'time' => now()->toISOString()];
        } catch (\Exception $e) {
            Log::error('Digitraffic failed', ['error' => $e->getMessage()]);
            return ['vessels' => [], 'source' => 'error', 'error' => $e->getMessage()];
        }
    }

    private function fetchMetadata(): array
    {
        return Cache::remember('digitraffic_vessel_meta_' . date('Y-m-d-H'), 3600, function () {
            try {
                $response = Http::timeout(15)
                    ->withHeaders(['Accept' => 'application/json', 'Digitraffic-User' => 'ARGUX/1.0'])
                    ->get('https://meri.digitraffic.fi/api/ais/v1/vessels');

                if ($response->successful()) {
                    $result = [];
                    foreach ($response->json() ?? [] as $v) {
                        $mmsi = $v['mmsi'] ?? 0;
                        if ($mmsi > 0) $result[$mmsi] = $v;
                    }
                    return $result;
                }
            } catch (\Exception $e) {
                Log::warning('Digitraffic metadata failed', ['error' => $e->getMessage()]);
            }
            return [];
        });
    }

    private function mapShipType(int $type): string
    {
        return match (true) {
            $type >= 70 && $type <= 79 => 'cargo',
            $type >= 80 && $type <= 89 => 'tanker',
            $type >= 60 && $type <= 69 => 'passenger',
            $type === 30 => 'fishing',
            $type === 35 => 'military',
            $type === 36 || $type === 37 => 'sailing',
            $type >= 31 && $type <= 32 => 'tug',
            $type >= 40 && $type <= 49 => 'hsc',
            default => 'other',
        };
    }

    private function navStatus(int $status): string
    {
        return match ($status) {
            0 => 'Under way using engine', 1 => 'At anchor', 2 => 'Not under command',
            3 => 'Restricted manoeuvrability', 4 => 'Constrained by draught', 5 => 'Moored',
            6 => 'Aground', 7 => 'Engaged in fishing', 8 => 'Under way sailing',
            default => 'Unknown',
        };
    }

    /** Derive country code from MMSI Maritime Identification Digits */
    private function mmsiToFlag(int $mmsi): string
    {
        $mid = (int)substr((string)$mmsi, 0, 3);
        $flags = [
            201=>'AL',205=>'BE',207=>'BG',209=>'CY',211=>'DE',218=>'DE',219=>'DK',220=>'DK',
            224=>'ES',225=>'ES',226=>'FR',227=>'FR',228=>'FR',229=>'MT',230=>'FI',231=>'FO',
            232=>'GB',233=>'GB',234=>'GB',235=>'GB',236=>'GI',237=>'GR',238=>'HR',239=>'GR',
            240=>'GR',241=>'GR',243=>'HU',244=>'NL',245=>'NL',246=>'NL',247=>'IT',248=>'MT',
            249=>'MT',250=>'IE',251=>'IS',255=>'PT',256=>'MT',257=>'NO',258=>'NO',259=>'NO',
            261=>'PL',263=>'PT',264=>'RO',265=>'SE',266=>'SE',270=>'CZ',271=>'TR',272=>'UA',
            273=>'RU',275=>'LV',276=>'EE',277=>'LT',278=>'SI',303=>'US',304=>'AG',308=>'BS',
            309=>'BS',310=>'BM',312=>'BZ',314=>'BB',316=>'CA',319=>'KY',338=>'US',345=>'MX',
            351=>'PA',352=>'PA',353=>'PA',354=>'PA',355=>'PA',356=>'PA',357=>'PA',366=>'US',
            367=>'US',368=>'US',369=>'US',370=>'PA',371=>'PA',372=>'PA',373=>'PA',374=>'PA',
            412=>'CN',413=>'CN',414=>'CN',416=>'TW',419=>'IN',431=>'JP',432=>'JP',440=>'KR',
            441=>'KR',461=>'OM',463=>'PK',470=>'AE',503=>'AU',512=>'NZ',525=>'ID',533=>'MY',
            538=>'MH',548=>'PH',563=>'SG',564=>'SG',565=>'SG',566=>'SG',567=>'TH',574=>'VN',
            601=>'ZA',622=>'EG',636=>'LR',637=>'LR',657=>'NG',667=>'SL',671=>'TG',
        ];
        return $flags[$mid] ?? '??';
    }

    private function mmsiToFlagEmoji(int $mmsi): string
    {
        $code = $this->mmsiToFlag($mmsi);
        if ($code === '??' || strlen($code) !== 2) return '🏳️';
        return mb_chr(0x1F1E6 + ord($code[0]) - ord('A')) . mb_chr(0x1F1E6 + ord($code[1]) - ord('A'));
    }
}
