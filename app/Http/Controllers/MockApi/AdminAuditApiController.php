<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * ARGUX Admin Audit Log Mock REST API.
 * Immutable audit trail with search, filter, sort, pagination, export, integrity verification.
 */
class AdminAuditApiController extends Controller
{
    private static function h(int $i): string { return hash('sha256', "argux_audit_chain_{$i}"); }

    private static function entries(): array
    {
        $h = fn(int $i) => self::h($i);
        return [
            ['id'=>'a01','timestamp'=>'2026-03-27 09:32:14','user'=>'Col. Tomić','userRole'=>'System Admin','userId'=>1,'action'=>'login','severity'=>'success','module'=>'auth','target'=>'Session','description'=>'Successful admin login via 2FA (Authenticator App)','ip'=>'10.0.1.10','userAgent'=>'Chrome 124 / Windows 11','sessionId'=>'sess_a7f3b2','integrityHash'=>$h(1),'previousHash'=>$h(0)],
            ['id'=>'a02','timestamp'=>'2026-03-27 09:30:05','user'=>'Sgt. Matić','userRole'=>'Field Intelligence','userId'=>4,'action'=>'ai_query','severity'=>'info','module'=>'ai_assistant','target'=>'Person #1 — Marko Horvat','description'=>'AI query: summarize Horvat co-location events','ip'=>'10.0.1.22','userAgent'=>'Chrome 124 / Ubuntu 24','sessionId'=>'sess_c4d8e1','integrityHash'=>$h(2),'previousHash'=>$h(1),'metadata'=>['model'=>'LLaMA 3.1 70B','tokens'=>'2,847']],
            ['id'=>'a03','timestamp'=>'2026-03-27 09:28:41','user'=>'System','userRole'=>'Automated','userId'=>0,'action'=>'alert','severity'=>'critical','module'=>'alerts','target'=>'Alert Rule #7 — Co-location','description'=>'Co-location: Horvat + Mendoza 23m at Savska 41','ip'=>'10.0.3.1','userAgent'=>'ARGUX Alert Engine v3.2','sessionId'=>'sys_alert','integrityHash'=>$h(3),'previousHash'=>$h(2),'metadata'=>['subjects'=>'Horvat, Mendoza','distance'=>'23m']],
            ['id'=>'a04','timestamp'=>'2026-03-27 09:25:18','user'=>'Lt. Perić','userRole'=>'Intelligence Analyst','userId'=>5,'action'=>'view','severity'=>'info','module'=>'persons','target'=>'Person #12 — Ivan Babić','description'=>'Viewed person detail: Basic, Connections, Events','ip'=>'10.0.1.45','userAgent'=>'Firefox 125 / macOS 15','sessionId'=>'sess_f2a9c3','integrityHash'=>$h(4),'previousHash'=>$h(3)],
            ['id'=>'a05','timestamp'=>'2026-03-27 09:22:33','user'=>'Cpt. Horvat','userRole'=>'Operations','userId'=>3,'action'=>'update','severity'=>'warning','module'=>'operations','target'=>'Operation HAWK','description'=>'Updated phase: Preparation → Active. +3 members.','ip'=>'10.0.1.30','userAgent'=>'Chrome 124 / Windows 11','sessionId'=>'sess_b5e7d4','integrityHash'=>$h(5),'previousHash'=>$h(4),'metadata'=>['old_phase'=>'Preparation','new_phase'=>'Active']],
            ['id'=>'a06','timestamp'=>'2026-03-27 09:20:00','user'=>'System','userRole'=>'Automated','userId'=>0,'action'=>'sync','severity'=>'success','module'=>'data_sources','target'=>'INTERPOL I-24/7','description'=>'Sync completed. 847 records, 12 new, 0 errors.','ip'=>'10.0.3.1','userAgent'=>'ARGUX Sync Worker v2.1','sessionId'=>'sys_sync','integrityHash'=>$h(6),'previousHash'=>$h(5),'metadata'=>['records'=>'847','duration'=>'34s']],
            ['id'=>'a07','timestamp'=>'2026-03-27 09:18:12','user'=>'Maj. Novak','userRole'=>'Analysis Lead','userId'=>2,'action'=>'export','severity'=>'info','module'=>'reports','target'=>'Person Report — Horvat','description'=>'Exported report PDF. 14 sections, 23 pages.','ip'=>'10.0.1.15','userAgent'=>'Chrome 124 / macOS 15','sessionId'=>'sess_d1c6b8','integrityHash'=>$h(7),'previousHash'=>$h(6),'metadata'=>['format'=>'PDF','pages'=>'23']],
            ['id'=>'a08','timestamp'=>'2026-03-27 09:15:44','user'=>'IT Support','userRole'=>'Infrastructure','userId'=>6,'action'=>'config','severity'=>'warning','module'=>'config','target'=>'Alert Configuration','description'=>'Changed alert cooldown 5min → 3min.','ip'=>'10.0.2.5','userAgent'=>'Chrome 124 / Ubuntu 24','sessionId'=>'sess_e8f4a2','integrityHash'=>$h(8),'previousHash'=>$h(7),'metadata'=>['setting'=>'alert.cooldown','old'=>'300s','new'=>'180s']],
            ['id'=>'a09','timestamp'=>'2026-03-27 09:12:08','user'=>'Sgt. Matić','userRole'=>'Field Intelligence','userId'=>4,'action'=>'create','severity'=>'success','module'=>'face_recognition','target'=>'Face Search — Horvat','description'=>'Face recognition: 3 matches (94%, 89%, 76%).','ip'=>'10.0.1.22','userAgent'=>'Chrome 124 / Ubuntu 24','sessionId'=>'sess_c4d8e1','integrityHash'=>$h(9),'previousHash'=>$h(8)],
            ['id'=>'a10','timestamp'=>'2026-03-27 09:10:30','user'=>'Col. Tomić','userRole'=>'System Admin','userId'=>1,'action'=>'create','severity'=>'success','module'=>'admin','target'=>'User Account — Lt. Perić','description'=>'Created operator for Lt. Ana Perić. Role: Intelligence Analyst.','ip'=>'10.0.1.10','userAgent'=>'Chrome 124 / Windows 11','sessionId'=>'sess_a7f3b2','integrityHash'=>$h(10),'previousHash'=>$h(9)],
            ['id'=>'a11','timestamp'=>'2026-03-27 09:05:22','user'=>'System','userRole'=>'Automated','userId'=>0,'action'=>'backup','severity'=>'success','module'=>'system','target'=>'Database Backup','description'=>'Incremental backup 2.4 TB. Integrity: PASSED. AES-256.','ip'=>'10.0.3.1','userAgent'=>'ARGUX Backup Agent v1.4','sessionId'=>'sys_backup','integrityHash'=>$h(11),'previousHash'=>$h(10)],
            ['id'=>'a12','timestamp'=>'2026-03-27 08:58:17','user'=>'Lt. Perić','userRole'=>'Intelligence Analyst','userId'=>5,'action'=>'search','severity'=>'info','module'=>'persons','target'=>'Global Search','description'=>'Search: "Mendoza port Thursday". 14 results.','ip'=>'10.0.1.45','userAgent'=>'Firefox 125 / macOS 15','sessionId'=>'sess_f2a9c3','integrityHash'=>$h(12),'previousHash'=>$h(11)],
            ['id'=>'a13','timestamp'=>'2026-03-27 08:55:00','user'=>'System','userRole'=>'Automated','userId'=>0,'action'=>'alert','severity'=>'warning','module'=>'devices','target'=>'Camera CAM-03','description'=>'Device offline: CAM-03 (Port Terminal East).','ip'=>'10.0.3.1','userAgent'=>'ARGUX Device Monitor v2.0','sessionId'=>'sys_device','integrityHash'=>$h(13),'previousHash'=>$h(12)],
            ['id'=>'a14','timestamp'=>'2026-03-27 08:50:33','user'=>'Cpt. Horvat','userRole'=>'Operations','userId'=>3,'action'=>'assign','severity'=>'info','module'=>'operations','target'=>'Operation HAWK — Team Alpha','description'=>'Assigned Team Alpha to HAWK. 6 operators.','ip'=>'10.0.1.30','userAgent'=>'Chrome 124 / Windows 11','sessionId'=>'sess_b5e7d4','integrityHash'=>$h(14),'previousHash'=>$h(13)],
            ['id'=>'a15','timestamp'=>'2026-03-27 08:45:11','user'=>'Maj. Novak','userRole'=>'Analysis Lead','userId'=>2,'action'=>'view','severity'=>'info','module'=>'connections','target'=>'Full Network Graph','description'=>'Connections graph: 387 nodes, 1204 edges. Filter: HAWK.','ip'=>'10.0.1.15','userAgent'=>'Chrome 124 / macOS 15','sessionId'=>'sess_d1c6b8','integrityHash'=>$h(15),'previousHash'=>$h(14)],
            ['id'=>'a16','timestamp'=>'2026-03-27 08:40:05','user'=>'System','userRole'=>'Automated','userId'=>0,'action'=>'sync','severity'=>'success','module'=>'data_sources','target'=>'EU Sanctions CFSP','description'=>'Sanctions sync: 12 new entries, 3 removed.','ip'=>'10.0.3.1','userAgent'=>'ARGUX Sync Worker v2.1','sessionId'=>'sys_sync','integrityHash'=>$h(16),'previousHash'=>$h(15)],
            ['id'=>'a17','timestamp'=>'2026-03-27 08:35:22','user'=>'Sgt. Matić','userRole'=>'Field Intelligence','userId'=>4,'action'=>'create','severity'=>'success','module'=>'lpr','target'=>'LPR Search — ZG-1234-AB','description'=>'LPR plate search: 8 sightings found (last 30 days).','ip'=>'10.0.1.22','userAgent'=>'Chrome 124 / Ubuntu 24','sessionId'=>'sess_c4d8e1','integrityHash'=>$h(17),'previousHash'=>$h(16)],
            ['id'=>'a18','timestamp'=>'2026-03-27 08:30:00','user'=>'Col. Tomić','userRole'=>'System Admin','userId'=>1,'action'=>'session_kill','severity'=>'critical','module'=>'admin','target'=>'User Session — Damir Kožul','description'=>'Force-killed session for locked user Kožul (5 failed attempts).','ip'=>'10.0.1.10','userAgent'=>'Chrome 124 / Windows 11','sessionId'=>'sess_a7f3b2','integrityHash'=>$h(18),'previousHash'=>$h(17)],
            ['id'=>'a19','timestamp'=>'2026-03-27 08:25:15','user'=>'Unknown','userRole'=>'Unknown','userId'=>0,'action'=>'failed_login','severity'=>'critical','module'=>'auth','target'=>'Admin Login','description'=>'3 failed login attempts from 192.168.50.12. Account locked.','ip'=>'192.168.50.12','userAgent'=>'Unknown Browser / Unknown OS','sessionId'=>'none','integrityHash'=>$h(19),'previousHash'=>$h(18)],
            ['id'=>'a20','timestamp'=>'2026-03-27 08:20:08','user'=>'Maj. Novak','userRole'=>'Analysis Lead','userId'=>2,'action'=>'update','severity'=>'info','module'=>'persons','target'=>'Person #9 — Carlos Mendoza','description'=>'Updated risk level: High → Critical. Added 2 connections.','ip'=>'10.0.1.15','userAgent'=>'Chrome 124 / macOS 15','sessionId'=>'sess_d1c6b8','integrityHash'=>$h(20),'previousHash'=>$h(19),'metadata'=>['old_risk'=>'High','new_risk'=>'Critical']],
            ['id'=>'a21','timestamp'=>'2026-03-27 08:15:00','user'=>'System','userRole'=>'Automated','userId'=>0,'action'=>'deploy','severity'=>'success','module'=>'system','target'=>'Faster-Whisper Large-v3','description'=>'AI model deployed. GPU allocation: 2x A100. Queue priority: high.','ip'=>'10.0.3.1','userAgent'=>'ARGUX Deploy Agent v1.2','sessionId'=>'sys_deploy','integrityHash'=>$h(21),'previousHash'=>$h(20)],
            ['id'=>'a22','timestamp'=>'2026-03-27 08:10:44','user'=>'Lt. Perić','userRole'=>'Intelligence Analyst','userId'=>5,'action'=>'create','severity'=>'success','module'=>'scraper','target'=>'Social Scraper — Mendoza','description'=>'Created social media scraper for Mendoza. Platforms: X, Instagram, Telegram.','ip'=>'10.0.1.45','userAgent'=>'Firefox 125 / macOS 15','sessionId'=>'sess_f2a9c3','integrityHash'=>$h(22),'previousHash'=>$h(21)],
            ['id'=>'a23','timestamp'=>'2026-03-27 08:05:30','user'=>'Cpt. Horvat','userRole'=>'Operations','userId'=>3,'action'=>'delete','severity'=>'warning','module'=>'storage','target'=>'Expired Recording — CAM-07','description'=>'Deleted expired video recording (>90 days retention). Size: 4.2 GB.','ip'=>'10.0.1.30','userAgent'=>'Chrome 124 / Windows 11','sessionId'=>'sess_b5e7d4','integrityHash'=>$h(23),'previousHash'=>$h(22),'metadata'=>['size'=>'4.2 GB','age'=>'94 days']],
            ['id'=>'a24','timestamp'=>'2026-03-27 08:00:00','user'=>'Col. Tomić','userRole'=>'System Admin','userId'=>1,'action'=>'revoke','severity'=>'warning','module'=>'admin','target'=>'Admin Account — Šimunović','description'=>'Suspended admin account Šimunović. Reason: unauthorized access.','ip'=>'10.0.1.10','userAgent'=>'Chrome 124 / Windows 11','sessionId'=>'sess_a7f3b2','integrityHash'=>$h(24),'previousHash'=>$h(23)],
            ['id'=>'a25','timestamp'=>'2026-03-27 07:55:18','user'=>'Sgt. Matić','userRole'=>'Field Intelligence','userId'=>4,'action'=>'view','severity'=>'info','module'=>'map','target'=>'Tactical Map — Zagreb','description'=>'Viewed tactical map with tracking overlay. 12 active entities.','ip'=>'10.0.1.22','userAgent'=>'Chrome 124 / Ubuntu 24','sessionId'=>'sess_c4d8e1','integrityHash'=>$h(25),'previousHash'=>$h(24)],
            ['id'=>'a26','timestamp'=>'2026-03-27 07:50:00','user'=>'Maj. Novak','userRole'=>'Analysis Lead','userId'=>2,'action'=>'mfa_verify','severity'=>'success','module'=>'auth','target'=>'Session','description'=>'MFA verification: Authenticator App. Session started.','ip'=>'10.0.1.15','userAgent'=>'Chrome 124 / macOS 15','sessionId'=>'sess_d1c6b8','integrityHash'=>$h(26),'previousHash'=>$h(25)],
            ['id'=>'a27','timestamp'=>'2026-03-27 07:45:22','user'=>'System','userRole'=>'Automated','userId'=>0,'action'=>'import','severity'=>'success','module'=>'data_sources','target'=>'Vehicle Registry','description'=>'Vehicle registry import: 1,247 records processed. 34 new plates.','ip'=>'10.0.3.1','userAgent'=>'ARGUX Import Worker v1.8','sessionId'=>'sys_import','integrityHash'=>$h(27),'previousHash'=>$h(26)],
            ['id'=>'a28','timestamp'=>'2026-03-27 07:40:10','user'=>'Cpt. Horvat','userRole'=>'Operations','userId'=>3,'action'=>'login','severity'=>'success','module'=>'auth','target'=>'Session','description'=>'Operator login via 2FA (SMS). IP: 10.0.1.30.','ip'=>'10.0.1.30','userAgent'=>'Chrome 124 / Windows 11','sessionId'=>'sess_b5e7d4','integrityHash'=>$h(28),'previousHash'=>$h(27)],
            ['id'=>'a29','timestamp'=>'2026-03-27 07:35:00','user'=>'Lt. Perić','userRole'=>'Intelligence Analyst','userId'=>5,'action'=>'export','severity'=>'info','module'=>'connections','target'=>'Network Export — HAWK Subjects','description'=>'Exported connections graph as PNG. 42 nodes visible.','ip'=>'10.0.1.45','userAgent'=>'Firefox 125 / macOS 15','sessionId'=>'sess_f2a9c3','integrityHash'=>$h(29),'previousHash'=>$h(28)],
            ['id'=>'a30','timestamp'=>'2026-03-27 07:30:00','user'=>'Sgt. Matić','userRole'=>'Field Intelligence','userId'=>4,'action'=>'login','severity'=>'success','module'=>'auth','target'=>'Session','description'=>'Operator login via 2FA (Authenticator App).','ip'=>'10.0.1.22','userAgent'=>'Chrome 124 / Ubuntu 24','sessionId'=>'sess_c4d8e1','integrityHash'=>$h(30),'previousHash'=>$h(29)],
        ];
    }

