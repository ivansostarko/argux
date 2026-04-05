<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX Operations Mock REST API.
 * Surveillance operation management with phases, teams, zones, alerts, events.
 */
class OperationsApiController extends Controller
{
    private static function ops(): array
    {
        $tm = fn($id,$n,$i,$c,$l,$m) => ['id'=>$id,'name'=>$n,'icon'=>$i,'color'=>$c,'lead'=>$l,'members'=>$m];
        $mb = fn($pid,$r,$cs) => ['personId'=>$pid,'role'=>$r,'callsign'=>$cs];
        $zn = fn($id,$n,$t,$la,$ln,$r) => ['id'=>$id,'name'=>$n,'type'=>$t,'lat'=>$la,'lng'=>$ln,'radius'=>$r];
        $ar = fn($id,$t,$d,$s,$e) => ['id'=>$id,'type'=>$t,'description'=>$d,'severity'=>$s,'enabled'=>$e];
        $tl = fn($id,$d,$l,$t,$c) => ['id'=>$id,'date'=>$d,'label'=>$l,'type'=>$t,'color'=>$c];
        $cl = fn($id,$l,$d,$a) => ['id'=>$id,'label'=>$l,'done'=>$d,'assignee'=>$a];

        return [
            ['id'=>'op01','codename'=>'HAWK','name'=>'Operation HAWK — Maritime Interdiction','description'=>'Joint maritime surveillance operation targeting suspected smuggling network operating through Adriatic port facilities.','phase'=>'Active','priority'=>'Critical','classification'=>'TOP SECRET // NOFORN','commander'=>'Col. Tomić','startDate'=>'2026-01-15','endDate'=>'',
                'targetPersonIds'=>[1,9,12],'targetOrgIds'=>[1,5],
                'deployedDeviceIds'=>[1,3,7,12],'trackedVehicleIds'=>[1,4],
                'teams'=>[$tm('t01','Alpha — Surveillance','🔭','#3b82f6','Cpt. Horvat',[$mb(14,'Lead','A-1'),$mb(15,'Observer','A-2'),$mb(16,'Comms','A-3')]),$tm('t02','Bravo — Mobile','🚗','#22c55e','Sgt. Matić',[$mb(17,'Lead','B-1'),$mb(18,'Driver','B-2'),$mb(19,'Spotter','B-3')]),$tm('t03','Delta — Technical','📡','#f59e0b','Lt. Perić',[$mb(20,'Lead','D-1'),$mb(21,'SIGINT','D-2')])],
                'zones'=>[$zn('z01','Port Terminal East','restricted',45.3271,14.4422,500),$zn('z02','Warehouse District','surveillance',45.8090,15.9920,300),$zn('z03','Café Europa Zone','surveillance',45.8131,15.9772,100),$zn('z04','Highway A3 Corridor','buffer',45.7842,15.9501,2000)],
                'alertRules'=>[$ar('a01','Zone Entry','Horvat enters Port Terminal','critical',true),$ar('a02','Co-location','Horvat + Mendoza < 50m','critical',true),$ar('a03','LPR Match','ZG-1847-AB detected','high',true),$ar('a04','Speed Alert','HAWK subjects > 120 km/h','medium',true)],
                'timeline'=>[$tl('tl01','2026-01-15','Operation HAWK initiated','phase','#3b82f6'),$tl('tl02','2026-02-01','Phase: Preparation','phase','#f59e0b'),$tl('tl03','2026-02-15','Phase: Active','phase','#22c55e'),$tl('tl04','2026-03-24','Co-location: Horvat-Mendoza at Savska','intel','#ec4899'),$tl('tl05','2026-03-27','Port zone entry detected','alert','#ef4444')],
                'checklist'=>[$cl('ck01','Deploy surveillance team to port',true,'Cpt. Horvat'),$cl('ck02','Activate GPS trackers on target vehicles',true,'Lt. Perić'),$cl('ck03','Configure LPR alerts for target plates',true,'Sgt. Matić'),$cl('ck04','Coordinate with port authority',false,'Col. Tomić'),$cl('ck05','Prepare evidence packages for prosecutor',false,'Maj. Novak')],
                'briefingNotes'=>'SITREP: Active surveillance of Horvat network. Multiple co-location events confirmed. Port Terminal under 24/7 monitoring.','commsChannel'=>'HAWK-NET','commsFreq'=>'Channel 7 (encrypted)','riskLevel'=>78,'threatAssessment'=>'HIGH — Counter-surveillance behavior detected. Subject awareness suspected.','stats'=>['events'=>247,'alerts'=>34,'hoursActive'=>1680,'intel'=>18]],
            ['id'=>'op02','codename'=>'GLACIER','name'=>'Operation GLACIER — Financial Network','description'=>'Investigation of financial flows through Meridian Finance Ltd and connected entities. Focus on trade-based money laundering patterns.','phase'=>'Active','priority'=>'High','classification'=>'SECRET','commander'=>'Maj. Novak','startDate'=>'2026-02-01','endDate'=>'',
                'targetPersonIds'=>[3,7],'targetOrgIds'=>[2,8],
                'deployedDeviceIds'=>[5,8],'trackedVehicleIds'=>[],
                'teams'=>[$tm('t04','Echo — FinInt','💰','#f59e0b','Financial Intel',[$mb(22,'Analyst','E-1'),$mb(23,'Analyst','E-2')])],
                'zones'=>[$zn('z05','Meridian Finance HQ','surveillance',45.8150,15.9800,200),$zn('z06','Hotel Esplanade','surveillance',45.8070,15.9740,150)],
                'alertRules'=>[$ar('a05','Transaction','Al-Rashid transactions > €10K','critical',true),$ar('a06','Comms Intercept','Arabic keyword detection','high',true)],
                'timeline'=>[$tl('tl06','2026-02-01','Operation GLACIER initiated','phase','#3b82f6'),$tl('tl07','2026-02-15','Phase: Active','phase','#22c55e'),$tl('tl08','2026-03-21','€847K flagged transactions detected','intel','#f59e0b')],
                'checklist'=>[$cl('ck06','Map Meridian Finance ownership structure',true,'Financial Intel'),$cl('ck07','Cross-reference with EU sanctions list',true,'Financial Intel'),$cl('ck08','Interview banking contacts',false,'Maj. Novak')],
                'briefingNotes'=>'Financial investigation ongoing. 23 AML-flagged transactions identified. Shell company network mapped.','commsChannel'=>'GLACIER-NET','commsFreq'=>'Channel 12 (encrypted)','riskLevel'=>52,'threatAssessment'=>'MEDIUM — Subjects unaware of investigation. Low counter-intel risk.','stats'=>['events'=>89,'alerts'=>23,'hoursActive'=>1344,'intel'=>12]],
            ['id'=>'op03','codename'=>'CERBERUS','name'=>'Operation CERBERUS — Border Security','description'=>'Completed border security operation targeting cross-border smuggling routes along Croatia-Bosnia corridor.','phase'=>'Closed','priority'=>'Medium','classification'=>'SECRET','commander'=>'Col. Tomić','startDate'=>'2025-06-01','endDate'=>'2026-02-28',
                'targetPersonIds'=>[6],'targetOrgIds'=>[3],
                'deployedDeviceIds'=>[],'trackedVehicleIds'=>[],
                'teams'=>[],'zones'=>[],'alertRules'=>[],
                'timeline'=>[$tl('tl09','2025-06-01','Operation CERBERUS initiated','phase','#3b82f6'),$tl('tl10','2025-09-01','Phase: Active','phase','#22c55e'),$tl('tl11','2026-02-15','Phase: Debrief','phase','#a855f7'),$tl('tl12','2026-02-28','Operation closed','phase','#6b7280')],
                'checklist'=>[$cl('ck09','Final report submitted',true,'Col. Tomić'),$cl('ck10','Evidence archived',true,'Maj. Novak')],
                'briefingNotes'=>'Operation concluded. 3 arrests, 2 convictions. Full debrief report filed.','commsChannel'=>'CERBERUS-NET (decommissioned)','commsFreq'=>'—','riskLevel'=>0,'threatAssessment'=>'CLOSED','stats'=>['events'=>1247,'alerts'=>156,'hoursActive'=>6552,'intel'=>47]],
            ['id'=>'op04','codename'=>'PHOENIX','name'=>'Operation PHOENIX — Technology Proliferation','description'=>'Investigation into dual-use technology exports through Dragon Tech Solutions supply chain.','phase'=>'Preparation','priority'=>'Medium','classification'=>'SECRET','commander'=>'Lt. Perić','startDate'=>'2026-03-01','endDate'=>'',
                'targetPersonIds'=>[10],'targetOrgIds'=>[4,6],
                'deployedDeviceIds'=>[10],'trackedVehicleIds'=>[7],
                'teams'=>[$tm('t05','Foxtrot — Tech','💻','#06b6d4','Lt. Perić',[$mb(24,'Lead','F-1'),$mb(25,'Analyst','F-2')])],
                'zones'=>[$zn('z07','Dragon Tech Warehouse','surveillance',45.7900,15.9600,250)],
                'alertRules'=>[$ar('a07','Cargo Manifest','Weight discrepancy detected','high',true)],
                'timeline'=>[$tl('tl13','2026-03-01','Operation PHOENIX initiated','phase','#3b82f6'),$tl('tl14','2026-03-15','Cargo manifest discrepancies detected','intel','#f59e0b')],
                'checklist'=>[$cl('ck11','Obtain surveillance warrant',true,'Lt. Perić'),$cl('ck12','Deploy tracking on Li Wei vehicle',false,'Sgt. Matić'),$cl('ck13','Coordinate with customs authority',false,'Lt. Perić')],
                'briefingNotes'=>'Preparation phase. Cargo manifest analysis ongoing. 8 discrepancies identified.','commsChannel'=>'PHOENIX-NET','commsFreq'=>'Channel 15 (encrypted)','riskLevel'=>28,'threatAssessment'=>'LOW — Subjects unaware. Initial reconnaissance only.','stats'=>['events'=>34,'alerts'=>8,'hoursActive'=>600,'intel'=>4]],
            ['id'=>'op05','codename'=>'TEMPEST','name'=>'Operation TEMPEST — Cyber Threat','description'=>'Planned cybersecurity investigation targeting infrastructure attacks on critical port systems.','phase'=>'Planning','priority'=>'High','classification'=>'TOP SECRET','commander'=>'Col. Tomić','startDate'=>'2026-04-01','endDate'=>'',
                'targetPersonIds'=>[],'targetOrgIds'=>[],
                'deployedDeviceIds'=>[],'trackedVehicleIds'=>[],
                'teams'=>[],'zones'=>[],'alertRules'=>[],
                'timeline'=>[$tl('tl15','2026-04-01','Operation TEMPEST initiated','phase','#3b82f6')],
                'checklist'=>[$cl('ck14','Threat assessment report',false,'Col. Tomić'),$cl('ck15','Assemble cyber team',false,'Lt. Perić'),$cl('ck16','Define target scope',false,'Maj. Novak')],
                'briefingNotes'=>'Planning phase. Awaiting threat assessment completion.','commsChannel'=>'TEMPEST-NET','commsFreq'=>'TBD','riskLevel'=>0,'threatAssessment'=>'Pending initial assessment.','stats'=>['events'=>0,'alerts'=>0,'hoursActive'=>0,'intel'=>0]],
        ];
    }

