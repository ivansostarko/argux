<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * ARGUX Notifications Mock REST API.
 * Matches original inline notification data shape from the page.
 */
class NotificationsApiController extends Controller
{
    private static function notifications(): array
    {
        return [
            ['id'=>1,'type'=>'security','severity'=>'critical','title'=>'Failed login attempts detected','body'=>'7 consecutive failures from IP 185.23.xx.xx targeting operator account m.novak@argux.mil. Account automatically locked for 30 minutes.','time'=>'3m ago','timestamp'=>'2026-03-20T14:57:00Z','read'=>false,'source'=>'Auth Service'],
            ['id'=>2,'type'=>'storage','severity'=>'warning','title'=>'Storage threshold exceeded','body'=>'MinIO cluster node-03 has reached 91% capacity on the media partition. Automatic cleanup of expired cache will begin in 2 hours.','time'=>'12m ago','timestamp'=>'2026-03-20T14:48:00Z','read'=>false,'source'=>'Storage Monitor'],
            ['id'=>3,'type'=>'device','severity'=>'critical','title'=>'Device offline — GPS Tracker #0291','body'=>'GPS Tracker assigned to Subject Delta-7 has not reported since 14:22 UTC. Last known position: 45.8131°N, 15.9775°E.','time'=>'38m ago','timestamp'=>'2026-03-20T14:22:00Z','read'=>false,'source'=>'Device Manager'],
            ['id'=>4,'type'=>'system','severity'=>'info','title'=>'System update available — v2.1.1','body'=>'ARGUX platform patch v2.1.1 is ready. Includes 3 security fixes, Kafka consumer optimization, and updated NLLB translation model.','time'=>'45m ago','timestamp'=>'2026-03-20T14:15:00Z','read'=>false,'source'=>'Update Service'],
            ['id'=>5,'type'=>'user','severity'=>'info','title'=>'New user registration pending','body'=>'Ana Kovač (ana.kovac@agency.gov) has submitted a registration request for GEOINT division. Awaiting admin approval.','time'=>'1h ago','timestamp'=>'2026-03-20T13:52:00Z','read'=>false,'source'=>'User Management'],
            ['id'=>6,'type'=>'security','severity'=>'critical','title'=>'Certificate expiration warning','body'=>'TLS certificate for api.argux.internal expires in 7 days. Automatic ACME renewal initiated.','time'=>'1h ago','timestamp'=>'2026-03-20T13:40:00Z','read'=>true,'source'=>'Security Monitor'],
            ['id'=>7,'type'=>'backup','severity'=>'info','title'=>'Scheduled backup completed','body'=>'Full system backup completed — 847 GB, AES-256 encrypted, integrity verified. Stored to vault-02.','time'=>'2h ago','timestamp'=>'2026-03-20T12:30:00Z','read'=>true,'source'=>'Backup Service'],
            ['id'=>8,'type'=>'device','severity'=>'warning','title'=>'Camera #14 — degraded video feed','body'=>'RTSP stream from camera #14 experiencing >12% packet loss. Video reduced to 480p.','time'=>'2h ago','timestamp'=>'2026-03-20T12:15:00Z','read'=>true,'source'=>'Camera Network'],
            ['id'=>9,'type'=>'storage','severity'=>'warning','title'=>'ClickHouse partition nearing retention limit','body'=>'Events partition Q4 2025 contains 148M rows, exceeds retention in 5 days.','time'=>'3h ago','timestamp'=>'2026-03-20T11:45:00Z','read'=>true,'source'=>'Analytics Engine'],
            ['id'=>10,'type'=>'system','severity'=>'info','title'=>'Kafka consumer group rebalanced','body'=>'Consumer group argux-events rebalanced across 6 partitions. Lag recovered in 45 seconds.','time'=>'3h ago','timestamp'=>'2026-03-20T11:30:00Z','read'=>true,'source'=>'Event Pipeline'],
            ['id'=>11,'type'=>'user','severity'=>'info','title'=>'Operator role updated','body'=>'d.babić@argux.mil promoted from Analyst to Senior Analyst. New permissions: report export, AI query.','time'=>'4h ago','timestamp'=>'2026-03-20T10:15:00Z','read'=>true,'source'=>'Access Control'],
            ['id'=>12,'type'=>'security','severity'=>'warning','title'=>'Unusual API usage pattern','body'=>'/api/v1/persons received 847 requests in 10 minutes from session operator-0041. Rate limit exceeded.','time'=>'4h ago','timestamp'=>'2026-03-20T10:00:00Z','read'=>true,'source'=>'API Gateway'],
            ['id'=>13,'type'=>'backup','severity'=>'info','title'=>'Incremental backup completed','body'=>'Incremental backup — 12.3 GB delta. PostgreSQL WAL archived. Restore point RP-20260320-0800 created.','time'=>'6h ago','timestamp'=>'2026-03-20T08:00:00Z','read'=>true,'source'=>'Backup Service'],
            ['id'=>14,'type'=>'device','severity'=>'warning','title'=>'Low battery — Tracker #0183','body'=>'GPS Tracker #0183 battery at 11%. Estimated 4 hours remaining.','time'=>'6h ago','timestamp'=>'2026-03-20T08:15:00Z','read'=>true,'source'=>'Device Manager'],
            ['id'=>15,'type'=>'system','severity'=>'info','title'=>'Typesense index rebuilt','body'=>'Full-text search index rebuilt. 234,891 documents in 2m 14s. Query latency p99: 8ms.','time'=>'8h ago','timestamp'=>'2026-03-20T06:00:00Z','read'=>true,'source'=>'Search Service'],
            ['id'=>16,'type'=>'security','severity'=>'critical','title'=>'Audit log integrity check failed','body'=>'Hash mismatch on audit entries 4,481,002–4,481,017. Quarantined for forensic review.','time'=>'10h ago','timestamp'=>'2026-03-20T04:30:00Z','read'=>true,'source'=>'Audit Service'],
            ['id'=>17,'type'=>'storage','severity'=>'info','title'=>'Media cleanup completed','body'=>'Automated cleanup removed 23.4 GB of expired cache and temporary artifacts.','time'=>'12h ago','timestamp'=>'2026-03-20T02:00:00Z','read'=>true,'source'=>'Storage Monitor'],
            ['id'=>18,'type'=>'backup','severity'=>'warning','title'=>'Vault-01 replication lag detected','body'=>'Cross-site replication lagging 47 minutes. Throughput reduced to 120 Mbps.','time'=>'14h ago','timestamp'=>'2026-03-20T00:30:00Z','read'=>true,'source'=>'Backup Service'],
            ['id'=>19,'type'=>'user','severity'=>'info','title'=>'Password policy enforcement','body'=>'3 accounts flagged for password age >90 days. 7-day compliance deadline notifications sent.','time'=>'18h ago','timestamp'=>'2026-03-19T20:00:00Z','read'=>true,'source'=>'Access Control'],
            ['id'=>20,'type'=>'device','severity'=>'info','title'=>'Camera firmware update applied','body'=>'ONVIF firmware v4.2.1 rolled out to 12 cameras in Sector A. All online, no downtime.','time'=>'22h ago','timestamp'=>'2026-03-19T16:00:00Z','read'=>true,'source'=>'Camera Network'],
        ];
    }

