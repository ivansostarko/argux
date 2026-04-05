<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * ARGUX Background Jobs Mock REST API.
 * Queue dashboard: running, queued, completed, failed jobs with retry/cancel.
 */
class JobsApiController extends Controller
{
    private static function jobs(): array
    {
        return [
            ['id'=>'j01','type'=>'ai_inference','name'=>'Faster-Whisper: horvat_port_cam07.mp4','status'=>'running','progress'=>67,'worker'=>'gpu-worker-1','queue'=>'ai-high','startedAt'=>'2026-03-27 09:28:00','completedAt'=>null,'duration'=>null,'initiator'=>'Sgt. Matić','priority'=>'high','input'=>['file'=>'horvat_port_cam07.mp4','model'=>'large-v3','language'=>'auto','duration'=>'45 min'],'output'=>null,'error'=>null,'retryCount'=>0,'maxRetries'=>3],
            ['id'=>'j02','type'=>'sync','name'=>'INTERPOL I-24/7 Full Sync','status'=>'running','progress'=>42,'worker'=>'sync-worker-2','queue'=>'sync','startedAt'=>'2026-03-27 09:25:00','completedAt'=>null,'duration'=>null,'initiator'=>'Scheduler','priority'=>'normal','input'=>['source'=>'INTERPOL I-24/7','type'=>'full','records'=>'~12,000'],'output'=>null,'error'=>null,'retryCount'=>0,'maxRetries'=>3],
            ['id'=>'j03','type'=>'ai_inference','name'=>'Face Recognition: Mendoza batch (24 images)','status'=>'running','progress'=>88,'worker'=>'gpu-worker-2','queue'=>'ai-high','startedAt'=>'2026-03-27 09:20:00','completedAt'=>null,'duration'=>null,'initiator'=>'Lt. Perić','priority'=>'high','input'=>['subject'=>'Carlos Mendoza','images'=>'24','model'=>'ArcFace R100'],'output'=>null,'error'=>null,'retryCount'=>0,'maxRetries'=>2],
            ['id'=>'j04','type'=>'report','name'=>'Intelligence Report: Horvat (Full)','status'=>'queued','progress'=>0,'worker'=>'','queue'=>'reports','startedAt'=>null,'completedAt'=>null,'duration'=>null,'initiator'=>'Maj. Novak','priority'=>'normal','input'=>['entity'=>'Person #1 — Marko Horvat','sections'=>'14','format'=>'PDF'],'output'=>null,'error'=>null,'retryCount'=>0,'maxRetries'=>2],
            ['id'=>'j05','type'=>'export','name'=>'Bulk Export: HAWK Operation Events (CSV)','status'=>'queued','progress'=>0,'worker'=>'','queue'=>'exports','startedAt'=>null,'completedAt'=>null,'duration'=>null,'initiator'=>'Cpt. Horvat','priority'=>'low','input'=>['operation'=>'HAWK','events'=>'~4,200','format'=>'CSV'],'output'=>null,'error'=>null,'retryCount'=>0,'maxRetries'=>1],
            ['id'=>'j06','type'=>'media','name'=>'Video Transcode: cam12_babic_loiter.mp4','status'=>'queued','progress'=>0,'worker'=>'','queue'=>'media','startedAt'=>null,'completedAt'=>null,'duration'=>null,'initiator'=>'System','priority'=>'low','input'=>['file'=>'cam12_babic_loiter.mp4','outputFormat'=>'H.264'],'output'=>null,'error'=>null,'retryCount'=>0,'maxRetries'=>2],
            ['id'=>'j07','type'=>'sync','name'=>'EU Sanctions CFSP Incremental','status'=>'completed','progress'=>100,'worker'=>'sync-worker-1','queue'=>'sync','startedAt'=>'2026-03-27 08:00:00','completedAt'=>'2026-03-27 08:02:34','duration'=>'2m 34s','initiator'=>'Scheduler','priority'=>'normal','input'=>['source'=>'EU Sanctions CFSP','type'=>'incremental'],'output'=>'12 new entries, 3 removed, 0 errors','error'=>null,'retryCount'=>0,'maxRetries'=>3],
            ['id'=>'j08','type'=>'backup','name'=>'Incremental Backup — All Databases','status'=>'completed','progress'=>100,'worker'=>'backup-worker-1','queue'=>'backup','startedAt'=>'2026-03-27 03:00:00','completedAt'=>'2026-03-27 03:08:12','duration'=>'8m 12s','initiator'=>'Scheduler','priority'=>'high','input'=>['type'=>'incremental','databases'=>'5','encryption'=>'AES-256'],'output'=>'2.4 TB backed up. Integrity: PASSED.','error'=>null,'retryCount'=>0,'maxRetries'=>1],
            ['id'=>'j09','type'=>'ai_inference','name'=>'LPR Batch: Zagreb highways (142 plates)','status'=>'completed','progress'=>100,'worker'=>'gpu-worker-1','queue'=>'ai-normal','startedAt'=>'2026-03-27 07:30:00','completedAt'=>'2026-03-27 07:32:18','duration'=>'2m 18s','initiator'=>'System','priority'=>'normal','input'=>['source'=>'Highway cameras','plates'=>'142'],'output'=>'142 plates read, 8 matches, 2 flagged','error'=>null,'retryCount'=>0,'maxRetries'=>3],
            ['id'=>'j10','type'=>'report','name'=>'Weekly Summary Report','status'=>'completed','progress'=>100,'worker'=>'report-worker-1','queue'=>'reports','startedAt'=>'2026-03-27 06:00:00','completedAt'=>'2026-03-27 06:04:47','duration'=>'4m 47s','initiator'=>'Scheduler','priority'=>'normal','input'=>['type'=>'weekly_summary','week'=>'2026-W13'],'output'=>'42 pages, 7 sections. Delivered to 3 recipients.','error'=>null,'retryCount'=>0,'maxRetries'=>2],
            ['id'=>'j11','type'=>'import','name'=>'Vehicle Registry Import (Zagreb PD)','status'=>'completed','progress'=>100,'worker'=>'import-worker-1','queue'=>'imports','startedAt'=>'2026-03-27 07:45:00','completedAt'=>'2026-03-27 07:46:22','duration'=>'1m 22s','initiator'=>'Col. Tomić','priority'=>'normal','input'=>['source'=>'Zagreb PD','records'=>'1,247'],'output'=>'1,247 processed, 34 new plates','error'=>null,'retryCount'=>0,'maxRetries'=>2],
            ['id'=>'j12','type'=>'ai_inference','name'=>'Translation: hassan_intercept_ar.txt','status'=>'failed','progress'=>78,'worker'=>'gpu-worker-2','queue'=>'ai-normal','startedAt'=>'2026-03-27 08:10:00','completedAt'=>'2026-03-27 08:14:33','duration'=>'4m 33s','initiator'=>'Lt. Perić','priority'=>'normal','input'=>['file'=>'hassan_intercept_ar.txt','model'=>'NLLB-200','sourceLang'=>'Arabic'],'output'=>null,'error'=>'CUDA error: device-side assert at token 4,892. Model checkpoint corrupted.','retryCount'=>2,'maxRetries'=>3],
            ['id'=>'j13','type'=>'media','name'=>'Audio Enhancement: mendoza_ambient.wav','status'=>'failed','progress'=>34,'worker'=>'media-worker-1','queue'=>'media','startedAt'=>'2026-03-27 08:30:00','completedAt'=>'2026-03-27 08:31:45','duration'=>'1m 45s','initiator'=>'Sgt. Matić','priority'=>'high','input'=>['file'=>'mendoza_ambient.wav','model'=>'DeepFilterNet'],'output'=>null,'error'=>'SNR too low (< 3 dB). Source recording quality insufficient.','retryCount'=>1,'maxRetries'=>2],
            ['id'=>'j14','type'=>'sync','name'=>'Dark Web Monitor — Tor Scrape','status'=>'failed','progress'=>12,'worker'=>'sync-worker-3','queue'=>'sync','startedAt'=>'2026-03-27 04:00:00','completedAt'=>'2026-03-27 04:03:11','duration'=>'3m 11s','initiator'=>'Scheduler','priority'=>'low','input'=>['source'=>'Dark Web Monitor','circuits'=>'5'],'output'=>null,'error'=>'Connection timeout on 4/5 Tor circuits. Exit nodes unreachable.','retryCount'=>3,'maxRetries'=>3],
            ['id'=>'j15','type'=>'index_rebuild','name'=>'Typesense Full Reindex','status'=>'completed','progress'=>100,'worker'=>'index-worker-1','queue'=>'maintenance','startedAt'=>'2026-03-26 22:00:00','completedAt'=>'2026-03-26 22:12:44','duration'=>'12m 44s','initiator'=>'Col. Tomić','priority'=>'normal','input'=>['engine'=>'Typesense','collections'=>'8'],'output'=>'248,392 documents indexed. 0 errors.','error'=>null,'retryCount'=>0,'maxRetries'=>1],
            ['id'=>'j16','type'=>'export','name'=>'Face Recognition Matches Export','status'=>'cancelled','progress'=>15,'worker'=>'export-worker-1','queue'=>'exports','startedAt'=>'2026-03-26 16:00:00','completedAt'=>'2026-03-26 16:02:00','duration'=>'2m','initiator'=>'Lt. Perić','priority'=>'low','input'=>['type'=>'face_matches','format'=>'CSV'],'output'=>null,'error'=>'Cancelled by user.','retryCount'=>0,'maxRetries'=>1],
        ];
    }

