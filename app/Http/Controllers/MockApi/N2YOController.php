<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class N2YOController extends Controller
{
    /**
     * N2YO API proxy — fetches satellites above observer location by category.
     * GET /mock-api/n2yo/above?lat=45.81&lng=15.98&radius=70&category=0
     *
     * Category IDs: 0=all, 2=ISS, 3=Weather, 10=GEO, 15=Iridium, 20=GPS, 21=GLONASS,
     * 22=Galileo, 26=Science, 30=Military, 35=BeiDou, 52=Starlink, 54=CSS
     */
    public function above(Request $request): JsonResponse
    {
        $apiKey = config('services.n2yo.key', env('N2YO_API_KEY', ''));
        if (!$apiKey) {
            return response()->json([
                'satellites' => [],
                'source' => 'error',
                'error' => 'N2YO_API_KEY not configured',
            ]);
        }

        $lat = $request->float('lat', 45.8131);
        $lng = $request->float('lng', 15.9775);
        $alt = $request->integer('alt', 0);
        $radius = $request->integer('radius', 70); // search radius in degrees
        $categories = array_filter(array_map('intval', explode(',', $request->string('categories', '0')->toString())));
        if (empty($categories)) $categories = [0];

        $allSats = [];
        $seen = [];
        $errors = [];

        foreach ($categories as $catId) {
            $cacheKey = "n2yo_above_{$lat}_{$lng}_{$radius}_{$catId}";
            try {
                $data = Cache::remember($cacheKey, 60, function () use ($lat, $lng, $alt, $radius, $catId, $apiKey) {
                    $url = "https://api.n2yo.com/rest/v1/satellite/above/{$lat}/{$lng}/{$alt}/{$radius}/{$catId}&apiKey={$apiKey}";
                    $response = Http::timeout(10)->get($url);
                    if (!$response->successful()) throw new \Exception("HTTP {$response->status()}");
                    return $response->json();
                });

                if (isset($data['above']) && is_array($data['above'])) {
                    foreach ($data['above'] as $sat) {
                        $nid = (int) ($sat['satid'] ?? 0);
                        if (!$nid || isset($seen[$nid])) continue;
                        $seen[$nid] = true;
                        $allSats[] = $this->normalize($sat, $catId);
                    }
                }
            } catch (\Exception $e) {
                $errors[] = "cat{$catId}: " . $e->getMessage();
                Log::warning("N2YO fetch failed: cat {$catId}", ['error' => $e->getMessage()]);
            }
        }

        return response()->json([
            'satellites' => array_values($allSats),
            'source' => count($allSats) > 0 ? 'n2yo' : 'error',
            'count' => count($allSats),
            'errors' => $errors,
            'time' => now()->toISOString(),
        ]);
    }

    /**
     * N2YO positions endpoint — get future positions for a specific satellite.
     * GET /mock-api/n2yo/positions?norad_id=25544&seconds=300
     */
    public function positions(Request $request): JsonResponse
    {
        $apiKey = config('services.n2yo.key', env('N2YO_API_KEY', ''));
        if (!$apiKey) {
            return response()->json(['positions' => [], 'source' => 'error', 'error' => 'N2YO_API_KEY not configured']);
        }

        $noradId = $request->integer('norad_id', 25544);
        $lat = $request->float('lat', 45.8131);
        $lng = $request->float('lng', 15.9775);
        $alt = $request->integer('alt', 0);
        $seconds = min($request->integer('seconds', 300), 300);

        try {
            $url = "https://api.n2yo.com/rest/v1/satellite/positions/{$noradId}/{$lat}/{$lng}/{$alt}/{$seconds}&apiKey={$apiKey}";
            $response = Http::timeout(10)->get($url);
            if (!$response->successful()) throw new \Exception("HTTP {$response->status()}");
            $data = $response->json();

            return response()->json([
                'info' => $data['info'] ?? [],
                'positions' => $data['positions'] ?? [],
                'source' => 'n2yo',
            ]);
        } catch (\Exception $e) {
            return response()->json(['positions' => [], 'source' => 'error', 'error' => $e->getMessage()]);
        }
    }

    private function normalize(array $sat, int $catId): array
    {
        $name = trim($sat['satname'] ?? '');
        return [
            'noradId' => (int) ($sat['satid'] ?? 0),
            'name' => $name,
            'intlDesignator' => $sat['intDesignator'] ?? '',
            'lat' => round((float) ($sat['satlat'] ?? 0), 4),
            'lng' => round((float) ($sat['satlng'] ?? 0), 4),
            'alt' => round((float) ($sat['satalt'] ?? 0)),
            'velocity' => 0, // N2YO above endpoint doesn't return velocity
            'inclination' => 0,
            'period' => 0,
            'category' => $this->catFromId($catId, $name),
            'country' => '',
            'launchDate' => $sat['launchDate'] ?? '',
            'status' => 'active',
            'orbitType' => $this->orbitFromAlt((float) ($sat['satalt'] ?? 0)),
            'source' => 'n2yo',
        ];
    }

    private function catFromId(int $id, string $name): string
    {
        if (str_contains($name, 'ISS') || str_contains($name, 'TIANHE') || $id === 2 || $id === 54) return 'space-station';
        if (str_contains($name, 'STARLINK') || $id === 52) return 'starlink';
        if ($id === 20 || $id === 21 || $id === 22 || $id === 35) return 'navigation';
        if ($id === 3) return 'weather';
        if ($id === 30) return 'military';
        if ($id === 26) return 'scientific';
        if ($id === 10) return 'communication';
        if ($id === 15 || $id === 17) return 'communication';
        return 'communication';
    }

    private function orbitFromAlt(float $alt): string
    {
        if ($alt > 34000) return 'GEO';
        if ($alt > 1500) return 'MEO';
        return 'LEO';
    }
}
