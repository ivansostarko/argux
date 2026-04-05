<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX Alert Rules Mock REST API.
 * CRUD for rules, alert event feed, toggle enable/disable.
 */
class AlertsApiController extends Controller
{
    private static function rules(): array
    {
        return [
            ['id'=>'ar01','name'=>'Port Zone Entry — Horvat','description'=>'Alert when Horvat enters Port Terminal restricted zone','triggerType'=>'zone_entry','severity'=>'Critical','enabled'=>true,'channels'=>['In-App','Email','SMS'],'cooldown'=>5,'targetPersonIds'=>[1],'targetPersonNames'=>['Marko Horvat'],'targetOrgIds'=>[],'targetOrgNames'=>[],'operationCode'=>'HAWK','config'=>['zone'=>'Port Terminal East','timeWindow'=>'24/7'],'firedCount'=>12,'lastFired'=>'2026-03-27 08:45','createdAt'=>'2026-02-15','createdBy'=>'Cpt. Horvat'],
            ['id'=>'ar02','name'=>'Co-location — Horvat + Mendoza','description'=>'Alert when Horvat and Mendoza are within 50m','triggerType'=>'colocation','severity'=>'Critical','enabled'=>true,'channels'=>['In-App','Email'],'cooldown'=>10,'targetPersonIds'=>[1,9],'targetPersonNames'=>['Marko Horvat','Carlos Mendoza'],'targetOrgIds'=>[],'targetOrgNames'=>[],'operationCode'=>'HAWK','config'=>['radius'=>'50m','subjects'=>'Horvat, Mendoza'],'firedCount'=>8,'lastFired'=>'2026-03-27 09:28','createdAt'=>'2026-02-20','createdBy'=>'Maj. Novak'],
            ['id'=>'ar03','name'=>'Face Match — Mendoza Cameras','description'=>'Alert on face recognition match for Mendoza above 85%','triggerType'=>'face_match','severity'=>'Critical','enabled'=>true,'channels'=>['In-App','Email','SMS'],'cooldown'=>15,'targetPersonIds'=>[9],'targetPersonNames'=>['Carlos Mendoza'],'targetOrgIds'=>[],'targetOrgNames'=>[],'operationCode'=>'HAWK','config'=>['threshold'=>'85%','cameras'=>'All'],'firedCount'=>3,'lastFired'=>'2026-03-26 22:15','createdAt'=>'2026-02-22','createdBy'=>'Lt. Perić'],
            ['id'=>'ar04','name'=>'LPR — Horvat Vehicle ZG-1847-AB','description'=>'Alert on LPR capture of plate ZG-1847-AB','triggerType'=>'lpr_match','severity'=>'Warning','enabled'=>true,'channels'=>['In-App'],'cooldown'=>30,'targetPersonIds'=>[1],'targetPersonNames'=>['Marko Horvat'],'targetOrgIds'=>[],'targetOrgNames'=>[],'operationCode'=>'HAWK','config'=>['plate'=>'ZG-1847-AB','locations'=>'All LPR readers'],'firedCount'=>31,'lastFired'=>'2026-03-27 07:45','createdAt'=>'2026-01-10','createdBy'=>'Sgt. Matić'],
            ['id'=>'ar05','name'=>'Signal Lost — GPS Trackers','description'=>'Alert when any GPS tracker goes offline for >10 minutes','triggerType'=>'signal_lost','severity'=>'Warning','enabled'=>true,'channels'=>['In-App','Email'],'cooldown'=>60,'targetPersonIds'=>[],'targetPersonNames'=>[],'targetOrgIds'=>[],'targetOrgNames'=>[],'operationCode'=>'','config'=>['timeout'=>'10 min','devices'=>'All GPS'],'firedCount'=>7,'lastFired'=>'2026-03-27 08:55','createdAt'=>'2026-01-05','createdBy'=>'System'],
            ['id'=>'ar06','name'=>'Speed Alert — HAWK Subjects','description'=>'Alert when any HAWK subject vehicle exceeds 120 km/h','triggerType'=>'speed_alert','severity'=>'Warning','enabled'=>true,'channels'=>['In-App'],'cooldown'=>15,'targetPersonIds'=>[1,9,12],'targetPersonNames'=>['Marko Horvat','Carlos Mendoza','Ivan Babić'],'targetOrgIds'=>[],'targetOrgNames'=>[],'operationCode'=>'HAWK','config'=>['speed'=>'120 km/h','context'=>'Urban zones'],'firedCount'=>4,'lastFired'=>'2026-03-25 23:10','createdAt'=>'2026-02-28','createdBy'=>'Cpt. Horvat'],
            ['id'=>'ar07','name'=>'Warehouse Zone — Night Entry','description'=>'Alert on night-time entry (22:00-06:00) to warehouse zone','triggerType'=>'zone_entry','severity'=>'Critical','enabled'=>true,'channels'=>['In-App','Email','SMS'],'cooldown'=>5,'targetPersonIds'=>[12],'targetPersonNames'=>['Ivan Babić'],'targetOrgIds'=>[],'targetOrgNames'=>[],'operationCode'=>'HAWK','config'=>['zone'=>'Warehouse District','timeWindow'=>'22:00-06:00'],'firedCount'=>5,'lastFired'=>'2026-03-27 03:15','createdAt'=>'2026-03-01','createdBy'=>'Maj. Novak'],
            ['id'=>'ar08','name'=>'Keyword — Port Thursday Dock','description'=>'Alert on keyword detection in intercepted communications','triggerType'=>'keyword','severity'=>'Warning','enabled'=>true,'channels'=>['In-App','Email'],'cooldown'=>0,'targetPersonIds'=>[],'targetPersonNames'=>[],'targetOrgIds'=>[],'targetOrgNames'=>[],'operationCode'=>'HAWK','config'=>['keywords'=>'port, Thursday, dock 7, delivery','languages'=>'Croatian, English'],'firedCount'=>6,'lastFired'=>'2026-03-27 08:22','createdAt'=>'2026-03-05','createdBy'=>'Lt. Perić'],
            ['id'=>'ar09','name'=>'Hassan Zone Exit — Monitored','description'=>'Alert when Hassan exits monitored residential zone','triggerType'=>'zone_exit','severity'=>'Warning','enabled'=>true,'channels'=>['In-App'],'cooldown'=>30,'targetPersonIds'=>[7],'targetPersonNames'=>['Youssef Hassan'],'targetOrgIds'=>[],'targetOrgNames'=>[],'operationCode'=>'GLACIER','config'=>['zone'=>'Hassan Residential','timeWindow'=>'24/7'],'firedCount'=>14,'lastFired'=>'2026-03-26 19:30','createdAt'=>'2026-02-10','createdBy'=>'Lt. Perić'],
            ['id'=>'ar10','name'=>'Photo/Video — Babić Surveillance','description'=>'Alert when new photo or video captured of Babić','triggerType'=>'photo_video','severity'=>'Informational','enabled'=>true,'channels'=>['In-App'],'cooldown'=>60,'targetPersonIds'=>[12],'targetPersonNames'=>['Ivan Babić'],'targetOrgIds'=>[],'targetOrgNames'=>[],'operationCode'=>'HAWK','config'=>['sources'=>'All cameras','tod'=>'Any'],'firedCount'=>18,'lastFired'=>'2026-03-26 03:30','createdAt'=>'2026-03-10','createdBy'=>'Sgt. Matić'],
            ['id'=>'ar11','name'=>'Al-Rashid Financial Trigger','description'=>'Alert on transactions >€10K involving Al-Rashid accounts','triggerType'=>'keyword','severity'=>'Critical','enabled'=>true,'channels'=>['In-App','Email','Webhook'],'cooldown'=>0,'targetPersonIds'=>[3],'targetPersonNames'=>['Ahmed Al-Rashid'],'targetOrgIds'=>[103],'targetOrgNames'=>['Meridian Finance'],'operationCode'=>'GLACIER','config'=>['keywords'=>'transaction, transfer, payment','threshold'=>'€10,000'],'firedCount'=>23,'lastFired'=>'2026-03-26 16:00','createdAt'=>'2026-01-20','createdBy'=>'Financial Intel'],
            ['id'=>'ar12','name'=>'Co-location — Babić + Horvat','description'=>'Alert when Babić and Horvat are within 100m','triggerType'=>'colocation','severity'=>'Warning','enabled'=>false,'channels'=>['In-App'],'cooldown'=>30,'targetPersonIds'=>[12,1],'targetPersonNames'=>['Ivan Babić','Marko Horvat'],'targetOrgIds'=>[],'targetOrgNames'=>[],'operationCode'=>'HAWK','config'=>['radius'=>'100m'],'firedCount'=>6,'lastFired'=>'2026-03-25 16:30','createdAt'=>'2026-03-15','createdBy'=>'Maj. Novak'],
            ['id'=>'ar13','name'=>'Adriatic Maritime Vessel Alert','description'=>'Alert on unauthorized vessel movement in restricted port zones','triggerType'=>'zone_entry','severity'=>'Warning','enabled'=>false,'channels'=>['In-App','Email'],'cooldown'=>15,'targetPersonIds'=>[],'targetPersonNames'=>[],'targetOrgIds'=>[101],'targetOrgNames'=>['Adriatic Maritime'],'operationCode'=>'HAWK','config'=>['zone'=>'Port Restricted','assets'=>'Vessels'],'firedCount'=>3,'lastFired'=>'2026-03-22 06:00','createdAt'=>'2026-03-12','createdBy'=>'Cpt. Horvat'],
        ];
    }

