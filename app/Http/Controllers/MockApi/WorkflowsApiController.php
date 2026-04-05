<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX Workflows Mock REST API.
 * Kanban workflow management with triggers, actions, execution log.
 */
class WorkflowsApiController extends Controller
{
    private static function workflows(): array
    {
        $tr = fn($id,$t,$l,$c,$i) => ['id'=>$id,'type'=>$t,'label'=>$l,'config'=>$c,'icon'=>$i];
        $ac = fn($id,$t,$l,$c,$i) => ['id'=>$id,'type'=>$t,'label'=>$l,'config'=>$c,'icon'=>$i];
        $ex = fn($id,$ts,$st,$d,$tb,$o) => ['id'=>$id,'ts'=>$ts,'status'=>$st,'duration'=>$d,'triggeredBy'=>$tb,'output'=>$o];
        return [
            ['id'=>'wf01','name'=>'Horvat Port Surveillance Pipeline','description'=>'Automated evidence collection when Horvat enters Port Terminal zone','status'=>'Active','priority'=>'Critical','operationId'=>'op01','operationName'=>'OP HAWK','triggers'=>[$tr('t01','zone_entry','Port Terminal Zone Entry','zone=Port Terminal East, subjects=Horvat','🛡️'),$tr('t02','face_match','Face Recognition Trigger','threshold=85%, cameras=Port CAMs','🧑')],'actions'=>[$ac('a01','alert','Push Critical Alert','channels=In-App,Email,SMS, severity=Critical','🚨'),$ac('a02','record','Create Evidence Record','type=Evidence Package, auto_attach=true','📝'),$ac('a03','ai_analysis','Run AI Pattern Analysis','model=Movement Analyzer, lookback=72h','🤖')],'linkedPersonIds'=>[1,9],'linkedPersonNames'=>['Marko Horvat','Carlos Mendoza'],'execCount'=>12,'lastRun'=>'2026-03-27 08:45','successRate'=>100,'execLog'=>[$ex('e01','2026-03-27 08:45','success','3.2s','Zone Entry Alert','Evidence package created, alert sent'),$ex('e02','2026-03-26 22:15','success','2.8s','Face Match','Face match 94%, alert pushed'),$ex('e03','2026-03-25 16:30','success','4.1s','Zone Entry Alert','Full pipeline executed')],'createdAt'=>'2026-02-15','updatedAt'=>'2026-03-27 08:45','createdBy'=>'Maj. Novak'],
            ['id'=>'wf02','name'=>'Co-location Auto-Documentation','description'=>'When Horvat+Mendoza co-locate, auto-generate evidence timeline and alert chain of command','status'=>'Active','priority'=>'Critical','operationId'=>'op01','operationName'=>'OP HAWK','triggers'=>[$tr('t03','colocation','Horvat-Mendoza Co-location','radius=50m, subjects=Horvat+Mendoza','🔗')],'actions'=>[$ac('a04','alert','Critical Co-location Alert','severity=Critical, escalate=true','🚨'),$ac('a05','record','Evidence Timeline','type=Co-location Package','📝'),$ac('a06','generate_report','Generate Intel Report','template=Co-location Brief','📊')],'linkedPersonIds'=>[1,9],'linkedPersonNames'=>['Marko Horvat','Carlos Mendoza'],'execCount'=>8,'lastRun'=>'2026-03-27 09:28','successRate'=>100,'execLog'=>[$ex('e04','2026-03-27 09:28','success','5.6s','Co-location Trigger','Horvat+Mendoza 23m at Savska 41')],'createdAt'=>'2026-02-20','updatedAt'=>'2026-03-27 09:28','createdBy'=>'Maj. Novak'],
            ['id'=>'wf03','name'=>'Mendoza Vehicle Tracking Chain','description'=>'LPR capture triggers GPS activation and surveillance camera re-tasking','status'=>'Active','priority'=>'High','operationId'=>'op01','operationName'=>'OP HAWK','triggers'=>[$tr('t04','lpr_match','LPR Match ZG-4421-MN','plate=ZG-4421-MN','🚗')],'actions'=>[$ac('a07','deploy_device','Activate GPS Tracker','device=GPS-0183, mode=high-freq','📡'),$ac('a08','alert','Movement Alert','severity=Warning','🚨'),$ac('a09','notify','Notify Field Team','team=Bravo, channel=SMS','🔔')],'linkedPersonIds'=>[9],'linkedPersonNames'=>['Carlos Mendoza'],'execCount'=>6,'lastRun'=>'2026-03-26 22:10','successRate'=>83,'execLog'=>[$ex('e05','2026-03-26 22:10','success','1.8s','LPR Capture','GPS activated, field team notified'),$ex('e06','2026-03-24 09:31','failed','0.4s','LPR Capture','GPS device offline — battery depleted')],'createdAt'=>'2026-03-01','updatedAt'=>'2026-03-26 22:10','createdBy'=>'Sgt. Matić'],
            ['id'=>'wf04','name'=>'Babić Night Activity Monitor','description'=>'Night-time warehouse zone entry triggers camera recording + loitering analysis','status'=>'Active','priority'=>'High','operationId'=>'op01','operationName'=>'OP HAWK','triggers'=>[$tr('t05','zone_entry','Warehouse Night Entry','zone=Warehouse District, time=22:00-06:00','🛡️')],'actions'=>[$ac('a10','alert','Night Activity Alert','severity=Warning','🚨'),$ac('a11','ai_analysis','Loitering Detection','model=Behavior Analyzer, cameras=CAM-12','🤖')],'linkedPersonIds'=>[12],'linkedPersonNames'=>['Ivan Babić'],'execCount'=>5,'lastRun'=>'2026-03-27 03:15','successRate'=>100,'execLog'=>[$ex('e07','2026-03-27 03:15','success','2.1s','Zone Entry','Night entry detected, CAM-12 recording started')],'createdAt'=>'2026-03-05','updatedAt'=>'2026-03-27 03:15','createdBy'=>'Lt. Perić'],
            ['id'=>'wf05','name'=>'Hassan Communications Monitor','description'=>'Keyword detection in Hassan intercepted communications triggers translation + analysis','status'=>'Active','priority'=>'Medium','operationId'=>'op02','operationName'=>'OP GLACIER','triggers'=>[$tr('t06','keyword','Arabic Keyword Detection','keywords=shipping,port,payment,Thursday','🔤')],'actions'=>[$ac('a12','ai_analysis','Auto-Translate','model=NLLB-200, lang=Arabic→English','🤖'),$ac('a13','record','File Intercepted Comms','type=Communication Record','📝'),$ac('a14','alert','Keyword Alert','severity=Warning','🚨')],'linkedPersonIds'=>[7],'linkedPersonNames'=>['Youssef Hassan'],'execCount'=>9,'lastRun'=>'2026-03-27 08:10','successRate'=>89,'execLog'=>[$ex('e08','2026-03-27 08:10','success','8.4s','Keyword Match','Arabic SMS translated, 3 keywords flagged')],'createdAt'=>'2026-02-25','updatedAt'=>'2026-03-27 08:10','createdBy'=>'Lt. Perić'],
            ['id'=>'wf06','name'=>'Financial Transaction Escalation','description'=>'AML-flagged transactions above €10K trigger escalation to Financial Intel unit','status'=>'Active','priority'=>'Critical','operationId'=>'op02','operationName'=>'OP GLACIER','triggers'=>[$tr('t07','keyword','Transaction Threshold','keywords=transaction,transfer, threshold=€10,000','🔤')],'actions'=>[$ac('a15','escalate','Escalate to FinInt','team=Financial Intelligence, priority=Critical','📢'),$ac('a16','generate_report','Transaction Report','template=AML Brief','📊')],'linkedPersonIds'=>[3],'linkedPersonNames'=>['Ahmed Al-Rashid'],'execCount'=>23,'lastRun'=>'2026-03-26 16:00','successRate'=>100,'execLog'=>[$ex('e09','2026-03-26 16:00','success','1.2s','Transaction Alert','€24K flagged, escalated to FinInt')],'createdAt'=>'2026-01-20','updatedAt'=>'2026-03-26 16:00','createdBy'=>'Financial Intel'],
            ['id'=>'wf07','name'=>'Signal Lost Recovery Protocol','description'=>'When GPS tracker goes offline, attempt reconnection and alert operator','status'=>'Paused','priority'=>'Medium','operationId'=>'op01','operationName'=>'OP HAWK','triggers'=>[$tr('t08','signal_lost','Tracker Offline','timeout=10min, devices=All GPS','📵')],'actions'=>[$ac('a17','deploy_device','Force Reconnect','action=restart_modem','📡'),$ac('a18','alert','Signal Lost Alert','severity=Warning','🚨')],'linkedPersonIds'=>[],'linkedPersonNames'=>[],'execCount'=>7,'lastRun'=>'2026-03-25 14:00','successRate'=>57,'execLog'=>[$ex('e10','2026-03-25 14:00','failed','30s','Signal Lost','Reconnection timeout — device battery depleted')],'createdAt'=>'2026-01-15','updatedAt'=>'2026-03-25 14:00','createdBy'=>'System'],
            ['id'=>'wf08','name'=>'Weekly Surveillance Summary','description'=>'Generate automated weekly summary reports for all active operations','status'=>'Completed','priority'=>'Low','operationId'=>'','operationName'=>'System','triggers'=>[$tr('t09','schedule','Weekly Schedule','cron=0 6 * * MON','⏰')],'actions'=>[$ac('a19','generate_report','Weekly Summary','template=Weekly Overview','📊'),$ac('a20','notify','Email Reports','recipients=team-leads@argux.mil','🔔')],'linkedPersonIds'=>[],'linkedPersonNames'=>[],'execCount'=>14,'lastRun'=>'2026-03-25 06:00','successRate'=>100,'execLog'=>[$ex('e11','2026-03-25 06:00','success','45s','Schedule','Weekly report generated and emailed')],'createdAt'=>'2025-12-01','updatedAt'=>'2026-03-25 06:00','createdBy'=>'System'],
            ['id'=>'wf09','name'=>'CERBERUS Post-Op Analysis','description'=>'Archived: final analysis workflow from completed Operation CERBERUS','status'=>'Archived','priority'=>'Low','operationId'=>'op03','operationName'=>'OP CERBERUS','triggers'=>[$tr('t10','manual','Manual Trigger','operator=authorized only','👆')],'actions'=>[$ac('a21','generate_report','Final Analysis Report','template=Op Debrief','📊')],'linkedPersonIds'=>[],'linkedPersonNames'=>[],'execCount'=>2,'lastRun'=>'2026-02-28 10:00','successRate'=>100,'execLog'=>[$ex('e12','2026-02-28 10:00','success','2m 14s','Manual','Final debrief report generated')],'createdAt'=>'2025-11-01','updatedAt'=>'2026-02-28 10:00','createdBy'=>'Col. Tomić'],
        ];
    }

