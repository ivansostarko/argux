<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX Mock Admin Dashboard API.
 *
 * Provides KPIs, service health, activity feed, storage info, and quick actions.
 * All data is static mock. No database.
 */
class AdminDashboardApiController extends Controller
{
    /**
     * GET /mock-api/admin/dashboard/stats
     * All dashboard data in one call (KPIs, services, activity, storage).
     */
    public function stats(Request $request): JsonResponse
    {
        return response()->json([
            'kpis' => self::kpis(),
            'services' => self::services(),
            'activity' => self::activity(),
            'storage' => self::storage(),
            'system' => [
                'status' => 'online',
                'uptime_days' => 42,
                'last_backup' => '2026-04-04 03:00:00',
                'next_backup' => '2026-04-05 03:00:00',
                'version' => config('app.version', '0.26.1'),
                'server_time' => now()->toDateTimeString(),
            ],
        ]);
    }

    /**
     * GET /mock-api/admin/dashboard/kpis
     */
    public function kpis(Request $request = null): JsonResponse|array
    {
        $data = [
            ['id' => 'users', 'label' => 'Total Users', 'value' => 147, 'unit' => null, 'icon' => '👥', 'color' => '#3b82f6', 'trend' => 'up', 'trend_value' => '+12 this month', 'sparkline' => [120,125,128,132,135,140,142,147]],
            ['id' => 'sessions', 'label' => 'Active Sessions', 'value' => 34, 'unit' => null, 'icon' => '🟢', 'color' => '#22c55e', 'trend' => 'stable', 'trend_value' => 'Avg 31/day', 'sparkline' => [28,32,35,30,34,33,31,34]],
            ['id' => 'uptime', 'label' => 'System Uptime', 'value' => '99.97%', 'unit' => null, 'icon' => '⏱️', 'color' => '#8b5cf6', 'trend' => 'up', 'trend_value' => '42 days continuous', 'sparkline' => [99.9,99.95,99.92,99.98,99.97,99.99,99.96,99.97]],
            ['id' => 'storage', 'label' => 'Storage Used', 'value' => '2.4 TB', 'unit' => '/ 8 TB', 'icon' => '💾', 'color' => '#f59e0b', 'trend' => 'up', 'trend_value' => '+180 GB this week', 'sparkline' => [1.8,1.9,2.0,2.1,2.15,2.2,2.3,2.4]],
            ['id' => 'kafka', 'label' => 'Kafka Queue', 'value' => '1,247', 'unit' => null, 'icon' => '📨', 'color' => '#06b6d4', 'trend' => 'down', 'trend_value' => '-340 from peak', 'sparkline' => [2100,1800,1600,1500,1400,1350,1280,1247]],
            ['id' => 'entities', 'label' => 'Tracked Entities', 'value' => '12,847', 'unit' => null, 'icon' => '🎯', 'color' => '#ef4444', 'trend' => 'up', 'trend_value' => '+89 today', 'sparkline' => [12200,12350,12480,12550,12630,12710,12780,12847]],
            ['id' => 'alerts', 'label' => 'Active Alerts', 'value' => 23, 'unit' => null, 'icon' => '🚨', 'color' => '#f97316', 'trend' => 'up', 'trend_value' => '+5 since 06:00', 'sparkline' => [12,14,16,18,17,19,21,23]],
            ['id' => 'ai_jobs', 'label' => 'AI Queue', 'value' => 8, 'unit' => null, 'icon' => '🤖', 'color' => '#ec4899', 'trend' => 'down', 'trend_value' => '3 processing now', 'sparkline' => [15,14,12,11,10,9,9,8]],
        ];
        return $request ? response()->json(['data' => $data]) : $data;
    }

