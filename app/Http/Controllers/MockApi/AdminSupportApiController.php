<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX Admin Support Tickets Mock REST API.
 * Split-panel ticketing with conversation threads, status/priority management.
 */
class AdminSupportApiController extends Controller
{
    private static function tickets(): array
    {
        $now = '2026-03-27 09:30';
        return [
            ['id'=>'t01','number'=>'TKT-001','subject'=>'Faster-Whisper GPU memory overflow on long recordings','status'=>'open','priority'=>'critical','category'=>'bug','reporter'=>'Sgt. Matić','reporterEmail'=>'matic@argux.mil','assignee'=>'AI Team','createdAt'=>'2026-03-27 08:15','updatedAt'=>$now,'tags'=>['faster-whisper','GPU','transcription'],
                'messages'=>[['id'=>'m01','type'=>'user','author'=>'Sgt. Matić','authorRole'=>'Field Intelligence','content'=>'Faster-Whisper crashes on audio > 30 min. CUDA OOM.','timestamp'=>'2026-03-27 08:15'],['id'=>'m02','type'=>'system','author'=>'System','content'=>'Ticket created. Priority: Critical.','timestamp'=>'2026-03-27 08:15'],['id'=>'m03','type'=>'admin','author'=>'AI Team','authorRole'=>'AI/ML','content'=>'Investigating. Likely needs chunked processing for long files.','timestamp'=>'2026-03-27 09:30']]],
            ['id'=>'t02','number'=>'TKT-002','subject'=>'Request: Export connections graph as SVG/PDF','status'=>'open','priority'=>'medium','category'=>'feature','reporter'=>'Maj. Novak','reporterEmail'=>'novak@argux.mil','assignee'=>'Unassigned','createdAt'=>'2026-03-26 14:20','updatedAt'=>'2026-03-26 14:20','tags'=>['connections','export','feature-request'],
                'messages'=>[['id'=>'m04','type'=>'user','author'=>'Maj. Novak','authorRole'=>'Analysis Lead','content'=>'Need to export connections graph for briefing materials. PNG is low quality. SVG or PDF would be better.','timestamp'=>'2026-03-26 14:20'],['id'=>'m05','type'=>'system','author'=>'System','content'=>'Ticket created. Priority: Medium. Awaiting assignment.','timestamp'=>'2026-03-26 14:20']]],
            ['id'=>'t03','number'=>'TKT-003','subject'=>'Camera CAM-03 intermittent disconnections','status'=>'in_progress','priority'=>'high','category'=>'hardware','reporter'=>'Cpt. Horvat','reporterEmail'=>'horvat@argux.mil','assignee'=>'IT Support','createdAt'=>'2026-03-25 10:00','updatedAt'=>'2026-03-27 07:00','tags'=>['camera','hardware','network'],
                'messages'=>[['id'=>'m06','type'=>'user','author'=>'Cpt. Horvat','authorRole'=>'Operations','content'=>'CAM-03 at Port Terminal East disconnects 3-4 times daily.','timestamp'=>'2026-03-25 10:00'],['id'=>'m07','type'=>'admin','author'=>'IT Support','content'=>'Checked network cable — replaced RJ45 connector. Monitoring.','timestamp'=>'2026-03-26 08:00'],['id'=>'m08','type'=>'system','author'=>'System','content'=>'Status changed to In Progress.','timestamp'=>'2026-03-26 08:00'],['id'=>'m09','type'=>'admin','author'=>'IT Support','content'=>'Still disconnecting. Suspect PoE switch port. Ordering replacement.','timestamp'=>'2026-03-27 07:00']]],
            ['id'=>'t04','number'=>'TKT-004','subject'=>'New operator training — batch of 5 recruits','status'=>'waiting','priority'=>'medium','category'=>'training','reporter'=>'Maj. Novak','reporterEmail'=>'novak@argux.mil','assignee'=>'Col. Tomić','createdAt'=>'2026-03-24 09:00','updatedAt'=>'2026-03-26 11:00','tags'=>['training','onboarding'],
                'messages'=>[['id'=>'m10','type'=>'user','author'=>'Maj. Novak','authorRole'=>'Analysis Lead','content'=>'5 new operators joining next week. Need training schedule and temp accounts.','timestamp'=>'2026-03-24 09:00'],['id'=>'m11','type'=>'admin','author'=>'Col. Tomić','authorRole'=>'System Admin','content'=>'Training slots confirmed for Mon-Wed. Waiting for HR clearance docs.','timestamp'=>'2026-03-25 14:00'],['id'=>'m12','type'=>'system','author'=>'System','content'=>'Status changed to Waiting.','timestamp'=>'2026-03-26 11:00']]],
            ['id'=>'t05','number'=>'TKT-005','subject'=>'LPR false positives on Croatian plates with diacritics','status'=>'in_progress','priority'=>'high','category'=>'bug','reporter'=>'Lt. Perić','reporterEmail'=>'peric@argux.mil','assignee'=>'AI Team','createdAt'=>'2026-03-23 16:30','updatedAt'=>'2026-03-26 10:00','tags'=>['LPR','OCR','accuracy','diacritics'],
                'messages'=>[['id'=>'m13','type'=>'user','author'=>'Lt. Perić','authorRole'=>'Intelligence Analyst','content'=>'LPR misreads Č→C, Š→S on Croatian plates. ~15% false positive rate.','timestamp'=>'2026-03-23 16:30'],['id'=>'m14','type'=>'admin','author'=>'AI Team','content'=>'Confirmed. PaddleOCR charset needs Croatian diacritics. Retraining model.','timestamp'=>'2026-03-25 09:00']]],
            ['id'=>'t06','number'=>'TKT-006','subject'=>'Request access to INTERPOL I-24/7 data source','status'=>'waiting','priority'=>'low','category'=>'access','reporter'=>'Lt. Perić','reporterEmail'=>'peric@argux.mil','assignee'=>'Security Team','createdAt'=>'2026-03-22 11:00','updatedAt'=>'2026-03-24 09:00','tags'=>['access','INTERPOL','clearance'],
                'messages'=>[['id'=>'m15','type'=>'user','author'=>'Lt. Perić','content'=>'Need read access to INTERPOL for cross-border investigation.','timestamp'=>'2026-03-22 11:00'],['id'=>'m16','type'=>'admin','author'=>'Security Team','content'=>'Requires TS clearance upgrade. Paperwork submitted to HQ.','timestamp'=>'2026-03-24 09:00']]],
            ['id'=>'t07','number'=>'TKT-007','subject'=>'Map tiles not loading on classified network segment','status'=>'resolved','priority'=>'high','category'=>'network','reporter'=>'Sgt. Matić','reporterEmail'=>'matic@argux.mil','assignee'=>'IT Support','createdAt'=>'2026-03-20 14:00','updatedAt'=>'2026-03-22 16:00','resolvedAt'=>'2026-03-22 16:00','tags'=>['map','network','tiles','firewall'],
                'messages'=>[['id'=>'m17','type'=>'user','author'=>'Sgt. Matić','content'=>'Map shows gray tiles on VLAN 30 (classified segment). Works on VLAN 10.','timestamp'=>'2026-03-20 14:00'],['id'=>'m18','type'=>'admin','author'=>'IT Support','content'=>'Firewall rule blocking tile server port 8443. Rule updated.','timestamp'=>'2026-03-22 16:00'],['id'=>'m19','type'=>'system','author'=>'System','content'=>'Status changed to Resolved.','timestamp'=>'2026-03-22 16:00']]],
            ['id'=>'t08','number'=>'TKT-008','subject'=>'Dashboard loading slowly after Kafka backlog','status'=>'resolved','priority'=>'medium','category'=>'bug','reporter'=>'Cpt. Horvat','reporterEmail'=>'horvat@argux.mil','assignee'=>'IT Support','createdAt'=>'2026-03-18 07:00','updatedAt'=>'2026-03-19 10:00','resolvedAt'=>'2026-03-19 10:00','tags'=>['dashboard','performance','kafka'],
                'messages'=>[['id'=>'m20','type'=>'user','author'=>'Cpt. Horvat','content'=>'Dashboard takes 15s+ to load. Started after weekend Kafka backlog.','timestamp'=>'2026-03-18 07:00'],['id'=>'m21','type'=>'admin','author'=>'IT Support','content'=>'Kafka consumer lag was 50k. Flushed backlog and restarted consumers.','timestamp'=>'2026-03-19 10:00']]],
            ['id'=>'t09','number'=>'TKT-009','subject'=>'Request: Bulk import persons from CSV','status'=>'closed','priority'=>'low','category'=>'feature','reporter'=>'Maj. Novak','reporterEmail'=>'novak@argux.mil','assignee'=>'Col. Tomić','createdAt'=>'2026-03-15 11:00','updatedAt'=>'2026-03-20 14:00','resolvedAt'=>'2026-03-20 14:00','tags'=>['import','CSV','persons'],
                'messages'=>[['id'=>'m22','type'=>'user','author'=>'Maj. Novak','content'=>'Need CSV import for batch person creation (Zagreb PD transfer).','timestamp'=>'2026-03-15 11:00'],['id'=>'m23','type'=>'admin','author'=>'Col. Tomić','content'=>'Added to roadmap for v0.28. Template format defined.','timestamp'=>'2026-03-18 09:00'],['id'=>'m24','type'=>'system','author'=>'System','content'=>'Ticket closed.','timestamp'=>'2026-03-20 14:00']]],
            ['id'=>'t10','number'=>'TKT-010','subject'=>'MFA enrollment email not sending','status'=>'closed','priority'=>'high','category'=>'security','reporter'=>'IT Support','reporterEmail'=>'support@argux.mil','assignee'=>'Col. Tomić','createdAt'=>'2026-03-12 08:00','updatedAt'=>'2026-03-13 11:00','resolvedAt'=>'2026-03-13 11:00','tags'=>['MFA','email','authentication'],
                'messages'=>[['id'=>'m25','type'=>'user','author'=>'IT Support','content'=>'New users not receiving MFA enrollment emails. SMTP config OK.','timestamp'=>'2026-03-12 08:00'],['id'=>'m26','type'=>'admin','author'=>'Col. Tomić','content'=>'Keycloak email template was missing. Restored from backup.','timestamp'=>'2026-03-13 11:00']]],
            ['id'=>'t11','number'=>'TKT-011','subject'=>'Data source sync timeout on EU Sanctions CFSP','status'=>'open','priority'=>'medium','category'=>'data','reporter'=>'Lt. Perić','reporterEmail'=>'peric@argux.mil','assignee'=>'IT Support','createdAt'=>'2026-03-27 07:45','updatedAt'=>'2026-03-27 07:45','tags'=>['data-source','sanctions','timeout'],
                'messages'=>[['id'=>'m27','type'=>'user','author'=>'Lt. Perić','content'=>'EU Sanctions CFSP sync timing out after 120s. Dataset grew to 15k+ entries.','timestamp'=>'2026-03-27 07:45']]],
            ['id'=>'t12','number'=>'TKT-012','subject'=>'Request: Night mode for Vision camera wall','status'=>'open','priority'=>'low','category'=>'feature','reporter'=>'Elena Petrova','reporterEmail'=>'petrova@argux.mil','assignee'=>'Unassigned','createdAt'=>'2026-03-27 06:30','updatedAt'=>'2026-03-27 06:30','tags'=>['vision','UI','night-mode'],
                'messages'=>[['id'=>'m28','type'=>'user','author'=>'Elena Petrova','authorRole'=>'Night Shift','content'=>'Vision wall is too bright for night ops. Need dimmer mode or red-shift filter.','timestamp'=>'2026-03-27 06:30']]],
        ];
    }

