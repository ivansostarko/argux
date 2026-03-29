<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RoutingController extends Controller
{
    /**
     * Get route between waypoints via OSRM (Open Source Routing Machine).
     * POST /mock-api/route
     * Body: { waypoints: [[lng,lat],[lng,lat],...], profile: "car"|"bike"|"foot" }
     */
    public function route(Request $request): JsonResponse
    {
        $waypoints = $request->input('waypoints', []);
        $profile = $request->string('profile', 'car');

        if (count($waypoints) < 2) {
            return response()->json(['error' => 'At least 2 waypoints required'], 200);
        }

        // Map profile names to OSRM profiles
        $osrmProfile = match ($profile) {
            'bike', 'bicycle', 'cycling' => 'bike',
            'foot', 'walk', 'walking', 'pedestrian' => 'foot',
            default => 'car',
        };

        $coordStr = collect($waypoints)->map(fn($wp) => $wp[0] . ',' . $wp[1])->implode(';');
        $cacheKey = 'osrm_' . md5($coordStr . '_' . $osrmProfile);

        $data = Cache::remember($cacheKey, 120, function () use ($coordStr, $osrmProfile, $waypoints) {
            return $this->fetchFromOSRM($coordStr, $osrmProfile, $waypoints);
        });

        return response()->json($data);
    }

    private function fetchFromOSRM(string $coordStr, string $profile, array $waypoints): array
    {
        // OSRM demo server (open source, free, no API key)
        $url = "https://router.project-osrm.org/route/v1/{$profile}/{$coordStr}";

        try {
            $response = Http::timeout(10)->get($url, [
                'overview' => 'full',
                'geometries' => 'geojson',
                'steps' => 'true',
                'annotations' => 'true',
            ]);

            if (!$response->successful()) {
                Log::warning('OSRM API error', ['status' => $response->status()]);
                return $this->fallbackRoute($waypoints, $profile);
            }

            $body = $response->json();
            if (($body['code'] ?? '') !== 'Ok' || empty($body['routes'])) {
                return $this->fallbackRoute($waypoints, $profile);
            }

            $route = $body['routes'][0];
            $legs = $route['legs'] ?? [];

            // Build turn-by-turn instructions
            $steps = [];
            foreach ($legs as $legIdx => $leg) {
                foreach (($leg['steps'] ?? []) as $step) {
                    $maneuver = $step['maneuver'] ?? [];
                    $steps[] = [
                        'instruction' => $this->buildInstruction($step),
                        'distance' => round($step['distance'] ?? 0),
                        'duration' => round($step['duration'] ?? 0),
                        'name' => $step['name'] ?? '',
                        'type' => $maneuver['type'] ?? '',
                        'modifier' => $maneuver['modifier'] ?? '',
                        'location' => $maneuver['location'] ?? [],
                    ];
                }
            }

            return [
                'source' => 'osrm',
                'geometry' => $route['geometry'] ?? null,
                'distance' => round($route['distance'] ?? 0),
                'duration' => round($route['duration'] ?? 0),
                'steps' => $steps,
                'waypoints' => collect($body['waypoints'] ?? [])->map(fn($wp) => [
                    'name' => $wp['name'] ?? '',
                    'location' => $wp['location'] ?? [],
                ])->toArray(),
            ];
        } catch (\Exception $e) {
            Log::error('OSRM fetch failed', ['error' => $e->getMessage()]);
            return $this->fallbackRoute($waypoints, $profile);
        }
    }

    /**
     * Straight-line fallback when OSRM is unavailable.
     */
    private function fallbackRoute(array $waypoints, string $profile): array
    {
        $totalDist = 0;
        $coords = [];
        for ($i = 0; $i < count($waypoints); $i++) {
            $coords[] = $waypoints[$i];
            if ($i > 0) {
                $totalDist += $this->haversine(
                    $waypoints[$i - 1][1], $waypoints[$i - 1][0],
                    $waypoints[$i][1], $waypoints[$i][0]
                );
            }
        }

        // Estimate duration based on profile
        $speeds = ['car' => 50, 'bike' => 15, 'foot' => 5]; // km/h
        $speed = $speeds[$profile] ?? 50;
        $duration = ($totalDist / $speed) * 3600;

        $steps = [];
        for ($i = 0; $i < count($waypoints) - 1; $i++) {
            $d = $this->haversine($waypoints[$i][1], $waypoints[$i][0], $waypoints[$i + 1][1], $waypoints[$i + 1][0]);
            $steps[] = [
                'instruction' => $i === 0 ? 'Depart' : 'Continue to waypoint ' . ($i + 1),
                'distance' => round($d * 1000),
                'duration' => round(($d / $speed) * 3600),
                'name' => '',
                'type' => $i === 0 ? 'depart' : 'arrive',
                'modifier' => 'straight',
                'location' => $waypoints[$i],
            ];
        }

        return [
            'source' => 'straight-line',
            'geometry' => [
                'type' => 'LineString',
                'coordinates' => $coords,
            ],
            'distance' => round($totalDist * 1000),
            'duration' => round($duration),
            'steps' => $steps,
            'waypoints' => collect($waypoints)->map(fn($wp) => [
                'name' => '',
                'location' => $wp,
            ])->toArray(),
        ];
    }

    private function haversine(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $R = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;
        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    private function buildInstruction(array $step): string
    {
        $type = $step['maneuver']['type'] ?? '';
        $modifier = $step['maneuver']['modifier'] ?? '';
        $name = $step['name'] ?? '';

        $instruction = match ($type) {
            'depart' => 'Depart',
            'arrive' => 'Arrive at destination',
            'turn' => 'Turn ' . $modifier,
            'new name' => 'Continue onto ' . ($name ?: 'road'),
            'merge' => 'Merge ' . $modifier,
            'on ramp' => 'Take the ramp ' . $modifier,
            'off ramp' => 'Take the exit ' . $modifier,
            'fork' => 'Keep ' . $modifier . ' at fork',
            'roundabout' => 'Enter roundabout',
            'exit roundabout' => 'Exit roundabout onto ' . ($name ?: 'road'),
            'continue' => 'Continue' . ($name ? ' on ' . $name : ''),
            'end of road' => 'Turn ' . $modifier . ' at end of road',
            default => ucfirst($type) . ($modifier ? ' ' . $modifier : ''),
        };

        if ($name && !str_contains($instruction, $name) && $type !== 'depart' && $type !== 'arrive') {
            $instruction .= ' onto ' . $name;
        }

        return $instruction;
    }
}
