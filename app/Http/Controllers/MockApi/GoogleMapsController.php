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
}