    /** GET /mock-api/admin/support/tickets */
    public function index(Request $request): JsonResponse
    {
        $data = self::tickets();
        $search = strtolower($request->query('search', ''));
        $status = $request->query('status', '');
        $priority = $request->query('priority', '');
        $category = $request->query('category', '');
        $assignee = $request->query('assignee', '');

        if ($status && $status !== 'all') $data = array_values(array_filter($data, fn($t) => $t['status'] === $status));
        if ($priority) $data = array_values(array_filter($data, fn($t) => $t['priority'] === $priority));
        if ($category) $data = array_values(array_filter($data, fn($t) => $t['category'] === $category));
        if ($assignee) $data = array_values(array_filter($data, fn($t) => $t['assignee'] === $assignee));
        if ($search) $data = array_values(array_filter($data, fn($t) => str_contains(strtolower($t['subject'].' '.$t['number'].' '.$t['reporter'].' '.implode(' ',$t['tags'])), $search)));

        usort($data, fn($a, $b) => strcmp($b['updatedAt'], $a['updatedAt']));

        $counts = ['all'=>count(self::tickets()),'open'=>0,'in_progress'=>0,'waiting'=>0,'resolved'=>0,'closed'=>0];
        foreach (self::tickets() as $t) $counts[$t['status']]++;

        return response()->json([
            'data' => $data,
            'meta' => ['total' => count($data)],
            'counts' => $counts,
        ]);
    }