    /** GET /mock-api/jobs */
    public function index(Request $request): JsonResponse
    {
        $data = self::jobs();
        $status = $request->query('status', '');
        $type = $request->query('type', '');
        $search = strtolower($request->query('search', ''));
        $queue = $request->query('queue', '');

        if ($status && $status !== 'all') $data = array_values(array_filter($data, fn($j) => $j['status'] === $status));
        if ($type) $data = array_values(array_filter($data, fn($j) => $j['type'] === $type));
        if ($queue) $data = array_values(array_filter($data, fn($j) => $j['queue'] === $queue));
        if ($search) $data = array_values(array_filter($data, fn($j) => str_contains(strtolower($j['name'].' '.$j['initiator'].' '.$j['worker'].' '.($j['error'] ?? '')), $search)));

        $counts = ['running'=>0,'queued'=>0,'completed'=>0,'failed'=>0,'cancelled'=>0];
        foreach (self::jobs() as $j) $counts[$j['status']]++;

        return response()->json([
            'data' => $data,
            'meta' => ['total' => count($data)],
            'counts' => $counts,
            'queues' => array_values(array_unique(array_column(self::jobs(), 'queue'))),
        ]);
    }

    /** GET /mock-api/jobs/{id} */
    public function show(string $id): JsonResponse
    {
        $job = collect(self::jobs())->firstWhere('id', $id);
        if (!$job) return response()->json(['message' => 'Job not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $job]);
    }

    /** POST /mock-api/jobs/{id}/retry */
    public function retry(string $id): JsonResponse
    {
        $job = collect(self::jobs())->firstWhere('id', $id);
        if (!$job) return response()->json(['message' => 'Job not found.', 'code' => 'NOT_FOUND'], 404);
        if ($job['status'] !== 'failed') {
            return response()->json(['message' => 'Only failed jobs can be retried.', 'code' => 'NOT_FAILED'], 409);
        }
        if ($job['retryCount'] >= $job['maxRetries']) {
            return response()->json(['message' => 'Maximum retry attempts reached.', 'code' => 'MAX_RETRIES'], 409);
        }
        Log::info('Jobs API: retry', ['job_id' => $id, 'attempt' => $job['retryCount'] + 1]);
        usleep(400_000);
        return response()->json([
            'message' => "Job re-queued for retry (attempt {$job['retryCount']}+1/{$job['maxRetries']}).",
            'id' => $id, 'new_status' => 'queued', 'retry_count' => $job['retryCount'] + 1,
        ]);
    }

    /** POST /mock-api/jobs/{id}/cancel */
    public function cancel(string $id): JsonResponse
    {
        $job = collect(self::jobs())->firstWhere('id', $id);
        if (!$job) return response()->json(['message' => 'Job not found.', 'code' => 'NOT_FOUND'], 404);
        if (!in_array($job['status'], ['running', 'queued'])) {
            return response()->json(['message' => 'Only running or queued jobs can be cancelled.', 'code' => 'NOT_ACTIVE'], 409);
        }
        Log::info('Jobs API: cancel', ['job_id' => $id]);
        return response()->json(['message' => "Job \"{$job['name']}\" cancelled.", 'id' => $id, 'new_status' => 'cancelled']);
    }

    /** DELETE /mock-api/jobs/{id} */
    public function destroy(string $id): JsonResponse
    {
        $job = collect(self::jobs())->firstWhere('id', $id);
        if (!$job) return response()->json(['message' => 'Job not found.', 'code' => 'NOT_FOUND'], 404);
        if (in_array($job['status'], ['running', 'queued'])) {
            return response()->json(['message' => 'Cannot delete active jobs. Cancel first.', 'code' => 'JOB_ACTIVE'], 409);
        }
        Log::info('Jobs API: deleted', ['job_id' => $id]);
        return response()->json(['message' => "Job record deleted.", 'id' => $id]);
    }

    /** POST /mock-api/jobs/clear-completed */
    public function clearCompleted(): JsonResponse
    {
        $count = count(array_filter(self::jobs(), fn($j) => $j['status'] === 'completed'));
        Log::info('Jobs API: cleared completed', ['count' => $count]);
        return response()->json(['message' => "{$count} completed job(s) cleared.", 'cleared' => $count]);
    }

    /** GET /mock-api/jobs/stats */
    public function stats(): JsonResponse
    {
        $jobs = self::jobs();
        $counts = ['running'=>0,'queued'=>0,'completed'=>0,'failed'=>0,'cancelled'=>0];
        foreach ($jobs as $j) $counts[$j['status']]++;
        $byType = [];
        foreach ($jobs as $j) { $byType[$j['type']] = ($byType[$j['type']] ?? 0) + 1; }
        return response()->json([
            'counts' => $counts,
            'total' => count($jobs),
            'by_type' => $byType,
            'workers' => ['gpu-worker-1' => 'busy', 'gpu-worker-2' => 'busy', 'sync-worker-1' => 'idle', 'sync-worker-2' => 'busy', 'sync-worker-3' => 'idle', 'report-worker-1' => 'idle', 'media-worker-1' => 'idle', 'backup-worker-1' => 'idle'],
            'queues' => ['ai-high' => 2, 'ai-normal' => 0, 'sync' => 1, 'reports' => 1, 'exports' => 1, 'media' => 1, 'backup' => 0, 'maintenance' => 0, 'imports' => 0],
        ]);
    }
}