    /**
     * GET /mock-api/admin/dashboard/services
     */
    public function services(Request $request = null): JsonResponse|array
    {
        $data = [
            ['id' => 's1', 'name' => 'PostgreSQL + PostGIS', 'status' => 'healthy', 'uptime' => '99.99%', 'latency' => '2ms', 'cpu' => 18, 'memory' => 42, 'icon' => '🐘', 'description' => 'Primary database'],
            ['id' => 's2', 'name' => 'Redis Cluster', 'status' => 'healthy', 'uptime' => '99.99%', 'latency' => '<1ms', 'cpu' => 5, 'memory' => 28, 'icon' => '⚡', 'description' => 'Cache & sessions'],
            ['id' => 's3', 'name' => 'Apache Kafka', 'status' => 'healthy', 'uptime' => '99.98%', 'latency' => '4ms', 'cpu' => 22, 'memory' => 56, 'icon' => '📨', 'description' => 'Event streaming'],
            ['id' => 's4', 'name' => 'ClickHouse', 'status' => 'healthy', 'uptime' => '99.97%', 'latency' => '8ms', 'cpu' => 35, 'memory' => 61, 'icon' => '📊', 'description' => 'Analytics & time-series'],
            ['id' => 's5', 'name' => 'Typesense', 'status' => 'healthy', 'uptime' => '99.99%', 'latency' => '3ms', 'cpu' => 8, 'memory' => 22, 'icon' => '🔍', 'description' => 'Full-text search'],
            ['id' => 's6', 'name' => 'MinIO Storage', 'status' => 'healthy', 'uptime' => '99.99%', 'latency' => '6ms', 'cpu' => 12, 'memory' => 38, 'icon' => '📁', 'description' => 'Object storage'],
            ['id' => 's7', 'name' => 'Ollama (LLaMA 3.1)', 'status' => 'healthy', 'uptime' => '99.90%', 'latency' => '120ms', 'cpu' => 78, 'memory' => 85, 'icon' => '🤖', 'description' => 'Local LLM inference'],
            ['id' => 's8', 'name' => 'InsightFace Engine', 'status' => 'healthy', 'uptime' => '99.95%', 'latency' => '45ms', 'cpu' => 62, 'memory' => 72, 'icon' => '🧑', 'description' => 'Face recognition'],
            ['id' => 's9', 'name' => 'Faster-Whisper', 'status' => 'degraded', 'uptime' => '99.80%', 'latency' => '890ms', 'cpu' => 92, 'memory' => 88, 'icon' => '🎙️', 'description' => 'Audio transcription — high load'],
            ['id' => 's10', 'name' => 'Keycloak SSO', 'status' => 'healthy', 'uptime' => '99.99%', 'latency' => '15ms', 'cpu' => 10, 'memory' => 34, 'icon' => '🔐', 'description' => 'Authentication'],
            ['id' => 's11', 'name' => 'Nginx Proxy', 'status' => 'healthy', 'uptime' => '100%', 'latency' => '<1ms', 'cpu' => 3, 'memory' => 8, 'icon' => '🌐', 'description' => 'Reverse proxy + TLS'],
            ['id' => 's12', 'name' => 'Camera Network', 'status' => 'degraded', 'uptime' => '98.50%', 'latency' => '—', 'cpu' => 0, 'memory' => 0, 'icon' => '📹', 'description' => '2 cameras offline'],
        ];
        $healthy = count(array_filter($data, fn($s) => $s['status'] === 'healthy'));
        $degraded = count(array_filter($data, fn($s) => $s['status'] === 'degraded'));
        $result = ['data' => $data, 'summary' => ['total' => count($data), 'healthy' => $healthy, 'degraded' => $degraded, 'down' => 0]];
        return $request ? response()->json($result) : $data;
    }