    /** GET /mock-api/operations */
    public function index(Request $request): JsonResponse
    {
        $data = self::ops();
        $phase = $request->query('phase', '');
        $search = strtolower($request->query('search', ''));

        if ($phase && $phase !== 'all') $data = array_values(array_filter($data, fn($o) => $o['phase'] === $phase));
        if ($search) $data = array_values(array_filter($data, fn($o) => str_contains(strtolower($o['name'].' '.$o['codename'].' '.$o['description']), $search)));

        return response()->json(['data' => $data, 'meta' => ['total' => count($data)]]);
    }

    /** GET /mock-api/operations/{id} */
    public function show(string $id): JsonResponse
    {
        $op = collect(self::ops())->firstWhere('id', $id);
        if (!$op) return response()->json(['message' => 'Operation not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $op]);
    }

    /** POST /mock-api/operations */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'codename' => ['required', 'string', 'min:2', 'max:20'],
            'name' => ['required', 'string', 'min:3'],
            'priority' => ['required', 'in:Critical,High,Medium,Low'],
        ]);
        Log::info('Operations API: created', ['codename' => $request->input('codename')]);
        usleep(400_000);
        return response()->json(['message' => 'Operation created.', 'data' => [
            'id' => 'op-' . Str::random(6), 'codename' => $request->input('codename'),
            'name' => $request->input('name'), 'phase' => 'Planning', 'priority' => $request->input('priority'),
            'startDate' => now()->toDateString(),
        ]], 201);
    }

    /** PATCH /mock-api/operations/{id}/phase */
    public function updatePhase(Request $request, string $id): JsonResponse
    {
        $op = collect(self::ops())->firstWhere('id', $id);
        if (!$op) return response()->json(['message' => 'Operation not found.', 'code' => 'NOT_FOUND'], 404);
        $request->validate(['phase' => ['required', 'in:Planning,Preparation,Active,Debrief,Closed']]);
        $new = $request->input('phase');
        if ($op['phase'] === 'Closed' && $new !== 'Planning') return response()->json(['message' => 'Closed operations can only reopen to Planning.', 'code' => 'INVALID_TRANSITION'], 409);
        return response()->json(['message' => "Phase changed to {$new}.", 'id' => $id, 'phase' => $new]);
    }

    /** PUT /mock-api/operations/{id} */
    public function update(Request $request, string $id): JsonResponse
    {
        $op = collect(self::ops())->firstWhere('id', $id);
        if (!$op) return response()->json(['message' => 'Operation not found.', 'code' => 'NOT_FOUND'], 404);
        Log::info('Operations API: updated', ['id' => $id]);
        return response()->json(['message' => 'Operation updated.', 'data' => array_merge($op, $request->only(['name', 'description', 'commander', 'classification', 'priority']))]);
    }

    /** DELETE /mock-api/operations/{id} */
    public function destroy(string $id): JsonResponse
    {
        $op = collect(self::ops())->firstWhere('id', $id);
        if (!$op) return response()->json(['message' => 'Operation not found.', 'code' => 'NOT_FOUND'], 404);
        if ($op['phase'] === 'Active') return response()->json(['message' => 'Cannot delete active operation. Close or debrief first.', 'code' => 'OP_ACTIVE'], 409);
        Log::info('Operations API: deleted', ['id' => $id]);
        return response()->json(['message' => "Operation {$op['codename']} deleted.", 'id' => $id]);
    }

    /** GET /mock-api/operations/{id}/events */
    public function events(Request $request, string $id): JsonResponse
    {
        $op = collect(self::ops())->firstWhere('id', $id);
        if (!$op) return response()->json(['message' => 'Operation not found.', 'code' => 'NOT_FOUND'], 404);
        $events = [
            'op01' => [
                ['id'=>'oe01','type'=>'alert','title'=>'Co-location: Horvat + Mendoza','description'=>'23m proximity at Savska 41','personName'=>'Marko Horvat','timestamp'=>'2026-03-27 09:28','severity'=>'critical','source'=>'Alert Engine'],
                ['id'=>'oe02','type'=>'surveillance','title'=>'Port zone entry detected','description'=>'Horvat entered Port Terminal gate 7','personName'=>'Marko Horvat','timestamp'=>'2026-03-27 08:45','severity'=>'high','source'=>'Geofence'],
                ['id'=>'oe03','type'=>'intel','title'=>'Phone intercept — keyword match','description'=>'Keywords: port, Thursday, dock 7','personName'=>'Marko Horvat','timestamp'=>'2026-03-27 08:22','severity'=>'high','source'=>'SIGINT'],
                ['id'=>'oe04','type'=>'movement','title'=>'LPR: ZG-1847-AB at Vukovarska','description'=>'97% confidence, eastbound','personName'=>'Marko Horvat','timestamp'=>'2026-03-27 07:45','severity'=>'medium','source'=>'LPR Network'],
                ['id'=>'oe05','type'=>'surveillance','title'=>'Babić night entry — warehouse','description'=>'CAM-12 loitering detection at 03:15','personName'=>'Ivan Babić','timestamp'=>'2026-03-27 03:15','severity'=>'high','source'=>'AI Detection'],
            ],
            'op02' => [
                ['id'=>'oe06','type'=>'intel','title'=>'€24K flagged transaction','description'=>'Meridian Finance → shell company','personName'=>'Ahmed Al-Rashid','timestamp'=>'2026-03-26 16:00','severity'=>'critical','source'=>'AML Monitor'],
                ['id'=>'oe07','type'=>'comm','title'=>'Arabic SMS intercepted','description'=>'Keywords: shipping, Thursday, port','personName'=>'Youssef Hassan','timestamp'=>'2026-03-27 07:55','severity'=>'high','source'=>'Intercept'],
            ],
        ];
        $data = $events[$id] ?? [];
        $type = $request->query('type', '');
        if ($type && $type !== 'all') $data = array_values(array_filter($data, fn($e) => $e['type'] === $type));
        return response()->json(['data' => $data, 'meta' => ['total' => count($data)]]);
    }
}