    private static function events(): array
    {
        return [
            ['id'=>'ae01','ruleId'=>'ar02','ruleName'=>'Co-location — Horvat + Mendoza','triggerType'=>'colocation','severity'=>'Critical','title'=>'Co-location: Horvat + Mendoza (23m) at Savska 41','personName'=>'Horvat, Mendoza','location'=>'Savska 41, Zagreb','timestamp'=>'2026-03-27 09:28','timeAgo'=>'2m ago','acknowledged'=>false],
            ['id'=>'ae02','ruleId'=>'ar05','ruleName'=>'Signal Lost — GPS Trackers','triggerType'=>'signal_lost','severity'=>'Warning','title'=>'GPS Tracker #0291 offline (Subject Delta-7)','personName'=>'—','location'=>'45.8131°N, 15.9775°E','timestamp'=>'2026-03-27 08:55','timeAgo'=>'35m ago','acknowledged'=>false],
            ['id'=>'ae03','ruleId'=>'ar01','ruleName'=>'Port Zone Entry — Horvat','triggerType'=>'zone_entry','severity'=>'Critical','title'=>'Horvat entered Port Terminal East gate 7','personName'=>'Marko Horvat','location'=>'Port Terminal East','timestamp'=>'2026-03-27 08:45','timeAgo'=>'45m ago','acknowledged'=>false],
            ['id'=>'ae04','ruleId'=>'ar08','ruleName'=>'Keyword — Port Thursday Dock','triggerType'=>'keyword','severity'=>'Warning','title'=>'Keywords detected: "port", "Thursday", "dock 7"','personName'=>'Marko Horvat','location'=>'Phone Intercept','timestamp'=>'2026-03-27 08:22','timeAgo'=>'1h ago','acknowledged'=>true],
            ['id'=>'ae05','ruleId'=>'ar04','ruleName'=>'LPR — Horvat Vehicle ZG-1847-AB','triggerType'=>'lpr_match','severity'=>'Warning','title'=>'LPR: ZG-1847-AB at Vukovarska (97% conf)','personName'=>'Marko Horvat','location'=>'Vukovarska cesta','timestamp'=>'2026-03-27 07:45','timeAgo'=>'2h ago','acknowledged'=>true],
            ['id'=>'ae06','ruleId'=>'ar07','ruleName'=>'Warehouse Zone — Night Entry','triggerType'=>'zone_entry','severity'=>'Critical','title'=>'Babić night entry to warehouse zone at 03:15','personName'=>'Ivan Babić','location'=>'Warehouse District','timestamp'=>'2026-03-27 03:15','timeAgo'=>'6h ago','acknowledged'=>true],
            ['id'=>'ae07','ruleId'=>'ar03','ruleName'=>'Face Match — Mendoza Cameras','triggerType'=>'face_match','severity'=>'Critical','title'=>'Face match: Mendoza at port camera (94%)','personName'=>'Carlos Mendoza','location'=>'Port Terminal East','timestamp'=>'2026-03-26 22:15','timeAgo'=>'11h ago','acknowledged'=>true],
            ['id'=>'ae08','ruleId'=>'ar09','ruleName'=>'Hassan Zone Exit — Monitored','triggerType'=>'zone_exit','severity'=>'Warning','title'=>'Hassan exited monitored residential zone','personName'=>'Youssef Hassan','location'=>'Hassan Residential','timestamp'=>'2026-03-26 19:30','timeAgo'=>'14h ago','acknowledged'=>true],
        ];
    }

