<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class CesiumController extends Controller
{
    /**
     * Return Cesium ion configuration (token + asset IDs).
     * GET /mock-api/cesium/config
     */
    public function config(): JsonResponse
    {
        $token = $this->getToken();

        return response()->json([
            'token' => $token,
            'hasToken' => !empty($token),
            'assets' => [
                'worldTerrain' => 1,          // Cesium World Terrain (built-in asset)
                'osmBuildings' => 96188,      // Cesium OSM Buildings (built-in asset)
                'bingImagery' => 2,           // Bing Maps Aerial imagery
            ],
            'defaults' => [
                'requestWaterMask' => true,
                'requestVertexNormals' => true,
                'enableLighting' => true,
                'shadows' => true,
                'fog' => true,
                'msaaSamples' => 4,
            ],
            'setup' => empty($token)
                ? 'Add CESIUM_ION_TOKEN to .env or cesium_ion_token to credentials.json. Free account: https://ion.cesium.com/signup'
                : null,
        ]);
    }

    /**
     * Resolve Cesium ion access token from multiple sources.
     */
    private function getToken(): string
    {
        // Priority 1: .env
        $token = env('CESIUM_ION_TOKEN', '');
        if (!empty($token)) return $token;

        // Priority 2: config
        $token = config('services.cesium.token', '');
        if (!empty($token)) return $token;

        // Priority 3: credentials.json
        $credPath = base_path('credentials.json');
        if (file_exists($credPath)) {
            try {
                $creds = json_decode(file_get_contents($credPath), true);
                $token = $creds['cesium_ion_token'] ?? '';
                if (!empty($token)) return $token;
            } catch (\Exception $e) {
                Log::warning('Failed to read cesium token from credentials.json', ['error' => $e->getMessage()]);
            }
        }

        return '';
    }
}