    /** GET /mock-api/admin/audit */
    public function index(Request $request): JsonResponse
    {
        $data = self::entries();
        $search = strtolower($request->query('search', ''));
        $action = $request->query('action', '');
        $severity = $request->query('severity', '');
        $module = $request->query('module', '');
        $user = $request->query('user', '');
        $ip = $request->query('ip', '');
        $dateFrom = $request->query('date_from', '');
        $dateTo = $request->query('date_to', '');
        $sortCol = $request->query('sort', 'timestamp');
        $sortDir = $request->query('dir', 'desc');
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(50, max(1, (int) $request->query('per_page', 15)));

        if ($action) $data = array_values(array_filter($data, fn($e) => $e['action'] === $action));
        if ($severity) $data = array_values(array_filter($data, fn($e) => $e['severity'] === $severity));
        if ($module) $data = array_values(array_filter($data, fn($e) => $e['module'] === $module));
        if ($user) $data = array_values(array_filter($data, fn($e) => $e['user'] === $user));
        if ($ip) $data = array_values(array_filter($data, fn($e) => str_contains($e['ip'], $ip)));
        if ($dateFrom) $data = array_values(array_filter($data, fn($e) => $e['timestamp'] >= $dateFrom));
        if ($dateTo) $data = array_values(array_filter($data, fn($e) => $e['timestamp'] <= $dateTo . ' 23:59:59'));
        if ($search) $data = array_values(array_filter($data, fn($e) => str_contains(strtolower($e['description'].' '.$e['target'].' '.$e['user'].' '.$e['ip'].' '.$e['action']), $search)));

        usort($data, function ($a, $b) use ($sortCol, $sortDir) {
            $av = $a[$sortCol] ?? ''; $bv = $b[$sortCol] ?? '';
            $cmp = is_string($av) ? strcasecmp($av, $bv) : $av - $bv;
            return $sortDir === 'desc' ? -$cmp : $cmp;
        });

        $total = count($data);
        $paged = array_slice($data, ($page - 1) * $perPage, $perPage);

        return response()->json([
            'data' => array_values($paged),
            'meta' => ['page'=>$page,'per_page'=>$perPage,'total'=>$total,'total_pages'=>(int)ceil($total/$perPage)],
        ]);
    }