    /** GET /mock-api/alerts/rules */
    public function rules(Request $request): JsonResponse
    {
        $data = self::rules();
        $type = $request->query('type', '');
        $severity = $request->query('severity', '');
        $search = strtolower($request->query('search', ''));
        $enabled = $request->query('enabled', '');

        if ($type && $type !== 'all') $data = array_values(array_filter($data, fn($r) => $r['triggerType'] === $type));
        if ($severity && $severity !== 'all') $data = array_values(array_filter($data, fn($r) => $r['severity'] === $severity));
        if ($enabled === 'enabled') $data = array_values(array_filter($data, fn($r) => $r['enabled']));
        if ($enabled === 'disabled') $data = array_values(array_filter($data, fn($r) => !$r['enabled']));
        if ($search) $data = array_values(array_filter($data, fn($r) => str_contains(strtolower($r['name'].' '.$r['description'].' '.implode(' ',$r['targetPersonNames'])), $search)));

        return response()->json(['data' => $data, 'meta' => ['total' => count($data)]]);
    }

    /** GET /mock-api/alerts/rules/{id} */
    public function showRule(string $id): JsonResponse
    {
        $rule = collect(self::rules())->firstWhere('id', $id);
        if (!$rule) return response()->json(['message' => 'Rule not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $rule]);
    }

    /** POST /mock-api/alerts/rules */
    public function storeRule(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:200'],
            'triggerType' => ['required', 'in:zone_entry,zone_exit,colocation,face_match,photo_video,speed_alert,signal_lost,lpr_match,keyword'],
            'severity' => ['required', 'in:Critical,Warning,Informational'],
            'channels' => ['required', 'array', 'min:1'],
        ]);
        Log::info('Alerts API: rule created', ['name' => $request->input('name')]);
        usleep(400_000);
        return response()->json(['message' => 'Alert rule created.', 'data' => [
            'id' => 'ar-' . Str::random(6), 'name' => $request->input('name'),
            'triggerType' => $request->input('triggerType'), 'severity' => $request->input('severity'),
            'enabled' => true, 'channels' => $request->input('channels'),
            'cooldown' => $request->input('cooldown', 15), 'firedCount' => 0, 'lastFired' => '—',
            'createdAt' => now()->toDateString(), 'createdBy' => 'Current User',
        ]], 201);
    }

