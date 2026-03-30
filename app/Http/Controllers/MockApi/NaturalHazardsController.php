<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NaturalHazardsController extends Controller
{
    /**
     * USGS Earthquake GeoJSON feed. 100% free, no API key, native GeoJSON.
     * GET /mock-api/hazards/earthquakes?feed=2.5_day
     *
     * Feed options: all_hour, 1.0_hour, 2.5_hour, 4.5_hour, significant_hour,
     *               all_day, 1.0_day, 2.5_day, 4.5_day, significant_day,
     *               all_week, 1.0_week, 2.5_week, 4.5_week, significant_week,
     *               all_month, 1.0_month, 2.5_month, 4.5_month, significant_month
     */
    public function earthquakes(Request $request): JsonResponse
    {
        $feed = $request->string('feed', '2.5_day')->toString();

        // Whitelist valid feeds
        $validFeeds = [
            'all_hour', '1.0_hour', '2.5_hour', '4.5_hour', 'significant_hour',
            'all_day', '1.0_day', '2.5_day', '4.5_day', 'significant_day',
            'all_week', '1.0_week', '2.5_week', '4.5_week', 'significant_week',
            'all_month', '1.0_month', '2.5_month', '4.5_month', 'significant_month',
        ];
        if (!in_array($feed, $validFeeds)) $feed = '2.5_day';

        $cacheKey = "usgs_eq_{$feed}";
        $cacheTTL = str_contains($feed, 'hour') ? 120 : (str_contains($feed, 'day') ? 300 : 600);

        $data = Cache::remember($cacheKey, $cacheTTL, function () use ($feed) {
            try {
                $url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/{$feed}.geojson";
                $response = Http::timeout(20)->get($url);

                if ($response->successful()) {
                    $json = $response->json();
                    return [
                        'type' => 'FeatureCollection',
                        'features' => $json['features'] ?? [],
                        'metadata' => $json['metadata'] ?? [],
                        'meta' => [
                            'feed' => $feed,
                            'count' => $json['metadata']['count'] ?? count($json['features'] ?? []),
                            'source' => 'USGS Earthquake Hazards Program',
                            'url' => $url,
                            'fetched_at' => now()->toISOString(),
                        ],
                    ];
                }

                return ['type' => 'FeatureCollection', 'features' => [], 'meta' => ['error' => 'USGS returned ' . $response->status()]];
            } catch (\Exception $e) {
                Log::error('USGS earthquake fetch failed', ['error' => $e->getMessage()]);
                return ['type' => 'FeatureCollection', 'features' => [], 'meta' => ['error' => $e->getMessage()]];
            }
        });

        return response()->json($data);
    }

    /**
     * NASA FIRMS active fires. Requires MAP_KEY (free registration).
     * GET /mock-api/hazards/fires?area=world&days=1&source=VIIRS_NOAA20_NRT
     *
     * Returns CSV converted to GeoJSON.
     */
    public function fires(Request $request): JsonResponse
    {
        $area   = $request->string('area', 'world')->toString();
        $days   = min(max((int) $request->input('days', 1), 1), 10);
        $source = $request->string('source', 'VIIRS_NOAA20_NRT')->toString();

        $mapKey = $this->getFirmsKey();

        if (!$mapKey) {
            return response()->json([
                'type' => 'FeatureCollection',
                'features' => [],
                'meta' => [
                    'error' => 'No NASA FIRMS MAP_KEY configured',
                    'setup' => 'Get a free key at https://firms.modaps.eosdis.nasa.gov/api/map_key/ then add NASA_FIRMS_KEY to .env',
                ],
            ]);
        }

        $validSources = ['VIIRS_NOAA20_NRT', 'VIIRS_NOAA21_NRT', 'VIIRS_SNPP_NRT', 'MODIS_NRT'];
        if (!in_array($source, $validSources)) $source = 'VIIRS_NOAA20_NRT';

        $cacheKey = "firms_{$source}_{$area}_{$days}";

        $data = Cache::remember($cacheKey, 600, function () use ($mapKey, $source, $area, $days) {
            try {
                $url = "https://firms.modaps.eosdis.nasa.gov/api/area/csv/{$mapKey}/{$source}/{$area}/{$days}";
                $response = Http::timeout(30)->get($url);

                if ($response->successful()) {
                    $csv = $response->body();
                    $lines = explode("\n", trim($csv));

                    if (count($lines) < 2) {
                        return ['type' => 'FeatureCollection', 'features' => [], 'meta' => ['count' => 0, 'source' => 'NASA FIRMS']];
                    }

                    $headers = str_getcsv(array_shift($lines));
                    $latIdx  = array_search('latitude', $headers);
                    $lngIdx  = array_search('longitude', $headers);
                    $brIdx   = array_search('bright_ti4', $headers) ?: array_search('brightness', $headers);
                    $confIdx = array_search('confidence', $headers);
                    $dateIdx = array_search('acq_date', $headers);
                    $timeIdx = array_search('acq_time', $headers);
                    $frpIdx  = array_search('frp', $headers);
                    $satIdx  = array_search('satellite', $headers);
                    $dnIdx   = array_search('daynight', $headers);

                    if ($latIdx === false || $lngIdx === false) {
                        return ['type' => 'FeatureCollection', 'features' => [], 'meta' => ['error' => 'Unexpected CSV format']];
                    }

                    $features = [];
                    // Limit to 2000 features for performance
                    foreach (array_slice($lines, 0, 2000) as $i => $line) {
                        if (empty(trim($line))) continue;
                        $cols = str_getcsv($line);
                        $lat = (float) ($cols[$latIdx] ?? 0);
                        $lng = (float) ($cols[$lngIdx] ?? 0);
                        if ($lat == 0 && $lng == 0) continue;

                        $features[] = [
                            'type' => 'Feature',
                            'geometry' => ['type' => 'Point', 'coordinates' => [$lng, $lat]],
                            'properties' => [
                                'brightness' => (float) ($cols[$brIdx] ?? 0),
                                'confidence' => $cols[$confIdx] ?? '',
                                'acq_date' => $cols[$dateIdx] ?? '',
                                'acq_time' => $cols[$timeIdx] ?? '',
                                'frp' => (float) ($cols[$frpIdx] ?? 0),
                                'satellite' => $cols[$satIdx] ?? '',
                                'daynight' => $cols[$dnIdx] ?? '',
                            ],
                        ];
                    }

                    return [
                        'type' => 'FeatureCollection',
                        'features' => $features,
                        'meta' => [
                            'source_name' => $source,
                            'area' => $area,
                            'days' => $days,
                            'count' => count($features),
                            'total_csv_rows' => count($lines),
                            'source' => 'NASA FIRMS (LANCE)',
                            'fetched_at' => now()->toISOString(),
                        ],
                    ];
                }

                return ['type' => 'FeatureCollection', 'features' => [], 'meta' => ['error' => 'FIRMS returned ' . $response->status()]];
            } catch (\Exception $e) {
                Log::error('NASA FIRMS fetch failed', ['error' => $e->getMessage()]);
                return ['type' => 'FeatureCollection', 'features' => [], 'meta' => ['error' => $e->getMessage()]];
            }
        });

        return response()->json($data);
    }

    private function getFirmsKey(): string
    {
        $key = env('NASA_FIRMS_KEY', '');
        if (!empty($key)) return $key;

        $key = config('services.nasa.firms_key', '');
        if (!empty($key)) return $key;

        $credPath = base_path('credentials.json');
        if (file_exists($credPath)) {
            try {
                $creds = json_decode(file_get_contents($credPath), true);
                return $creds['nasa_firms_key'] ?? '';
            } catch (\Exception $e) {}
        }
        return '';
    }
}
