<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WeatherController extends Controller
{
    /**
     * Get current weather + forecast for a location.
     * GET /mock-api/weather?lat=45.81&lng=15.98
     */
    public function current(Request $request): JsonResponse
    {
        $lat = $request->float('lat', 45.8131);
        $lng = $request->float('lng', 15.9775);
        $cacheKey = 'weather_' . md5("{$lat}_{$lng}");

        $data = Cache::remember($cacheKey, 300, fn() => $this->fetchCurrent($lat, $lng));
        return response()->json($data);
    }

    /**
     * Get historical weather for a location and date range.
     * GET /mock-api/weather/history?lat=45.81&lng=15.98&start=2026-03-01&end=2026-03-28
     */
    public function history(Request $request): JsonResponse
    {
        $lat = $request->float('lat', 45.8131);
        $lng = $request->float('lng', 15.9775);
        $start = $request->string('start', now()->subDays(7)->format('Y-m-d'));
        $end = $request->string('end', now()->subDay()->format('Y-m-d'));
        $cacheKey = 'weather_hist_' . md5("{$lat}_{$lng}_{$start}_{$end}");

        $data = Cache::remember($cacheKey, 3600, fn() => $this->fetchHistory($lat, $lng, $start, $end));
        return response()->json($data);
    }

    /**
     * Get rain radar tile timestamps from RainViewer (free, no API key).
     * GET /mock-api/weather/radar
     */
    public function radar(): JsonResponse
    {
        $data = Cache::remember('rainviewer_radar', 120, function () {
            try {
                $res = Http::timeout(8)->get('https://api.rainviewer.com/public/weather-maps.json');
                if (!$res->successful()) return ['frames' => [], 'source' => 'error'];
                $body = $res->json();
                $radar = $body['radar'] ?? [];
                $past = collect($radar['past'] ?? [])->map(fn($f) => ['time' => $f['time'], 'path' => $f['path']])->toArray();
                $nowcast = collect($radar['nowcast'] ?? [])->map(fn($f) => ['time' => $f['time'], 'path' => $f['path']])->toArray();
                return ['past' => $past, 'nowcast' => $nowcast, 'host' => $body['host'] ?? 'https://tilecache.rainviewer.com', 'source' => 'live'];
            } catch (\Exception $e) {
                Log::error('RainViewer fetch failed', ['error' => $e->getMessage()]);
                return ['past' => [], 'nowcast' => [], 'source' => 'error', 'error' => $e->getMessage()];
            }
        });
        return response()->json($data);
    }

    private function fetchCurrent(float $lat, float $lng): array
    {
        try {
            $res = Http::timeout(10)->get('https://api.open-meteo.com/v1/forecast', [
                'latitude' => $lat, 'longitude' => $lng,
                'current' => 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
                'hourly' => 'temperature_2m,precipitation_probability,precipitation,weather_code,cloud_cover,wind_speed_10m,visibility',
                'daily' => 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,wind_speed_10m_max',
                'timezone' => 'auto',
                'forecast_days' => 7,
            ]);
            if (!$res->successful()) throw new \Exception('API returned ' . $res->status());
            $body = $res->json();

            return [
                'source' => 'live',
                'current' => $body['current'] ?? [],
                'current_units' => $body['current_units'] ?? [],
                'hourly' => $this->compactHourly($body['hourly'] ?? []),
                'daily' => $body['daily'] ?? [],
                'daily_units' => $body['daily_units'] ?? [],
                'timezone' => $body['timezone'] ?? '',
                'elevation' => $body['elevation'] ?? 0,
                'lat' => $lat, 'lng' => $lng,
            ];
        } catch (\Exception $e) {
            Log::error('Open-Meteo current failed', ['error' => $e->getMessage()]);
            return $this->mockWeather($lat, $lng);
        }
    }

    private function fetchHistory(float $lat, float $lng, string $start, string $end): array
    {
        try {
            $res = Http::timeout(10)->get('https://archive-api.open-meteo.com/v1/archive', [
                'latitude' => $lat, 'longitude' => $lng,
                'start_date' => $start, 'end_date' => $end,
                'daily' => 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,sunshine_duration',
                'timezone' => 'auto',
            ]);
            if (!$res->successful()) throw new \Exception('Archive API returned ' . $res->status());
            $body = $res->json();
            return ['source' => 'live', 'daily' => $body['daily'] ?? [], 'daily_units' => $body['daily_units'] ?? [], 'lat' => $lat, 'lng' => $lng];
        } catch (\Exception $e) {
            Log::error('Open-Meteo history failed', ['error' => $e->getMessage()]);
            return ['source' => 'error', 'error' => $e->getMessage(), 'daily' => [], 'lat' => $lat, 'lng' => $lng];
        }
    }

    private function compactHourly(array $hourly): array
    {
        // Only return next 24 hours
        $times = $hourly['time'] ?? [];
        $result = [];
        $fields = ['temperature_2m', 'precipitation_probability', 'precipitation', 'weather_code', 'cloud_cover', 'wind_speed_10m', 'visibility'];
        for ($i = 0; $i < min(24, count($times)); $i++) {
            $entry = ['time' => $times[$i]];
            foreach ($fields as $f) { $entry[$f] = ($hourly[$f] ?? [])[$i] ?? null; }
            $result[] = $entry;
        }
        return $result;
    }

    private function mockWeather(float $lat, float $lng): array
    {
        return [
            'source' => 'mock',
            'current' => ['time' => now()->format('Y-m-d\TH:i'), 'temperature_2m' => 14.2, 'relative_humidity_2m' => 62, 'apparent_temperature' => 12.8, 'is_day' => 1, 'precipitation' => 0, 'rain' => 0, 'weather_code' => 2, 'cloud_cover' => 35, 'pressure_msl' => 1018.5, 'surface_pressure' => 1005.2, 'wind_speed_10m' => 12.4, 'wind_direction_10m' => 210, 'wind_gusts_10m' => 22.1],
            'current_units' => ['temperature_2m' => '°C', 'wind_speed_10m' => 'km/h', 'precipitation' => 'mm', 'pressure_msl' => 'hPa', 'relative_humidity_2m' => '%', 'cloud_cover' => '%'],
            'hourly' => [], 'daily' => [], 'daily_units' => [],
            'timezone' => 'Europe/Zagreb', 'elevation' => 122, 'lat' => $lat, 'lng' => $lng,
        ];
    }
}