    /** PATCH /mock-api/alerts/rules/{id}/toggle */
    public function toggleRule(string $id): JsonResponse
    {
        $rule = collect(self::rules())->firstWhere('id', $id);
        if (!$rule) return response()->json(['message' => 'Rule not found.', 'code' => 'NOT_FOUND'], 404);
        $newState = !$rule['enabled'];
        return response()->json(['message' => $newState ? 'Rule enabled.' : 'Rule disabled.', 'id' => $id, 'enabled' => $newState]);
    }

    /** DELETE /mock-api/alerts/rules/{id} */
    public function destroyRule(string $id): JsonResponse
    {
        $rule = collect(self::rules())->firstWhere('id', $id);
        if (!$rule) return response()->json(['message' => 'Rule not found.', 'code' => 'NOT_FOUND'], 404);
        Log::info('Alerts API: rule deleted', ['id' => $id]);
        return response()->json(['message' => "Rule \"{$rule['name']}\" deleted.", 'id' => $id]);
    }

    /** GET /mock-api/alerts/events */
    public function events(Request $request): JsonResponse
    {
        $data = self::events();
        $severity = $request->query('severity', '');
        $unack = $request->query('unacknowledged', '');
        if ($severity) $data = array_values(array_filter($data, fn($e) => $e['severity'] === $severity));
        if ($unack === '1') $data = array_values(array_filter($data, fn($e) => !$e['acknowledged']));
        return response()->json(['data' => $data, 'meta' => ['total' => count($data)]]);
    }

    /** PATCH /mock-api/alerts/events/{id}/acknowledge */
    public function acknowledgeEvent(string $id): JsonResponse
    {
        $event = collect(self::events())->firstWhere('id', $id);
        if (!$event) return response()->json(['message' => 'Event not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['message' => 'Alert acknowledged.', 'id' => $id, 'acknowledged' => true]);
    }
}