    /** GET /mock-api/workflows */
    public function index(Request $request): JsonResponse
    {
        $data = self::workflows();
        $status = $request->query('status', '');
        $op = $request->query('operation', '');
        $search = strtolower($request->query('search', ''));

        if ($status && $status !== 'all') $data = array_values(array_filter($data, fn($w) => $w['status'] === $status));
        if ($op && $op !== 'all') $data = array_values(array_filter($data, fn($w) => $w['operationName'] === $op));
        if ($search) $data = array_values(array_filter($data, fn($w) => str_contains(strtolower($w['name'].' '.$w['description'].' '.implode(' ',$w['linkedPersonNames'])), $search)));

        return response()->json(['data' => $data, 'meta' => ['total' => count($data)]]);
    }

    /** GET /mock-api/workflows/{id} */
    public function show(string $id): JsonResponse
    {
        $wf = collect(self::workflows())->firstWhere('id', $id);
        if (!$wf) return response()->json(['message' => 'Workflow not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $wf]);
    }

    /** POST /mock-api/workflows */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:200'],
            'description' => ['required', 'string', 'min:5'],
            'priority' => ['required', 'in:Critical,High,Medium,Low'],
            'status' => ['required', 'in:Draft,Active,Paused,Completed,Archived'],
        ]);
        Log::info('Workflows API: created', ['name' => $request->input('name')]);
        usleep(400_000);
        return response()->json(['message' => 'Workflow created.', 'data' => [
            'id' => 'wf-' . Str::random(6), 'name' => $request->input('name'),
            'description' => $request->input('description'), 'status' => $request->input('status'),
            'priority' => $request->input('priority'), 'execCount' => 0,
            'createdAt' => now()->toDateString(), 'createdBy' => 'Current User',
        ]], 201);
    }

    /** PATCH /mock-api/workflows/{id}/status */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $wf = collect(self::workflows())->firstWhere('id', $id);
        if (!$wf) return response()->json(['message' => 'Workflow not found.', 'code' => 'NOT_FOUND'], 404);
        $request->validate(['status' => ['required', 'in:Draft,Active,Paused,Completed,Archived']]);
        $new = $request->input('status');
        if ($wf['status'] === 'Archived' && $new !== 'Draft') {
            return response()->json(['message' => 'Archived workflows can only be moved to Draft.', 'code' => 'INVALID_TRANSITION'], 409);
        }
        return response()->json(['message' => "Workflow moved to {$new}.", 'id' => $id, 'status' => $new]);
    }

    /** DELETE /mock-api/workflows/{id} */
    public function destroy(string $id): JsonResponse
    {
        $wf = collect(self::workflows())->firstWhere('id', $id);
        if (!$wf) return response()->json(['message' => 'Workflow not found.', 'code' => 'NOT_FOUND'], 404);
        if ($wf['status'] === 'Active') return response()->json(['message' => 'Cannot delete active workflow. Pause or archive first.', 'code' => 'WORKFLOW_ACTIVE'], 409);
        Log::info('Workflows API: deleted', ['id' => $id]);
        return response()->json(['message' => "Workflow \"{$wf['name']}\" deleted.", 'id' => $id]);
    }

    /** GET /mock-api/workflows/templates */
    public function templates(): JsonResponse
    {
        return response()->json(['data' => [
            ['id'=>'tpl01','name'=>'Zone Surveillance Pipeline','description'=>'Zone entry triggers camera capture, AI analysis, and evidence creation','icon'=>'🛡️','category'=>'Surveillance','triggers'=>[['type'=>'zone_entry','label'=>'Zone Entry']],'actions'=>[['type'=>'alert','label'=>'Alert'],['type'=>'ai_analysis','label'=>'AI Analysis'],['type'=>'record','label'=>'Create Record']]],
            ['id'=>'tpl02','name'=>'Co-location Response','description'=>'Co-location detection triggers alert escalation and report generation','icon'=>'🔗','category'=>'Intelligence','triggers'=>[['type'=>'colocation','label'=>'Co-location']],'actions'=>[['type'=>'alert','label'=>'Critical Alert'],['type'=>'generate_report','label'=>'Report']]],
            ['id'=>'tpl03','name'=>'Vehicle Tracking Chain','description'=>'LPR match triggers GPS activation and field team notification','icon'=>'🚗','category'=>'Tracking','triggers'=>[['type'=>'lpr_match','label'=>'LPR Match']],'actions'=>[['type'=>'deploy_device','label'=>'Activate GPS'],['type'=>'notify','label'=>'Notify Team']]],
            ['id'=>'tpl04','name'=>'Communications Monitor','description'=>'Keyword detection triggers translation and filing','icon'=>'🔤','category'=>'SIGINT','triggers'=>[['type'=>'keyword','label'=>'Keyword Match']],'actions'=>[['type'=>'ai_analysis','label'=>'Auto-Translate'],['type'=>'record','label'=>'File Comms']]],
            ['id'=>'tpl05','name'=>'Financial Alert Pipeline','description'=>'Transaction threshold triggers escalation to FinInt','icon'=>'💰','category'=>'Financial','triggers'=>[['type'=>'keyword','label'=>'Transaction Alert']],'actions'=>[['type'=>'escalate','label'=>'Escalate'],['type'=>'generate_report','label'=>'AML Report']]],
            ['id'=>'tpl06','name'=>'Scheduled Report Generator','description'=>'Cron-based weekly or daily summary report generation','icon'=>'⏰','category'=>'Reporting','triggers'=>[['type'=>'schedule','label'=>'Schedule']],'actions'=>[['type'=>'generate_report','label'=>'Generate'],['type'=>'notify','label'=>'Email']]],
        ]]);
    }
}
