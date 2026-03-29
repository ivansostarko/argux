<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TrafficController extends Controller
{
    /**
     * Get TomTom API config for client-side tile rendering.
     * GET /mock-api/traffic/config
     */
    public function config(): JsonResponse
    {
        $apiKey = $this->getApiKey();

        return response()->json([
            'hasKey' => !empty($apiKey),
            'apiKey' => $apiKey,
            'tileUrls' => [
                // TomTom Traffic Flow tiles — relative speed (color-coded)
                'flow_relative' => $apiKey
                    ? "https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key={$apiKey}&tileSize=256&thickness=6"
                    : null,
                // TomTom Traffic Flow tiles — absolute speed
                'flow_absolute' => $apiKey
                    ? "https://api.tomtom.com/traffic/map/4/tile/flow/absolute/{z}/{x}/{y}.png?key={$apiKey}&tileSize=256&thickness=6"
                    : null,
                // TomTom Traffic Incidents tiles
                'incidents_s1' => $apiKey
                    ? "https://api.tomtom.com/traffic/map/4/tile/incidents/s1/{z}/{x}/{y}.png?key={$apiKey}&tileSize=256"
                    : null,
            ],
        ]);
    }

    /**
     * Get traffic incidents for a bounding box.
     * GET /mock-api/traffic/incidents?south=45.75&west=15.90&north=45.85&east=16.05
     */
    public function incidents(Request $request): JsonResponse
    {
        $apiKey = $this->getApiKey();
        if (!$apiKey) {
            return response()->json(['incidents' => [], 'source' => 'no_key']);
        }

        $south = $request->float('south', 45.75);
        $north = $request->float('north', 45.85);
        $west = $request->float('west', 15.90);
        $east = $request->float('east', 16.05);

        $cacheKey = 'tomtom_incidents_' . md5("{$south}_{$north}_{$west}_{$east}");

        $data = Cache::remember($cacheKey, 120, function () use ($apiKey, $south, $north, $west, $east) {
            return $this->fetchIncidents($apiKey, $south, $north, $west, $east);
        });

        return response()->json($data);
    }

    /**
     * Get traffic flow data for a specific point.
     * GET /mock-api/traffic/flow?lat=45.81&lng=15.98
     */
    public function flow(Request $request): JsonResponse
    {
        $apiKey = $this->getApiKey();
        if (!$apiKey) {
            return response()->json(['flow' => null, 'source' => 'no_key']);
        }

        $lat = $request->float('lat', 45.8131);
        $lng = $request->float('lng', 15.9775);

        $cacheKey = 'tomtom_flow_' . md5("{$lat}_{$lng}");

        $data = Cache::remember($cacheKey, 60, function () use ($apiKey, $lat, $lng) {
            return $this->fetchFlowSegment($apiKey, $lat, $lng);
        });

        return response()->json($data);
    }

    private function fetchIncidents(string $apiKey, float $south, float $north, float $west, float $east): array
    {
        try {
            // TomTom Incident Details API v5
            $url = 'https://api.tomtom.com/traffic/services/5/incidentDetails';

            $response = Http::timeout(10)->get($url, [
                'key' => $apiKey,
                'bbox' => "{$west},{$south},{$east},{$north}",
                'fields' => '{incidents{type,geometry{type,coordinates},properties{id,iconCategory,magnitudeOfDelay,events{description,code},startTime,endTime,from,to,length,delay,roadNumbers,aci{probabilityOfOccurrence,numberOfReports,lastReportTime}}}}',
                'language' => 'en-US',
                'categoryFilter' => '0,1,2,3,4,5,6,7,8,9,10,11,14',
                'timeValidityFilter' => 'present',
            ]);

            if (!$response->successful()) {
                Log::warning('TomTom Incidents API error', ['status' => $response->status(), 'body' => substr($response->body(), 0, 200)]);
                return ['incidents' => [], 'source' => 'error', 'error' => 'API returned ' . $response->status()];
            }

            $body = $response->json();
            $raw = $body['incidents'] ?? [];

            $incidents = collect($raw)->map(function ($inc) {
                $props = $inc['properties'] ?? [];
                $geom = $inc['geometry'] ?? [];
                $events = $props['events'] ?? [];
                $coords = $geom['coordinates'] ?? [];

                // Get center coordinate
                $lat = 0;
                $lng = 0;
                if ($geom['type'] === 'Point' && count($coords) >= 2) {
                    $lng = $coords[0];
                    $lat = $coords[1];
                } elseif ($geom['type'] === 'LineString' && count($coords) > 0) {
                    $mid = $coords[(int)(count($coords) / 2)];
                    $lng = $mid[0] ?? 0;
                    $lat = $mid[1] ?? 0;
                }

                if ($lat == 0 && $lng == 0) return null;

                // Map TomTom icon categories to our types
                $iconCat = $props['iconCategory'] ?? 0;
                $type = match (true) {
                    in_array($iconCat, [1, 2]) => 'accident',
                    in_array($iconCat, [3, 4, 5]) => 'construction',
                    in_array($iconCat, [6, 7]) => 'closure',
                    $iconCat === 8 => 'hazard',
                    $iconCat === 9 => 'police',
                    $iconCat === 10 => 'event',
                    default => 'hazard',
                };

                // Magnitude → severity
                $mag = $props['magnitudeOfDelay'] ?? 0;
                $severity = match (true) {
                    $mag >= 4 => 'critical',
                    $mag >= 3 => 'major',
                    $mag >= 2 => 'moderate',
                    default => 'minor',
                };

                // Build description
                $descriptions = collect($events)->pluck('description')->filter()->implode('. ');
                $from = $props['from'] ?? '';
                $to = $props['to'] ?? '';
                $road = implode(', ', $props['roadNumbers'] ?? []);

                return [
                    'id' => $props['id'] ?? ('tt-' . md5(json_encode($coords))),
                    'type' => $type,
                    'severity' => $severity,
                    'title' => $descriptions ?: ucfirst($type),
                    'description' => ($from && $to) ? "From {$from} to {$to}" : ($from ?: $descriptions),
                    'lat' => round($lat, 6),
                    'lng' => round($lng, 6),
                    'road' => $road ?: ($from ?: 'Unknown'),
                    'startTime' => $props['startTime'] ?? '',
                    'endTime' => $props['endTime'] ?? null,
                    'delay' => $props['delay'] ?? 0,
                    'length' => $props['length'] ?? 0,
                    'geometry' => $geom,
                ];
            })->filter()->values()->toArray();

            Log::info('TomTom incidents fetched', ['count' => count($incidents)]);

            return [
                'incidents' => $incidents,
                'source' => 'tomtom',
                'count' => count($incidents),
                'time' => now()->toISOString(),
            ];
        } catch (\Exception $e) {
            Log::error('TomTom incidents fetch failed', ['error' => $e->getMessage()]);
            return ['incidents' => [], 'source' => 'error', 'error' => $e->getMessage()];
        }
    }

    private function fetchFlowSegment(string $apiKey, float $lat, float $lng): array
    {
        try {
            $url = "https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json";

            $response = Http::timeout(8)->get($url, [
                'key' => $apiKey,
                'point' => "{$lat},{$lng}",
                'unit' => 'KMPH',
                'thickness' => 1,
            ]);

            if (!$response->successful()) {
                return ['flow' => null, 'source' => 'error'];
            }

            $body = $response->json();
            $data = $body['flowSegmentData'] ?? [];

            return [
                'flow' => [
                    'currentSpeed' => $data['currentSpeed'] ?? 0,
                    'freeFlowSpeed' => $data['freeFlowSpeed'] ?? 0,
                    'currentTravelTime' => $data['currentTravelTime'] ?? 0,
                    'freeFlowTravelTime' => $data['freeFlowTravelTime'] ?? 0,
                    'confidence' => $data['confidence'] ?? 0,
                    'roadClosure' => $data['roadClosure'] ?? false,
                    'coordinates' => $data['coordinates']['coordinate'] ?? [],
                ],
                'source' => 'tomtom',
            ];
        } catch (\Exception $e) {
            return ['flow' => null, 'source' => 'error', 'error' => $e->getMessage()];
        }
    }

    private function getApiKey(): string
    {
        // 1. Check .env
        $key = env('TOMTOM_API_KEY', '');
        if ($key) return $key;

        // 2. Check credentials.json
        $credPath = base_path('credentials.json');
        if (file_exists($credPath)) {
            try {
                $creds = json_decode(file_get_contents($credPath), true);
                if (!empty($creds['tomtom_api_key'])) return $creds['tomtom_api_key'];
            } catch (\Exception $e) {}
        }

        return '';
    }
}