    /**
     * GET /mock-api/admin/dashboard/activity
     */
    public function activity(Request $request = null): JsonResponse|array
    {
        $data = [
            ['id' => 'e1', 'type' => 'login', 'title' => 'Admin login', 'description' => 'Col. Tomić authenticated via 2FA', 'user' => 'Col. Tomić', 'time' => '2 min ago', 'icon' => '🔐', 'color' => '#22c55e', 'timestamp' => now()->subMinutes(2)->toDateTimeString()],
            ['id' => 'e2', 'type' => 'alert', 'title' => 'Critical alert triggered', 'description' => 'Co-location: Horvat + Mendoza at Savska', 'user' => 'System', 'time' => '12 min ago', 'icon' => '🚨', 'color' => '#ef4444', 'timestamp' => now()->subMinutes(12)->toDateTimeString()],
            ['id' => 'e3', 'type' => 'sync', 'title' => 'Data source sync completed', 'description' => 'INTERPOL I-24/7 — 847 records updated', 'user' => 'Scheduler', 'time' => '18 min ago', 'icon' => '📡', 'color' => '#3b82f6', 'timestamp' => now()->subMinutes(18)->toDateTimeString()],
            ['id' => 'e4', 'type' => 'deploy', 'title' => 'AI model deployed', 'description' => 'Faster-Whisper Large-v3 GPU allocation updated', 'user' => 'Sgt. Matić', 'time' => '25 min ago', 'icon' => '🤖', 'color' => '#8b5cf6', 'timestamp' => now()->subMinutes(25)->toDateTimeString()],
            ['id' => 'e5', 'type' => 'user', 'title' => 'New user registered', 'description' => 'Lt. Ana Perić — pending approval', 'user' => 'System', 'time' => '32 min ago', 'icon' => '👤', 'color' => '#06b6d4', 'timestamp' => now()->subMinutes(32)->toDateTimeString()],
            ['id' => 'e6', 'type' => 'config', 'title' => 'Configuration changed', 'description' => 'Alert cooldown updated: 5min → 3min', 'user' => 'Maj. Novak', 'time' => '45 min ago', 'icon' => '⚙️', 'color' => '#f59e0b', 'timestamp' => now()->subMinutes(45)->toDateTimeString()],
            ['id' => 'e7', 'type' => 'backup', 'title' => 'Backup completed', 'description' => 'Incremental backup — 2.4 TB — verified OK', 'user' => 'Scheduler', 'time' => '1h ago', 'icon' => '💾', 'color' => '#22c55e', 'timestamp' => now()->subHour()->toDateTimeString()],
            ['id' => 'e8', 'type' => 'error', 'title' => 'Transcription failed', 'description' => 'hassan_storage_ambient.wav — SNR too low', 'user' => 'Faster-Whisper', 'time' => '1.5h ago', 'icon' => '❌', 'color' => '#ef4444', 'timestamp' => now()->subMinutes(90)->toDateTimeString()],
            ['id' => 'e9', 'type' => 'login', 'title' => 'Failed login attempt', 'description' => '3 failed attempts from 192.168.1.45', 'user' => 'Unknown', 'time' => '2h ago', 'icon' => '⚠️', 'color' => '#f97316', 'timestamp' => now()->subHours(2)->toDateTimeString()],
            ['id' => 'e10', 'type' => 'sync', 'title' => 'EU Sanctions list updated', 'description' => 'CFSP — 12 new entries, 3 removed', 'user' => 'Scheduler', 'time' => '3h ago', 'icon' => '📡', 'color' => '#3b82f6', 'timestamp' => now()->subHours(3)->toDateTimeString()],
        ];

        $type = $request?->query('type');
        if ($type && $type !== 'all') {
            $data = array_values(array_filter($data, fn($e) => $e['type'] === $type));
        }

        $result = ['data' => $data, 'meta' => ['total' => count($data)]];
        return $request ? response()->json($result) : $data;
    }