    /** GET /mock-api/admin/support/tickets/{id} */
    public function show(string $id): JsonResponse
    {
        $ticket = collect(self::tickets())->firstWhere('id', $id);
        if (!$ticket) return response()->json(['message'=>'Ticket not found.','code'=>'NOT_FOUND'], 404);
        return response()->json(['data'=>$ticket]);
    }

    /** POST /mock-api/admin/support/tickets */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'subject'=>['required','string','min:5','max:200'],
            'description'=>['required','string','min:10','max:5000'],
            'category'=>['required','in:bug,feature,access,hardware,network,training,data,security'],
            'priority'=>['required','in:critical,high,medium,low'],
            'assignee'=>['nullable','string','max:100'],
        ]);
        Log::info('Support API: ticket created', ['subject'=>$request->input('subject')]);
        usleep(500_000);
        $num = 'TKT-'.str_pad(count(self::tickets())+1, 3, '0', STR_PAD_LEFT);
        $now = now()->toDateTimeString();
        return response()->json(['message'=>"Ticket {$num} created.",'data'=>[
            'id'=>'t-'.Str::random(8),'number'=>$num,'subject'=>$request->input('subject'),
            'status'=>'open','priority'=>$request->input('priority'),'category'=>$request->input('category'),
            'reporter'=>'System Administrator','reporterEmail'=>'admin@argux.mil',
            'assignee'=>$request->input('assignee','Unassigned'),
            'createdAt'=>$now,'updatedAt'=>$now,'tags'=>[$request->input('category')],
            'messages'=>[
                ['id'=>'m-'.Str::random(6),'type'=>'user','author'=>'System Administrator','authorRole'=>'Admin','content'=>$request->input('description'),'timestamp'=>$now],
                ['id'=>'m-'.Str::random(6),'type'=>'system','author'=>'System','content'=>"Ticket {$num} created. Priority: ".ucfirst($request->input('priority')).".","timestamp"=>$now],
            ],
        ]], 201);
    }

    /** PATCH /mock-api/admin/support/tickets/{id}/status */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate(['status'=>['required','in:open,in_progress,waiting,resolved,closed']]);
        $ticket = collect(self::tickets())->firstWhere('id', $id);
        if (!$ticket) return response()->json(['message'=>'Ticket not found.','code'=>'NOT_FOUND'], 404);
        $ns = $request->input('status');
        Log::info('Support API: status changed', ['ticket'=>$ticket['number'],'from'=>$ticket['status'],'to'=>$ns]);
        return response()->json([
            'message'=>"Status changed to {$ns}.",
            'id'=>$id,'old_status'=>$ticket['status'],'new_status'=>$ns,
            'system_message'=>['id'=>'m-'.Str::random(6),'type'=>'system','author'=>'System','content'=>"Status changed to ".ucfirst(str_replace('_',' ',$ns)).".","timestamp"=>now()->toDateTimeString()],
        ]);
    }

    /** PATCH /mock-api/admin/support/tickets/{id}/priority */
    public function updatePriority(Request $request, string $id): JsonResponse
    {
        $request->validate(['priority'=>['required','in:critical,high,medium,low']]);
        $ticket = collect(self::tickets())->firstWhere('id', $id);
        if (!$ticket) return response()->json(['message'=>'Ticket not found.','code'=>'NOT_FOUND'], 404);
        $np = $request->input('priority');
        Log::info('Support API: priority changed', ['ticket'=>$ticket['number'],'to'=>$np]);
        return response()->json(['message'=>"Priority changed to {$np}.",'id'=>$id,'old_priority'=>$ticket['priority'],'new_priority'=>$np]);
    }

    /** PATCH /mock-api/admin/support/tickets/{id}/assignee */
    public function updateAssignee(Request $request, string $id): JsonResponse
    {
        $request->validate(['assignee'=>['required','string','max:100']]);
        $ticket = collect(self::tickets())->firstWhere('id', $id);
        if (!$ticket) return response()->json(['message'=>'Ticket not found.','code'=>'NOT_FOUND'], 404);
        $na = $request->input('assignee');
        Log::info('Support API: assignee changed', ['ticket'=>$ticket['number'],'to'=>$na]);
        return response()->json(['message'=>"Assigned to {$na}.",'id'=>$id,'old_assignee'=>$ticket['assignee'],'new_assignee'=>$na]);
    }

    /** POST /mock-api/admin/support/tickets/{id}/reply */
    public function reply(Request $request, string $id): JsonResponse
    {
        $request->validate(['content'=>['required','string','min:1','max:10000']]);
        $ticket = collect(self::tickets())->firstWhere('id', $id);
        if (!$ticket) return response()->json(['message'=>'Ticket not found.','code'=>'NOT_FOUND'], 404);
        Log::info('Support API: reply added', ['ticket'=>$ticket['number']]);
        usleep(400_000);
        return response()->json(['message'=>"Reply added to {$ticket['number']}.",'data'=>[
            'id'=>'m-'.Str::random(8),'type'=>'admin','author'=>'System Administrator','authorRole'=>'Admin',
            'content'=>$request->input('content'),'timestamp'=>now()->toDateTimeString(),
        ]]);
    }

    /** DELETE /mock-api/admin/support/tickets/{id} */
    public function destroy(string $id): JsonResponse
    {
        $ticket = collect(self::tickets())->firstWhere('id', $id);
        if (!$ticket) return response()->json(['message'=>'Ticket not found.','code'=>'NOT_FOUND'], 404);
        if (!in_array($ticket['status'], ['resolved','closed'])) {
            return response()->json(['message'=>'Only resolved or closed tickets can be deleted.','code'=>'TICKET_ACTIVE'], 409);
        }
        Log::info('Support API: ticket deleted', ['ticket'=>$ticket['number']]);
        return response()->json(['message'=>"Ticket {$ticket['number']} deleted.",'id'=>$id]);
    }
}
