<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * ARGUX Admin Configuration Mock REST API.
 * 11 tabs of form-based settings with GET (load) and PUT (save).
 */
class AdminConfigApiController extends Controller
{
    private static function tabs(): array
    {
        return [
            ['id'=>'general','label'=>'General','icon'=>'⚙️'],['id'=>'security','label'=>'Security','icon'=>'🔐'],
            ['id'=>'notifications','label'=>'Notifications','icon'=>'🔔'],['id'=>'dev','label'=>'Developer','icon'=>'🛠️'],
            ['id'=>'map','label'=>'Map','icon'=>'🗺️'],['id'=>'retention','label'=>'Retention','icon'=>'📦'],
            ['id'=>'backup','label'=>'Backup','icon'=>'💾'],['id'=>'ai','label'=>'AI Models','icon'=>'🤖'],
            ['id'=>'storage','label'=>'Storage','icon'=>'🗄️'],['id'=>'update','label'=>'Update','icon'=>'🔄'],
            ['id'=>'licence','label'=>'Licence','icon'=>'🔑'],
        ];
    }

    private static function validTabs(): array { return array_column(self::tabs(), 'id'); }

    /** GET /mock-api/admin/config — Tab metadata */
    public function index(): JsonResponse
    {
        return response()->json(['tabs' => self::tabs(), 'version' => config('app.version')]);
    }

    /** GET /mock-api/admin/config/{tab} — Settings for tab */
    public function show(string $tab): JsonResponse
    {
        if (!in_array($tab, self::validTabs())) {
            return response()->json(['message'=>"Invalid tab: {$tab}",'code'=>'INVALID_TAB'], 404);
        }
        return response()->json(['tab'=>$tab,'data'=>self::defaults($tab),'saved_at'=>'2026-03-27 09:00:00']);
    }

    /** PUT /mock-api/admin/config/{tab} — Save settings */
    public function update(Request $request, string $tab): JsonResponse
    {
        if (!in_array($tab, self::validTabs())) {
            return response()->json(['message'=>"Invalid tab: {$tab}",'code'=>'INVALID_TAB'], 404);
        }
        Log::info('Admin Config API: settings saved', ['tab'=>$tab,'ip'=>$request->ip()]);
        usleep(500_000);
        $label = collect(self::tabs())->firstWhere('id', $tab)['label'] ?? $tab;
        return response()->json([
            'message'=>"{$label} settings saved successfully.",
            'tab'=>$tab,
            'saved_at'=>now()->toDateTimeString(),
            'saved_by'=>'System Administrator',
        ]);
    }

    /** POST /mock-api/admin/config/{tab}/reset — Reset tab to defaults */
    public function reset(Request $request, string $tab): JsonResponse
    {
        if (!in_array($tab, self::validTabs())) {
            return response()->json(['message'=>"Invalid tab: {$tab}",'code'=>'INVALID_TAB'], 404);
        }
        Log::info('Admin Config API: tab reset to defaults', ['tab'=>$tab]);
        usleep(400_000);
        return response()->json([
            'message'=>ucfirst($tab).' settings reset to defaults.',
            'tab'=>$tab,
            'data'=>self::defaults($tab),
            'reset_at'=>now()->toDateTimeString(),
        ]);
    }

    /** POST /mock-api/admin/config/test-notification — Test notification delivery */
    public function testNotification(Request $request): JsonResponse
    {
        $request->validate(['channel'=>['required','in:in_app,email,sms,webhook']]);
        usleep(600_000);
        return response()->json([
            'message'=>"Test notification sent via {$request->input('channel')}.",
            'channel'=>$request->input('channel'),
            'delivered'=>true,
            'sent_at'=>now()->toDateTimeString(),
        ]);
    }

    /** POST /mock-api/admin/config/backup/trigger — Trigger manual backup */
    public function triggerBackup(Request $request): JsonResponse
    {
        $request->validate(['type'=>['required','in:full,incremental,differential']]);
        Log::info('Admin Config API: backup triggered', ['type'=>$request->input('type')]);
        usleep(800_000);
        return response()->json([
            'message'=>"Manual {$request->input('type')} backup initiated.",
            'job_id'=>'bkp_'.now()->format('YmdHis'),
            'type'=>$request->input('type'),
            'estimated_duration'=>$request->input('type')==='full'?'~25 min':'~8 min',
            'started_at'=>now()->toDateTimeString(),
        ]);
    }

