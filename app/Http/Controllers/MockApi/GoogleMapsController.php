<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleMapsController extends Controller
{
    /**
     * Create a Map Tiles API session token for 2D/3D tile fetching.
     * POST /mock-api/google-maps/session
     */
    public function createSession(Request $request): JsonResponse
    {
        $apiKey = $this->getApiKey();

        if (!$apiKey) {
            return response()->json([
                'error' => 'No Google Maps API key configured',
                'setup' => 'Add GOOGLE_MAPS_API_KEY to .env or google_maps_key to credentials.json',
            ], 200);
        }

        // Cache session for 24 hours (Google sessions last indefinitely until expired)
        $mapType = $request->string('mapType', 'satellite');
        $cacheKey = "gmaps_session_{$mapType}";

        $session = Cache::get($cacheKey);
        if ($session) {
            return response()->json([
                'session' => $session,
                'apiKey' => $apiKey,
                'source' => 'cached',
            ]);
        }

        try {
            $response = Http::post(
                "https://tile.googleapis.com/v1/createSession?key={$apiKey}",
                [
                    'mapType' => $mapType,
                    'language' => 'en-US',
                    'region' => 'US',
                    'imageFormat' => 'jpeg',
                    'highDpi' => true,
                    'scale' => 'scaleFactor2x',
                    'overlay' => false,
                    'layerTypes' => ['layerRoadmap'],
                ]
            );

            if (!$response->successful()) {
                Log::warning('Google Maps session creation failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return response()->json([
                    'error' => 'Session creation failed: ' . $response->status(),
                    'apiKey' => $apiKey,
                ], 200);
            }

            $data = $response->json();
            $sessionToken = $data['session'] ?? null;

            if ($sessionToken) {
                Cache::put($cacheKey, $sessionToken, 86400); // 24h
                Log::info('Google Maps session created', ['mapType' => $mapType]);
            }

            return response()->json([
                'session' => $sessionToken,
                'apiKey' => $apiKey,
                'source' => 'fresh',
            ]);
        } catch (\Exception $e) {
            Log::error('Google Maps session error', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => $e->getMessage(),
                'apiKey' => $apiKey,
            ], 200);
        }
    }

    /**
     * Return the Google Maps API key and available tile endpoints.
     * GET /mock-api/google-maps/config
     */
    public function config(): JsonResponse
    {
        $apiKey = $this->getApiKey();

        return response()->json([
            'hasKey' => !empty($apiKey),
            'apiKey' => $apiKey ?: null,
            'endpoints' => [
                'satellite' => $apiKey
                    ? "https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?key={$apiKey}&mapType=satellite"
                    : 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
                'hybrid' => $apiKey
                    ? "https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?key={$apiKey}&mapType=satelliteHybrid"
                    : 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
                'roadmap' => $apiKey
                    ? "https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?key={$apiKey}&mapType=roadmap"
                    : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
                'terrain' => $apiKey
                    ? "https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?key={$apiKey}&mapType=terrain"
                    : 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
            ],
        ]);
    }

    private function getApiKey(): string
    {
        // Priority 1: .env
        $key = config('services.google_maps.key', env('GOOGLE_MAPS_API_KEY', ''));
        if ($key) return $key;

        // Priority 2: credentials.json
        $credPath = base_path('credentials.json');
        if (file_exists($credPath)) {
            try {
                $json = json_decode(file_get_contents($credPath), true);
                if (isset($json['google_maps_key'])) return $json['google_maps_key'];
                if (isset($json['google_maps_api_key'])) return $json['google_maps_api_key'];
            } catch (\Exception $e) {}
        }

        return '';
    }

    /**
     * Lookup Aerial View video for an address.
     * GET /mock-api/google-maps/aerial?address=...
     */
    public function aerialView(Request $request): JsonResponse
    {
        $address = $request->string('address', '');
        if (empty($address)) {
            return response()->json(['error' => 'Address required', 'state' => 'ADDRESS_REQUIRED'], 400);
        }

        $apiKey = $this->getApiKey();
        if (!$apiKey) {
            return response()->json(['error' => 'No API key', 'state' => 'NO_API_KEY', 'setup' => 'Add GOOGLE_MAPS_API_KEY to .env'], 200);
        }

        $cacheKey = 'aerial_' . md5($address);
        $data = Cache::remember($cacheKey, 3600, function () use ($apiKey, $address) {
            try {
                // Step 1: Lookup existing video
                $lookupRes = Http::timeout(10)->get(
                    "https://aerialview.googleapis.com/v1/videos:lookupVideo",
                    ['key' => $apiKey, 'address' => $address]
                );

                if ($lookupRes->successful()) {
                    $body = $lookupRes->json();
                    $state = $body['state'] ?? 'UNKNOWN';

                    if ($state === 'ACTIVE') {
                        // Video exists — extract video URIs
                        $uris = $body['uris'] ?? [];
                        $metadata = $body['metadata'] ?? [];
                        return [
                            'state' => 'ACTIVE',
                            'videoId' => $body['videoId'] ?? '',
                            'uris' => $uris,
                            'metadata' => $metadata,
                            'landscapeUrl' => $uris['MP4_MEDIUM']['landscapeUri'] ?? $uris['MP4_LOW']['landscapeUri'] ?? '',
                            'portraitUrl' => $uris['MP4_MEDIUM']['portraitUri'] ?? $uris['MP4_LOW']['portraitUri'] ?? '',
                            'duration' => $metadata['duration'] ?? '',
                            'address' => $address,
                        ];
                    }

                    return ['state' => $state, 'address' => $address, 'message' => 'Video not yet available'];
                }

                // Step 2: If 404, try requesting render
                if ($lookupRes->status() === 404) {
                    $renderRes = Http::timeout(10)->post(
                        "https://aerialview.googleapis.com/v1/videos:renderVideo?key={$apiKey}",
                        ['address' => $address]
                    );

                    if ($renderRes->successful()) {
                        $renderBody = $renderRes->json();
                        return [
                            'state' => $renderBody['state'] ?? 'PROCESSING',
                            'videoId' => $renderBody['videoId'] ?? '',
                            'address' => $address,
                            'message' => 'Video render requested — check back in a few minutes',
                        ];
                    }
                }

                return ['state' => 'NOT_AVAILABLE', 'address' => $address, 'message' => 'Aerial View not available for this address'];
            } catch (\Exception $e) {
                Log::error('Aerial View failed', ['error' => $e->getMessage(), 'address' => $address]);
                return ['state' => 'ERROR', 'error' => $e->getMessage(), 'address' => $address];
            }
        });

        return response()->json($data);
    }
}