    /**
     * GET /mock-api/admin/dashboard/storage
     */
    public function storage(Request $request = null): JsonResponse|array
    {
        $breakdown = [
            ['label' => 'Video Recordings', 'size' => '1.2 TB', 'bytes' => 1320000000000, 'color' => '#3b82f6', 'icon' => '🎥'],
            ['label' => 'Camera Captures', 'size' => '480 GB', 'bytes' => 515000000000, 'color' => '#8b5cf6', 'icon' => '📹'],
            ['label' => 'Audio Files', 'size' => '220 GB', 'bytes' => 236000000000, 'color' => '#f59e0b', 'icon' => '🎙️'],
            ['label' => 'Documents & Reports', 'size' => '180 GB', 'bytes' => 193000000000, 'color' => '#22c55e', 'icon' => '📄'],
            ['label' => 'Photos & Images', 'size' => '160 GB', 'bytes' => 172000000000, 'color' => '#ec4899', 'icon' => '📷'],
            ['label' => 'Database Backups', 'size' => '120 GB', 'bytes' => 129000000000, 'color' => '#06b6d4', 'icon' => '💾'],
            ['label' => 'AI Models', 'size' => '45 GB', 'bytes' => 48000000000, 'color' => '#ef4444', 'icon' => '🤖'],
        ];
        $total = 8000000000000;
        $used = array_sum(array_column($breakdown, 'bytes'));
        $result = ['breakdown' => $breakdown, 'total_bytes' => $total, 'used_bytes' => $used, 'used_percent' => round($used / $total * 100, 1), 'total_formatted' => '8.0 TB', 'used_formatted' => '2.4 TB'];
        return $request ? response()->json($result) : $breakdown;
    }

    /**
     * POST /mock-api/admin/dashboard/action
     * Execute a quick action (mock).
     */
    public function executeAction(Request $request): JsonResponse
    {
        $request->validate([
            'action' => ['required', 'string', 'in:clear_cache,restart_workers,force_sync,system_report,backup_now,rebuild_index,purge_logs,kill_sessions'],
        ]);

        $actionId = $request->input('action');
        Log::info('Admin Dashboard: quick action executed', ['action' => $actionId, 'ip' => $request->ip()]);

        usleep(800_000);

        $results = [
            'clear_cache' => ['message' => 'Cache cleared successfully. Redis flushed, Typesense index rebuilt.', 'duration' => '2.3s', 'affected' => '14,892 keys'],
            'restart_workers' => ['message' => 'All workers restarted. 8 Octane workers + 4 queue workers online.', 'duration' => '8.1s', 'affected' => '12 workers'],
            'force_sync' => ['message' => 'Sync triggered on all 22 data sources. Results expected in 2-5 minutes.', 'duration' => '1.2s', 'affected' => '22 sources', 'job_id' => 'job_' . Str::random(12)],
            'system_report' => ['message' => 'System health report generated. Available in Reports section.', 'duration' => '4.7s', 'report_id' => 'rpt_' . Str::random(12)],
            'backup_now' => ['message' => 'Incremental backup initiated. Estimated time: 12 minutes.', 'duration' => '0.5s', 'job_id' => 'job_' . Str::random(12)],
            'rebuild_index' => ['message' => 'Index rebuild started. Typesense + ChromaDB RAG vectors.', 'duration' => '1.8s', 'job_id' => 'job_' . Str::random(12)],
            'purge_logs' => ['message' => 'Log archival completed. 847 MB archived, 12,450 entries moved.', 'duration' => '6.2s', 'affected' => '12,450 entries'],
            'kill_sessions' => ['message' => 'All 34 active sessions terminated. Users will need to re-authenticate.', 'duration' => '0.8s', 'affected' => '34 sessions'],
        ];

        $result = $results[$actionId] ?? ['message' => 'Action completed.'];
        $result['action'] = $actionId;
        $result['executed_at'] = now()->toDateTimeString();
        $result['executed_by'] = 'System Administrator';

        return response()->json($result);
    }

    /**
     * POST /mock-api/admin/dashboard/service/{id}/restart
     * Restart a specific service (mock).
     */
    public function restartService(Request $request, string $id): JsonResponse
    {
        Log::info('Admin Dashboard: service restart', ['service_id' => $id, 'ip' => $request->ip()]);
        usleep(600_000);

        $allServices = self::services();
        $service = collect($allServices)->firstWhere('id', $id);

        if (!$service) {
            return response()->json(['message' => 'Service not found.', 'code' => 'SERVICE_NOT_FOUND'], 404);
        }

        return response()->json([
            'message' => "{$service['name']} restarted successfully.",
            'service_id' => $id,
            'new_status' => 'healthy',
            'restart_time' => '3.2s',
            'restarted_at' => now()->toDateTimeString(),
        ]);
    }
}