    /** GET /mock-api/notifications */
    public function index(Request $request): JsonResponse
    {
        $data = self::notifications();
        $severity = $request->query('severity', '');
        $type = $request->query('type', '');
        $unread = $request->query('unread', '');

        if ($severity) $data = array_values(array_filter($data, fn($n) => $n['severity'] === $severity));
        if ($type) $data = array_values(array_filter($data, fn($n) => $n['type'] === $type));
        if ($unread === '1') $data = array_values(array_filter($data, fn($n) => !$n['read']));

        $all = self::notifications();
        $counts = [
            'all' => count($all),
            'unread' => count(array_filter($all, fn($n) => !$n['read'])),
            'critical' => count(array_filter($all, fn($n) => $n['severity'] === 'critical')),
            'warning' => count(array_filter($all, fn($n) => $n['severity'] === 'warning')),
            'info' => count(array_filter($all, fn($n) => $n['severity'] === 'info')),
        ];

        return response()->json(['data' => $data, 'meta' => ['total' => count($data)], 'counts' => $counts]);
    }

    /** PATCH /mock-api/notifications/{id}/read */
    public function toggleRead(Request $request, int $id): JsonResponse
    {
        $n = collect(self::notifications())->firstWhere('id', $id);
        if (!$n) return response()->json(['message' => 'Notification not found.', 'code' => 'NOT_FOUND'], 404);
        $read = $request->input('read', !$n['read']);
        return response()->json(['message' => $read ? 'Marked as read.' : 'Marked as unread.', 'id' => $id, 'read' => $read]);
    }

    /** POST /mock-api/notifications/read-all */
    public function readAll(): JsonResponse
    {
        $count = count(array_filter(self::notifications(), fn($n) => !$n['read']));
        return response()->json(['message' => "{$count} notification(s) marked as read.", 'marked' => $count]);
    }
}