    /** GET /mock-api/admin/audit/{id} */
    public function show(Request $request, string $id): JsonResponse
    {
        $entry = collect(self::entries())->firstWhere('id', $id);
        if (!$entry) return response()->json(['message'=>'Audit entry not found.','code'=>'NOT_FOUND'], 404);
        return response()->json(['data'=>$entry]);
    }

    /** POST /mock-api/admin/audit/export */
    public function export(Request $request): JsonResponse
    {
        $request->validate(['format' => ['required','in:csv,pdf']]);
        $fmt = $request->input('format');
        Log::info('Admin Audit API: export requested', ['format'=>$fmt,'ip'=>$request->ip()]);
        usleep(600_000);
        return response()->json([
            'message' => "Audit log exported as " . strtoupper($fmt) . ".",
            'format' => $fmt,
            'entries' => count(self::entries()),
            'file' => "argux_audit_" . now()->format('Ymd_His') . ".{$fmt}",
            'size' => $fmt === 'csv' ? '2.4 MB' : '8.7 MB',
            'generated_at' => now()->toDateTimeString(),
        ]);
    }

    /** POST /mock-api/admin/audit/{id}/verify */
    public function verify(Request $request, string $id): JsonResponse
    {
        $entry = collect(self::entries())->firstWhere('id', $id);
        if (!$entry) return response()->json(['message'=>'Audit entry not found.','code'=>'NOT_FOUND'], 404);
        usleep(300_000);
        $idx = collect(self::entries())->search(fn($e) => $e['id'] === $id);
        $expectedPrev = self::h($idx);
        $valid = $entry['integrityHash'] === self::h($idx + 1);
        return response()->json([
            'id' => $id,
            'valid' => $valid,
            'hash' => $entry['integrityHash'],
            'previous_hash' => $entry['previousHash'],
            'chain_position' => $idx + 1,
            'algorithm' => 'SHA-256',
            'message' => $valid ? 'Integrity verification PASSED. Entry is authentic and unmodified.' : 'Integrity verification FAILED. Entry may have been tampered with.',
            'verified_at' => now()->toDateTimeString(),
        ]);
    }
}
