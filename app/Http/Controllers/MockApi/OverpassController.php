<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OverpassController extends Controller
{
    /**
     * Fetch places of interest from OpenStreetMap Overpass API.
     * GET /mock-api/places?categories=hospital,police,bank&south=45.75&west=15.90&north=45.85&east=16.05
     */
    public function index(Request $request): JsonResponse
    {
        $categories = explode(',', $request->string('categories', 'hospital,police,pharmacy'));
        $south = $request->float('south', 45.75);
        $north = $request->float('north', 45.85);
        $west = $request->float('west', 15.90);
        $east = $request->float('east', 16.05);

        // Clamp bounding box to prevent huge queries
        $latSpan = $north - $south;
        $lngSpan = $east - $west;
        if ($latSpan > 0.5 || $lngSpan > 0.5) {
            $cLat = ($south + $north) / 2;
            $cLng = ($west + $east) / 2;
            $south = $cLat - 0.15;
            $north = $cLat + 0.15;
            $west = $cLng - 0.2;
            $east = $cLng + 0.2;
        }

        $cacheKey = 'overpass_' . md5(implode(',', $categories) . "_{$south}_{$north}_{$west}_{$east}");

        $data = Cache::remember($cacheKey, 300, function () use ($categories, $south, $north, $west, $east) {
            return $this->fetchFromOverpass($categories, $south, $north, $west, $east);
        });

        return response()->json($data);
    }

    private function fetchFromOverpass(array $categories, float $south, float $north, float $west, float $east): array
    {
        $categoryMap = [
            'hospital'   => 'node["amenity"="hospital"]',
            'police'     => 'node["amenity"="police"]',
            'fire'       => 'node["amenity"="fire_station"]',
            'pharmacy'   => 'node["amenity"="pharmacy"]',
            'bank'       => 'node["amenity"="bank"]',
            'atm'        => 'node["amenity"="atm"]',
            'school'     => 'node["amenity"="school"]',
            'fuel'       => 'node["amenity"="fuel"]',
            'parking'    => 'node["amenity"="parking"]',
            'restaurant' => 'node["amenity"="restaurant"]',
            'hotel'      => 'node["tourism"="hotel"]',
            'embassy'    => 'node["amenity"="embassy"]',
        ];

        // Also query ways (buildings) for categories that are often mapped as areas
        $wayCategories = ['hospital', 'police', 'fire', 'school', 'hotel', 'embassy', 'parking'];

        $bbox = "{$south},{$west},{$north},{$east}";
        $queries = [];
        foreach ($categories as $cat) {
            $cat = trim($cat);
            if (!isset($categoryMap[$cat])) continue;
            $queries[] = $categoryMap[$cat] . "({$bbox});";
            if (in_array($cat, $wayCategories)) {
                $queries[] = str_replace('node[', 'way[', $categoryMap[$cat]) . "({$bbox});";
            }
        }

        if (empty($queries)) {
            return ['pois' => [], 'source' => 'error', 'error' => 'No valid categories'];
        }

        $overpassQuery = "[out:json][timeout:15];\n(\n" . implode("\n", $queries) . "\n);\nout center tags 200;";

        try {
            $response = Http::timeout(15)
                ->withHeaders(['Content-Type' => 'application/x-www-form-urlencoded'])
                ->asForm()
                ->post('https://overpass-api.de/api/interpreter', [
                    'data' => $overpassQuery,
                ]);

            if (!$response->successful()) {
                Log::warning('Overpass API error', ['status' => $response->status()]);
                return ['pois' => [], 'source' => 'error', 'error' => 'Overpass returned ' . $response->status()];
            }

            $body = $response->json();
            $elements = $body['elements'] ?? [];

            $pois = collect($elements)->map(function ($el) use ($categoryMap) {
                $tags = $el['tags'] ?? [];
                $name = $tags['name'] ?? $tags['name:en'] ?? $tags['operator'] ?? '';
                if (!$name) return null;

                // Get coordinates (nodes have lat/lng, ways have center)
                $lat = $el['lat'] ?? ($el['center']['lat'] ?? null);
                $lng = $el['lon'] ?? ($el['center']['lon'] ?? null);
                if (!$lat || !$lng) return null;

                // Determine category
                $category = 'other';
                $subcategory = '';
                foreach (['hospital', 'police', 'fire_station', 'pharmacy', 'bank', 'atm', 'school', 'fuel', 'parking', 'restaurant', 'embassy'] as $amenity) {
                    if (($tags['amenity'] ?? '') === $amenity) {
                        $category = $amenity === 'fire_station' ? 'fire' : $amenity;
                        $subcategory = $amenity;
                        break;
                    }
                }
                if (($tags['tourism'] ?? '') === 'hotel') { $category = 'hotel'; $subcategory = 'hotel'; }

                return [
                    'id' => $el['id'] ?? 0,
                    'name' => $name,
                    'lat' => round((float) $lat, 6),
                    'lng' => round((float) $lng, 6),
                    'category' => $category,
                    'subcategory' => $subcategory,
                    'address' => trim(($tags['addr:street'] ?? '') . ' ' . ($tags['addr:housenumber'] ?? '')),
                    'phone' => $tags['phone'] ?? $tags['contact:phone'] ?? '',
                    'website' => $tags['website'] ?? $tags['contact:website'] ?? '',
                    'openingHours' => $tags['opening_hours'] ?? '',
                    'wheelchair' => $tags['wheelchair'] ?? '',
                    'operator' => $tags['operator'] ?? '',
                ];
            })->filter()->values()->toArray();

            Log::info('Overpass fetch', ['pois' => count($pois), 'categories' => implode(',', array_keys($categoryMap))]);

            return [
                'pois' => $pois,
                'source' => 'live',
                'count' => count($pois),
                'time' => now()->toISOString(),
            ];
        } catch (\Exception $e) {
            Log::error('Overpass fetch failed', ['error' => $e->getMessage()]);
            return ['pois' => [], 'source' => 'error', 'error' => $e->getMessage()];
        }
    }
}
