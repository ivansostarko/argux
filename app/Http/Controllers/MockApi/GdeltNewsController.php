<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GdeltNewsController extends Controller
{
    /**
     * Fetch geolocated news from GDELT GEO 2.0 API.
     * Returns GeoJSON FeatureCollection of news article locations.
     *
     * GET /mock-api/news/geo?query=...&timespan=24h&maxpoints=250&sort=date
     */
    public function geo(Request $request): JsonResponse
    {
        $query     = $request->string('query', '')->toString();
        $timespan  = $request->string('timespan', '24h')->toString();
        $maxpoints = (int) $request->input('maxpoints', 250);
        $sort      = $request->string('sort', 'date')->toString();
        $theme     = $request->string('theme', '')->toString();
        $country   = $request->string('country', '')->toString();
        $lang      = $request->string('lang', '')->toString();

        // Build GDELT query string
        $q = $query ?: '*';
        if ($theme) $q .= " theme:{$theme}";
        if ($country) $q .= " sourcecountry:{$country}";
        if ($lang) $q .= " sourcelang:{$lang}";

        $cacheKey = 'gdelt_geo_' . md5("{$q}_{$timespan}_{$maxpoints}_{$sort}");

        $data = Cache::remember($cacheKey, 300, function () use ($q, $timespan, $maxpoints, $sort) {
            try {
                $url = 'https://api.gdeltproject.org/api/v2/geo/geo?' . http_build_query([
                    'query'     => $q,
                    'mode'      => 'PointData',
                    'format'    => 'GeoJSON',
                    'timespan'  => $timespan,
                    'maxpoints' => min($maxpoints, 500),
                    'sort'      => $sort,
                ]);

                $response = Http::timeout(15)
                    ->withHeaders(['Accept' => 'application/json'])
                    ->get($url);

                if ($response->successful()) {
                    $body = $response->body();
                    $json = json_decode($body, true);

                    // GDELT may return valid GeoJSON or wrapped JSON
                    if ($json && isset($json['features'])) {
                        return [
                            'type' => 'FeatureCollection',
                            'features' => $json['features'],
                            'meta' => [
                                'query' => $q,
                                'timespan' => $timespan,
                                'count' => count($json['features']),
                                'source' => 'GDELT GEO 2.0 API',
                                'fetched_at' => now()->toISOString(),
                            ],
                        ];
                    }

                    // Try parsing as raw GeoJSON text
                    return [
                        'type' => 'FeatureCollection',
                        'features' => [],
                        'meta' => [
                            'query' => $q,
                            'timespan' => $timespan,
                            'count' => 0,
                            'source' => 'GDELT GEO 2.0 API',
                            'note' => 'No parseable GeoJSON features returned',
                            'fetched_at' => now()->toISOString(),
                        ],
                    ];
                }

                Log::warning('GDELT GEO API non-200', ['status' => $response->status()]);
                return ['type' => 'FeatureCollection', 'features' => [], 'meta' => ['error' => 'GDELT returned ' . $response->status()]];
            } catch (\Exception $e) {
                Log::error('GDELT GEO fetch failed', ['error' => $e->getMessage()]);
                return ['type' => 'FeatureCollection', 'features' => [], 'meta' => ['error' => $e->getMessage()]];
            }
        });

        return response()->json($data);
    }

    /**
     * Fetch article list from GDELT DOC 2.0 API.
     * Returns articles with URL, title, image, date, domain, language, country.
     *
     * GET /mock-api/news/articles?query=...&timespan=24h&maxrecords=75
     */
    public function articles(Request $request): JsonResponse
    {
        $query      = $request->string('query', '')->toString();
        $timespan   = $request->string('timespan', '24h')->toString();
        $maxrecords = (int) $request->input('maxrecords', 75);
        $theme      = $request->string('theme', '')->toString();
        $country    = $request->string('country', '')->toString();
        $lang       = $request->string('lang', '')->toString();
        $sort       = $request->string('sort', 'DateDesc')->toString();

        $q = $query ?: '*';
        if ($theme) $q .= " theme:{$theme}";
        if ($country) $q .= " sourcecountry:{$country}";
        if ($lang) $q .= " sourcelang:{$lang}";

        $cacheKey = 'gdelt_doc_' . md5("{$q}_{$timespan}_{$maxrecords}_{$sort}");

        $data = Cache::remember($cacheKey, 300, function () use ($q, $timespan, $maxrecords, $sort) {
            try {
                $url = 'https://api.gdeltproject.org/api/v2/doc/doc?' . http_build_query([
                    'query'      => $q,
                    'mode'       => 'ArtList',
                    'format'     => 'json',
                    'timespan'   => $timespan,
                    'maxrecords' => min($maxrecords, 250),
                    'sort'       => $sort,
                ]);

                $response = Http::timeout(15)
                    ->withHeaders(['Accept' => 'application/json'])
                    ->get($url);

                if ($response->successful()) {
                    $json = $response->json();
                    $articles = $json['articles'] ?? [];

                    return [
                        'articles' => array_map(function ($a) {
                            return [
                                'url'           => $a['url'] ?? '',
                                'url_mobile'    => $a['url_mobile'] ?? '',
                                'title'         => $a['title'] ?? 'Untitled',
                                'seendate'      => $a['seendate'] ?? '',
                                'socialimage'   => $a['socialimage'] ?? '',
                                'domain'        => $a['domain'] ?? '',
                                'language'       => $a['language'] ?? '',
                                'sourcecountry' => $a['sourcecountry'] ?? '',
                            ];
                        }, array_slice($articles, 0, $maxrecords)),
                        'meta' => [
                            'query' => $q,
                            'timespan' => $timespan,
                            'count' => count($articles),
                            'source' => 'GDELT DOC 2.0 API',
                            'fetched_at' => now()->toISOString(),
                        ],
                    ];
                }

                return ['articles' => [], 'meta' => ['error' => 'GDELT returned ' . $response->status()]];
            } catch (\Exception $e) {
                Log::error('GDELT DOC fetch failed', ['error' => $e->getMessage()]);
                return ['articles' => [], 'meta' => ['error' => $e->getMessage()]];
            }
        });

        return response()->json($data);
    }

    /**
     * Get heatmap data from GDELT GEO 2.0 API (up to 25,000 points).
     *
     * GET /mock-api/news/heatmap?query=...&timespan=24h
     */
    public function heatmap(Request $request): JsonResponse
    {
        $query    = $request->string('query', '')->toString();
        $timespan = $request->string('timespan', '24h')->toString();
        $theme    = $request->string('theme', '')->toString();
        $country  = $request->string('country', '')->toString();

        $q = $query ?: '*';
        if ($theme) $q .= " theme:{$theme}";
        if ($country) $q .= " sourcecountry:{$country}";

        $cacheKey = 'gdelt_heatmap_' . md5("{$q}_{$timespan}");

        $data = Cache::remember($cacheKey, 600, function () use ($q, $timespan) {
            try {
                $url = 'https://api.gdeltproject.org/api/v2/geo/geo?' . http_build_query([
                    'query'    => $q,
                    'mode'     => 'PointHeatmap',
                    'format'   => 'GeoJSON',
                    'timespan' => $timespan,
                ]);

                $response = Http::timeout(20)->get($url);

                if ($response->successful()) {
                    $json = json_decode($response->body(), true);
                    if ($json && isset($json['features'])) {
                        return [
                            'type' => 'FeatureCollection',
                            'features' => $json['features'],
                            'meta' => ['query' => $q, 'count' => count($json['features']), 'source' => 'GDELT GEO 2.0 Heatmap'],
                        ];
                    }
                }

                return ['type' => 'FeatureCollection', 'features' => [], 'meta' => ['error' => 'No data']];
            } catch (\Exception $e) {
                return ['type' => 'FeatureCollection', 'features' => [], 'meta' => ['error' => $e->getMessage()]];
            }
        });

        return response()->json($data);
    }
}
