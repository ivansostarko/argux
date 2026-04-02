<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CelesTrakController extends Controller
{
    /**
     * Fetch satellite positions from CelesTrak GP data.
     * GET /mock-api/satellites?groups=stations,active,visual&limit=200
     */
    public function index(Request $request): JsonResponse
    {
        $groupsRaw = $request->string('groups', 'stations,active,weather,resource,science,military,navigation-gps-ops,last-30-days')->toString();
        $limit = min($request->integer('limit', 150), 500);

        $groups = array_filter(array_map('trim', explode(',', $groupsRaw)));
        if (empty($groups)) $groups = ['stations', 'active'];

        $cacheKey = 'celestrak_multi_' . md5($groupsRaw) . "_{$limit}";

        $data = Cache::remember($cacheKey, 180, function () use ($groups, $limit) {
            return $this->fetchMultipleGroups($groups, $limit);
        });

        return response()->json($data);
    }

    private function fetchMultipleGroups(array $groups, int $limit): array
    {
        $allSatellites = [];
        $seen = [];
        $errors = [];

        foreach ($groups as $group) {
            try {
                $url = "https://celestrak.org/NORAD/elements/gp.php";
                $response = Http::timeout(12)->get($url, [
                    'GROUP' => $group,
                    'FORMAT' => 'json',
                ]);

                if (!$response->successful()) {
                    $errors[] = "{$group}: HTTP {$response->status()}";
                    continue;
                }

                $gpData = $response->json();
                if (!is_array($gpData)) continue;

                foreach (array_slice($gpData, 0, 80) as $gp) {
                    $sat = $this->gpToPosition($gp);
                    if (!$sat) continue;
                    if (isset($seen[$sat['noradId']])) continue;
                    $seen[$sat['noradId']] = true;
                    $allSatellites[] = $sat;
                }
            } catch (\Exception $e) {
                $errors[] = "{$group}: " . $e->getMessage();
                Log::warning("CelesTrak group fetch failed: {$group}", ['error' => $e->getMessage()]);
            }
        }

        // Sort: space-stations first, then by altitude descending
        usort($allSatellites, function ($a, $b) {
            if ($a['category'] === 'space-station' && $b['category'] !== 'space-station') return -1;
            if ($b['category'] === 'space-station' && $a['category'] !== 'space-station') return 1;
            return $b['alt'] - $a['alt'];
        });

        $allSatellites = array_slice($allSatellites, 0, $limit);

        Log::info('CelesTrak multi-group fetch', [
            'groups' => $groups,
            'total' => count($allSatellites),
            'errors' => count($errors),
        ]);

        return [
            'satellites' => array_values($allSatellites),
            'source' => count($allSatellites) > 0 ? 'live' : (count($errors) > 0 ? 'error' : 'empty'),
            'count' => count($allSatellites),
            'groups' => $groups,
            'errors' => $errors,
            'time' => now()->toISOString(),
        ];
    }

    /**
     * Convert GP orbital elements to approximate lat/lng position.
     */
    private function gpToPosition(array $gp): ?array
    {
        $name = trim($gp['OBJECT_NAME'] ?? '');
        $noradId = (int) ($gp['NORAD_CAT_ID'] ?? 0);
        if (!$name || !$noradId) return null;

        $inclination = (float) ($gp['INCLINATION'] ?? 0);
        $meanMotion = (float) ($gp['MEAN_MOTION'] ?? 15);
        $eccentricity = (float) ($gp['ECCENTRICITY'] ?? 0);
        $epoch = $gp['EPOCH'] ?? now()->toISOString();
        $raan = (float) ($gp['RA_OF_ASC_NODE'] ?? 0);
        $argPeri = (float) ($gp['ARG_OF_PERICENTER'] ?? 0);
        $meanAnomaly = (float) ($gp['MEAN_ANOMALY'] ?? 0);
        $intlDes = $gp['OBJECT_ID'] ?? '';
        $country = $gp['COUNTRY_CODE'] ?? '';
        $launchDate = $gp['LAUNCH_DATE'] ?? '';
        $rcsSize = $gp['RCS_SIZE'] ?? null;
        $objectType = $gp['OBJECT_TYPE'] ?? 'PAYLOAD';

        // Derive semi-major axis and altitude from mean motion (Kepler's 3rd law)
        $period = 1440.0 / max($meanMotion, 0.01); // minutes
        $semiMajorKm = pow(398600.4418 * pow($period * 60 / (2 * M_PI), 2), 1.0 / 3.0);
        $alt = max(0, $semiMajorKm - 6371);

        // Propagate position from epoch to now (simplified, not SGP4)
        $now = now();
        try { $epochTime = \Carbon\Carbon::parse($epoch); } catch (\Exception $e) { $epochTime = now(); }
        $elapsedMin = $now->diffInSeconds($epochTime) / 60.0;
        $currentAnomaly = fmod($meanAnomaly + ($meanMotion * 360.0 / 1440.0) * $elapsedMin, 360.0);
        $currentRaan = fmod($raan - 0.0042 * $elapsedMin, 360.0);

        // Orbital elements to geodetic lat/lng (simplified)
        $argLat = deg2rad($currentAnomaly + $argPeri);
        $raanRad = deg2rad($currentRaan);
        $incRad = deg2rad($inclination);

        $lat = rad2deg(asin(sin($incRad) * sin($argLat)));
        $lng = rad2deg($raanRad + atan2(cos($incRad) * sin($argLat), cos($argLat)));
        $gmst = fmod(280.46061837 + 360.98564736629 * ($now->julianDay() - 2451545.0), 360.0);
        $lng = fmod($lng - $gmst + 540, 360) - 180;

        $velocity = 2 * M_PI * $semiMajorKm / ($period * 60);

        return [
            'noradId' => $noradId,
            'name' => $name,
            'intlDesignator' => $intlDes,
            'lat' => round($lat, 4),
            'lng' => round($lng, 4),
            'alt' => round($alt, 0),
            'velocity' => round($velocity, 2),
            'inclination' => round($inclination, 1),
            'period' => round($period, 1),
            'category' => $this->categorize($name, $objectType, $alt),
            'country' => $country,
            'launchDate' => $launchDate,
            'status' => $objectType === 'DEBRIS' ? 'decayed' : ($objectType === 'ROCKET BODY' ? 'inactive' : 'active'),
            'orbitType' => $this->orbitType($alt, $inclination, $period),
            'rcsSize' => $rcsSize,
            'objectType' => $objectType,
        ];
    }

    private function categorize(string $name, string $type, float $alt): string
    {
        if (str_contains($name, 'ISS') || str_contains($name, 'TIANHE') || str_contains($name, 'CSS') || str_contains($name, 'TIANGONG')) return 'space-station';
        if ($type === 'DEBRIS' || $type === 'ROCKET BODY' || str_contains($name, 'DEB') || str_contains($name, 'R/B')) return 'debris';
        if (str_contains($name, 'STARLINK') || str_contains($name, 'ONEWEB')) return 'starlink';
        if (str_contains($name, 'GPS') || str_contains($name, 'NAVSTAR') || str_contains($name, 'GLONASS') || str_contains($name, 'GALILEO') || str_contains($name, 'BEIDOU') || str_contains($name, 'IRNSS') || str_contains($name, 'QZSS')) return 'navigation';
        if (str_contains($name, 'METEOSAT') || str_contains($name, 'NOAA') || str_contains($name, 'GOES') || str_contains($name, 'HIMAWARI') || str_contains($name, 'METOP') || str_contains($name, 'WEATHER') || str_contains($name, 'FENGYUN')) return 'weather';
        if (str_contains($name, 'LANDSAT') || str_contains($name, 'SENTINEL') || str_contains($name, 'CRYOSAT') || str_contains($name, 'TERRA') || str_contains($name, 'AQUA') || str_contains($name, 'WORLDVIEW') || str_contains($name, 'PLEIADES') || str_contains($name, 'SPOT')) return 'earth-observation';
        if (str_contains($name, 'USA-') || str_contains($name, 'NROL') || str_contains($name, 'COSMOS 2') || str_contains($name, 'YAOGAN') || str_contains($name, 'SBIRS') || str_contains($name, 'MUOS') || str_contains($name, 'WGS') || str_contains($name, 'AEHF') || str_contains($name, 'GSSAP') || str_contains($name, 'OFEK') || str_contains($name, 'SAR-') || str_contains($name, 'GSAT-7')) return 'military';
        if (str_contains($name, 'HUBBLE') || str_contains($name, 'CHANDRA') || str_contains($name, 'JWST') || str_contains($name, 'FERMI') || str_contains($name, 'SWIFT') || str_contains($name, 'TESS') || str_contains($name, 'KEPLER')) return 'scientific';
        if ($alt > 30000) return 'communication';
        return 'communication';
    }

    private function orbitType(float $alt, float $inc, float $period): string
    {
        if ($period > 1400 && $period < 1500 && $alt > 34000) return 'GEO';
        if ($alt > 1500 && $alt < 26000) return 'MEO';
        if ($inc > 96 && $inc < 100 && $alt < 1000) return 'SSO';
        if ($period > 700 && $alt > 30000) return 'HEO';
        return 'LEO';
    }
}