    private static function defaults(string $tab): array
    {
        return match($tab) {
            'general' => [
                'language'=>'en','timezone'=>'Europe/Zagreb','date_format'=>'DD.MM.YYYY',
                'theme'=>'tactical-dark','font'=>'geist',
                'clocks'=>[['id'=>'c1','label'=>'Zagreb','timezone'=>'Europe/Zagreb'],['id'=>'c2','label'=>'London','timezone'=>'Europe/London'],['id'=>'c3','label'=>'New York','timezone'=>'America/New_York'],['id'=>'c4','label'=>'Tokyo','timezone'=>'Asia/Tokyo']],
            ],
            'security' => [
                'mfa_default'=>'Authenticator App','session_timeout'=>'2 hours','encryption'=>'AES-256-GCM',
                'audit_enabled'=>true,'force_https'=>true,
                'ip_whitelist'=>['10.0.0.0/8','192.168.0.0/16','172.16.0.0/12'],
                'password_policies'=>[['id'=>'pw1','label'=>'Minimum 12 characters','enabled'=>true],['id'=>'pw2','label'=>'Uppercase + lowercase','enabled'=>true],['id'=>'pw3','label'=>'Number required','enabled'=>true],['id'=>'pw4','label'=>'Special character','enabled'=>true],['id'=>'pw5','label'=>'No repeated chars (3+)','enabled'=>true],['id'=>'pw6','label'=>'Not in breach database','enabled'=>true]],
            ],
            'notifications' => [
                'enabled'=>true,'quiet_start'=>'22:00','quiet_end'=>'07:00',
                'types'=>[['id'=>'zone_breach','label'=>'Zone Breach','severity'=>'critical','default'=>true],['id'=>'colocation','label'=>'Co-location','severity'=>'critical','default'=>true],['id'=>'face_match','label'=>'Face Match','severity'=>'warning','default'=>true],['id'=>'lpr_capture','label'=>'LPR Capture','severity'=>'info','default'=>true],['id'=>'signal_lost','label'=>'Signal Lost','severity'=>'warning','default'=>true],['id'=>'speed_alert','label'=>'Speed Alert','severity'=>'warning','default'=>false]],
                'channels'=>[['id'=>'in_app','label'=>'In-App','enabled'=>true,'config'=>'Always active'],['id'=>'email','label'=>'Email','enabled'=>true,'config'=>'admin@argux.mil'],['id'=>'sms','label'=>'SMS','enabled'=>false,'config'=>'Not configured'],['id'=>'webhook','label'=>'Webhook','enabled'=>false,'config'=>'https://']],
            ],
            'dev' => [
                'environment'=>'production','debug'=>'disabled','log_level'=>'error','log_channel'=>'daily',
                'app_url'=>'https://argux.local','filesystem'=>'minio',
            ],
            'map' => [
                'center_lat'=>'45.8150','center_lng'=>'15.9819','zoom'=>'12','tile_provider'=>'CartoDB Dark',
                'layers'=>[['id'=>'Markers','enabled'=>true],['id'=>'Heatmap','enabled'=>true],['id'=>'Tracks','enabled'=>true],['id'=>'Zones','enabled'=>true],['id'=>'Network','enabled'=>true],['id'=>'Clusters','enabled'=>true]],
            ],
            'retention' => [
                'events'=>'90 days','logs'=>'30 days','media'=>'1 year','chat'=>'180 days',
                'backups'=>'90 days','audit'=>'5 years','auto_purge'=>true,
            ],
            'backup' => [
                'frequency'=>'Daily','type'=>'Incremental','encrypt'=>true,'verify'=>true,'include_files'=>true,
                'databases'=>[['id'=>'pg','name'=>'PostgreSQL + PostGIS','size'=>'28 GB','enabled'=>true],['id'=>'ch','name'=>'ClickHouse','size'=>'142 GB','enabled'=>true],['id'=>'redis','name'=>'Redis Dump','size'=>'890 MB','enabled'=>true],['id'=>'ts','name'=>'Typesense','size'=>'4.2 GB','enabled'=>true],['id'=>'chroma','name'=>'ChromaDB (RAG)','size'=>'2.1 GB','enabled'=>true]],
                'history'=>[['id'=>'b1','date'=>'2026-03-27 03:00','type'=>'Incremental','size'=>'2.4 TB','duration'=>'8m 12s','status'=>'success','verified'=>true],['id'=>'b2','date'=>'2026-03-26 03:00','type'=>'Incremental','size'=>'2.3 TB','duration'=>'7m 48s','status'=>'success','verified'=>true],['id'=>'b3','date'=>'2026-03-25 03:00','type'=>'Full','size'=>'2.3 TB','duration'=>'24m 05s','status'=>'success','verified'=>true]],
            ],
            'ai' => [
                'functions'=>[
                    ['id'=>'llm','name'=>'Local LLM','model'=>'LLaMA 3.1 70B','runtime'=>'Ollama','gpu'=>'2x A100','status'=>'active','queue'=>3],
                    ['id'=>'face','name'=>'Face Recognition','model'=>'ArcFace R100','runtime'=>'ONNX Runtime','gpu'=>'1x A100','status'=>'active','queue'=>0],
                    ['id'=>'whisper','name'=>'Transcription','model'=>'Faster-Whisper Large-v3','runtime'=>'CTranslate2','gpu'=>'1x A100','status'=>'degraded','queue'=>12],
                    ['id'=>'lpr','name'=>'Plate OCR','model'=>'YOLOv8 + PaddleOCR v3','runtime'=>'PyTorch','gpu'=>'Shared','status'=>'active','queue'=>0],
                    ['id'=>'translate','name'=>'Translation','model'=>'NLLB-200','runtime'=>'PyTorch','gpu'=>'Shared','status'=>'active','queue'=>2],
                ],
            ],
            'storage' => [
                'backend'=>'MinIO','endpoint'=>'https://minio.argux.local:9000','region'=>'eu-west-1',
                'total_capacity'=>'8.0 TB','used'=>'2.4 TB','used_percent'=>30,
                'buckets'=>[['name'=>'media','size'=>'1.8 TB','objects'=>48920],['name'=>'backups','size'=>'320 GB','objects'=>12],['name'=>'models','size'=>'45 GB','objects'=>8],['name'=>'exports','size'=>'28 GB','objects'=>342]],
            ],
            'update' => [
                'current_version'=>config('app.version'),'latest_version'=>'0.27.0','channel'=>'stable',
                'auto_update'=>false,'last_check'=>'2026-03-27 08:00:00',
                'history'=>[['version'=>'0.26.6','date'=>'2026-04-04','notes'=>'Statistics API'],['version'=>'0.26.5','date'=>'2026-04-04','notes'=>'Roles API'],['version'=>'0.26.0','date'=>'2026-04-04','notes'=>'Admin Login API']],
            ],
            'licence' => [
                'key'=>'ARGUX-ENT-2026-XXXX-XXXX-XXXX','type'=>'Enterprise','status'=>'active',
                'seats'=>150,'seats_used'=>34,'expires'=>'2027-01-15',
                'hardware_id'=>'HW-A7K2M9X4B3N8','activated'=>'2024-01-15',
                'modules'=>[['id'=>'core','label'=>'Core Platform','enabled'=>true,'locked'=>true],['id'=>'ai','label'=>'AI/ML Suite','enabled'=>true,'locked'=>false],['id'=>'face','label'=>'Face Recognition','enabled'=>true,'locked'=>false],['id'=>'lpr','label'=>'Plate Recognition','enabled'=>true,'locked'=>false],['id'=>'scraper','label'=>'Social Scraper','enabled'=>true,'locked'=>false],['id'=>'dark_web','label'=>'Dark Web Monitor','enabled'=>false,'locked'=>false]],
            ],
            default => [],
        };
    }
}
