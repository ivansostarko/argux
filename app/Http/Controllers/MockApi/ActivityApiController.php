<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * ARGUX Activity Log Mock REST API.
 * Unified event stream matching the original ActivityEvent interface.
 */
class ActivityApiController extends Controller
{
    private static function events(): array
    {
        return [
            ['id'=>'ev01','type'=>'alert','severity'=>'critical','title'=>'Co-location Alert Triggered','description'=>'Horvat + Mendoza within 23m at Savska 41, Zagreb','personId'=>1,'personName'=>'Marko Horvat','orgId'=>null,'orgName'=>'','deviceId'=>null,'deviceName'=>'','operationCode'=>'HAWK','lat'=>45.8064,'lng'=>15.9706,'location'=>'Savska 41, Zagreb','timestamp'=>'2026-03-27 09:28','timeAgo'=>'2m ago','source'=>'Alert Engine','metadata'=>['subjects'=>'Horvat, Mendoza','distance'=>'23m']],
            ['id'=>'ev02','type'=>'camera','severity'=>'info','title'=>'Camera Capture — Port Terminal','description'=>'CAM-07 captured Horvat entering port gate 7','personId'=>1,'personName'=>'Marko Horvat','orgId'=>101,'orgName'=>'Adriatic Maritime','deviceId'=>7,'deviceName'=>'CAM-07','operationCode'=>'HAWK','lat'=>45.3271,'lng'=>14.4422,'location'=>'Port Terminal East','timestamp'=>'2026-03-27 09:15','timeAgo'=>'15m ago','source'=>'Camera Network','metadata'=>['camera'=>'CAM-07','direction'=>'Entry']],
            ['id'=>'ev03','type'=>'phone','severity'=>'high','title'=>'Phone Intercept — Outgoing Call','description'=>'Horvat outgoing call, 4:12 duration, discussing Thursday arrangements','personId'=>1,'personName'=>'Marko Horvat','orgId'=>null,'orgName'=>'','deviceId'=>291,'deviceName'=>'Phone #0291','operationCode'=>'HAWK','lat'=>45.8131,'lng'=>15.9772,'location'=>'Café Europa, Zagreb','timestamp'=>'2026-03-27 08:22','timeAgo'=>'1h ago','source'=>'Intercept System','metadata'=>['duration'=>'4:12','type'=>'Outgoing']],
            ['id'=>'ev04','type'=>'gps','severity'=>'info','title'=>'GPS Position Update','description'=>'Mendoza vehicle tracked on A3 motorway heading toward port','personId'=>9,'personName'=>'Carlos Mendoza','orgId'=>null,'orgName'=>'','deviceId'=>183,'deviceName'=>'GPS-0183','operationCode'=>'HAWK','lat'=>45.7842,'lng'=>15.9501,'location'=>'A3 Motorway, km 247','timestamp'=>'2026-03-27 08:10','timeAgo'=>'1h ago','source'=>'GPS Fleet','metadata'=>['speed'=>'112 km/h','heading'=>'SW']],
            ['id'=>'ev05','type'=>'lpr','severity'=>'medium','title'=>'LPR Capture — ZG-1847-AB','description'=>'Horvat vehicle captured at Vukovarska checkpoint','personId'=>1,'personName'=>'Marko Horvat','orgId'=>null,'orgName'=>'','deviceId'=>12,'deviceName'=>'LPR-VUKO-01','operationCode'=>'HAWK','lat'=>45.8055,'lng'=>15.9852,'location'=>'Vukovarska cesta','timestamp'=>'2026-03-27 07:45','timeAgo'=>'2h ago','source'=>'LPR Network','metadata'=>['plate'=>'ZG-1847-AB','confidence'=>'97%']],
            ['id'=>'ev06','type'=>'face','severity'=>'high','title'=>'Face Recognition Match','description'=>'Horvat face matched at port camera with 94% confidence','personId'=>1,'personName'=>'Marko Horvat','orgId'=>null,'orgName'=>'','deviceId'=>7,'deviceName'=>'CAM-07','operationCode'=>'HAWK','lat'=>45.3271,'lng'=>14.4422,'location'=>'Port Terminal East','timestamp'=>'2026-03-27 07:30','timeAgo'=>'2h ago','source'=>'ArcFace','metadata'=>['confidence'=>'94%','model'=>'R100']],
            ['id'=>'ev07','type'=>'zone','severity'=>'critical','title'=>'Zone Entry — Restricted Area','description'=>'Babić entered restricted warehouse zone outside operating hours','personId'=>12,'personName'=>'Ivan Babić','orgId'=>null,'orgName'=>'','deviceId'=>null,'deviceName'=>'','operationCode'=>'HAWK','lat'=>45.8090,'lng'=>15.9920,'location'=>'Warehouse District','timestamp'=>'2026-03-27 03:15','timeAgo'=>'6h ago','source'=>'Geofence Monitor','metadata'=>['zone'=>'Warehouse-Restricted','type'=>'Entry']],
            ['id'=>'ev08','type'=>'system','severity'=>'info','title'=>'AI Model Deployed','description'=>'Faster-Whisper Large-v3 deployed to GPU cluster. Queue priority: high.','personId'=>null,'personName'=>'','orgId'=>null,'orgName'=>'','deviceId'=>null,'deviceName'=>'','operationCode'=>'','lat'=>0,'lng'=>0,'location'=>'GPU Cluster','timestamp'=>'2026-03-27 08:15','timeAgo'=>'1h ago','source'=>'Deploy Agent','metadata'=>['model'=>'large-v3','gpu'=>'2x A100']],
            ['id'=>'ev09','type'=>'audio','severity'=>'medium','title'=>'Audio Recording Started','description'=>'Ambient microphone activated at warehouse facility','personId'=>7,'personName'=>'Youssef Hassan','orgId'=>null,'orgName'=>'','deviceId'=>44,'deviceName'=>'MIC-044','operationCode'=>'GLACIER','lat'=>45.8090,'lng'=>15.9920,'location'=>'Warehouse District','timestamp'=>'2026-03-27 02:00','timeAgo'=>'7h ago','source'=>'Audio System','metadata'=>['duration'=>'ongoing','snr'=>'12 dB']],
            ['id'=>'ev10','type'=>'video','severity'=>'info','title'=>'Video Transcription Completed','description'=>'CAM-07 footage transcribed: 3,847 words, 12 keyword matches','personId'=>1,'personName'=>'Marko Horvat','orgId'=>null,'orgName'=>'','deviceId'=>7,'deviceName'=>'CAM-07','operationCode'=>'HAWK','lat'=>45.3271,'lng'=>14.4422,'location'=>'Port Terminal','timestamp'=>'2026-03-27 10:12','timeAgo'=>'Now','source'=>'Faster-Whisper','metadata'=>['words'=>'3,847','keywords'=>'12']],
            ['id'=>'ev11','type'=>'workflow','severity'=>'info','title'=>'Workflow Triggered — Evidence Package','description'=>'Auto-workflow created evidence package for Horvat co-location series','personId'=>1,'personName'=>'Marko Horvat','orgId'=>null,'orgName'=>'','deviceId'=>null,'deviceName'=>'','operationCode'=>'HAWK','lat'=>0,'lng'=>0,'location'=>'System','timestamp'=>'2026-03-27 09:15','timeAgo'=>'15m ago','source'=>'Workflow Engine','metadata'=>['workflow'=>'Evidence Package','trigger'=>'co-location']],
            ['id'=>'ev12','type'=>'record','severity'=>'info','title'=>'Record Created — Passport Scan','description'=>'Mendoza passport CC-87234591 scanned and filed','personId'=>9,'personName'=>'Carlos Mendoza','orgId'=>null,'orgName'=>'','deviceId'=>null,'deviceName'=>'','operationCode'=>'','lat'=>0,'lng'=>0,'location'=>'HQ','timestamp'=>'2026-03-20 09:30','timeAgo'=>'7d ago','source'=>'Lt. Perić','metadata'=>['type'=>'Document','pages'=>'2']],
            ['id'=>'ev13','type'=>'alert','severity'=>'warning','title'=>'Device Offline Alert','description'=>'Camera CAM-03 at Port Terminal East lost connection','personId'=>null,'personName'=>'','orgId'=>null,'orgName'=>'','deviceId'=>3,'deviceName'=>'CAM-03','operationCode'=>'','lat'=>45.3271,'lng'=>14.4422,'location'=>'Port Terminal East','timestamp'=>'2026-03-27 08:55','timeAgo'=>'35m ago','source'=>'Device Monitor','metadata'=>['lastSignal'=>'08:54:45']],
            ['id'=>'ev14','type'=>'gps','severity'=>'info','title'=>'GPS Tracker Battery Low','description'=>'GPS-0183 (Mendoza) battery at 11%, 4h remaining','personId'=>9,'personName'=>'Carlos Mendoza','orgId'=>null,'orgName'=>'','deviceId'=>183,'deviceName'=>'GPS-0183','operationCode'=>'HAWK','lat'=>45.7842,'lng'=>15.9501,'location'=>'Zagreb','timestamp'=>'2026-03-27 08:15','timeAgo'=>'1h ago','source'=>'Device Manager','metadata'=>['battery'=>'11%','estimated'=>'4h']],
            ['id'=>'ev15','type'=>'lpr','severity'=>'info','title'=>'LPR Batch Complete','description'=>'142 plates processed from Zagreb highway cameras, 8 matches, 2 flagged','personId'=>null,'personName'=>'','orgId'=>null,'orgName'=>'','deviceId'=>null,'deviceName'=>'','operationCode'=>'','lat'=>0,'lng'=>0,'location'=>'Highway Network','timestamp'=>'2026-03-27 07:32','timeAgo'=>'2h ago','source'=>'LPR Batch','metadata'=>['plates'=>'142','matches'=>'8','flagged'=>'2']],
            ['id'=>'ev16','type'=>'camera','severity'=>'info','title'=>'Night Vision Recording','description'=>'CAM-12 loitering detection triggered for Babić at warehouse','personId'=>12,'personName'=>'Ivan Babić','orgId'=>null,'orgName'=>'','deviceId'=>12,'deviceName'=>'CAM-12','operationCode'=>'HAWK','lat'=>45.8090,'lng'=>15.9920,'location'=>'Warehouse District','timestamp'=>'2026-03-26 03:30','timeAgo'=>'1d ago','source'=>'AI Detection','metadata'=>['alert'=>'Loitering','duration'=>'18:45']],
            ['id'=>'ev17','type'=>'phone','severity'=>'info','title'=>'SMS Intercepted','description'=>'Hassan incoming SMS from unknown number — Arabic text flagged','personId'=>7,'personName'=>'Youssef Hassan','orgId'=>null,'orgName'=>'','deviceId'=>null,'deviceName'=>'','operationCode'=>'GLACIER','lat'=>0,'lng'=>0,'location'=>'Unknown','timestamp'=>'2026-03-27 08:10','timeAgo'=>'1h ago','source'=>'Intercept System','metadata'=>['language'=>'Arabic','flagged'=>'Yes']],
            ['id'=>'ev18','type'=>'face','severity'=>'medium','title'=>'Face Search Initiated','description'=>'Lt. Perić initiated face search for Mendoza — 24 images submitted','personId'=>9,'personName'=>'Carlos Mendoza','orgId'=>null,'orgName'=>'','deviceId'=>null,'deviceName'=>'','operationCode'=>'HAWK','lat'=>0,'lng'=>0,'location'=>'HQ','timestamp'=>'2026-03-27 09:20','timeAgo'=>'10m ago','source'=>'Lt. Perić','metadata'=>['images'=>'24','model'=>'ArcFace R100']],
            ['id'=>'ev19','type'=>'system','severity'=>'info','title'=>'Data Source Sync Complete','description'=>'EU Sanctions CFSP: 12 new entries, 3 removed, 0 errors','personId'=>null,'personName'=>'','orgId'=>null,'orgName'=>'','deviceId'=>null,'deviceName'=>'','operationCode'=>'','lat'=>0,'lng'=>0,'location'=>'System','timestamp'=>'2026-03-27 08:02','timeAgo'=>'1h ago','source'=>'Sync Worker','metadata'=>['source'=>'EU Sanctions CFSP','new'=>'12','removed'=>'3']],
            ['id'=>'ev20','type'=>'zone','severity'=>'medium','title'=>'Zone Exit — Monitored Area','description'=>'Horvat exited monitored café zone after 45-minute stay','personId'=>1,'personName'=>'Marko Horvat','orgId'=>null,'orgName'=>'','deviceId'=>null,'deviceName'=>'','operationCode'=>'HAWK','lat'=>45.8131,'lng'=>15.9772,'location'=>'Café Europa zone','timestamp'=>'2026-03-25 17:15','timeAgo'=>'2d ago','source'=>'Geofence Monitor','metadata'=>['zone'=>'Café-Europa','type'=>'Exit','duration'=>'45m']],
        ];
    }

    /** GET /mock-api/activity */
    public function index(Request $request): JsonResponse
    {
        $data = self::events();
        $type = $request->query('type', '');
        $severity = $request->query('severity', '');
        $search = strtolower($request->query('search', ''));
        $personId = $request->query('person_id', '');

        if ($type) $data = array_values(array_filter($data, fn($e) => $e['type'] === $type));
        if ($severity && $severity !== 'all') $data = array_values(array_filter($data, fn($e) => $e['severity'] === $severity));
        if ($personId) $data = array_values(array_filter($data, fn($e) => $e['personId'] == $personId));
        if ($search) $data = array_values(array_filter($data, fn($e) => str_contains(strtolower($e['title'].' '.$e['description'].' '.$e['personName'].' '.$e['location'].' '.$e['source']), $search)));

        return response()->json(['data' => $data, 'meta' => ['total' => count($data)]]);
    }

    /** GET /mock-api/activity/{id} */
    public function show(string $id): JsonResponse
    {
        $event = collect(self::events())->firstWhere('id', $id);
        if (!$event) return response()->json(['message' => 'Event not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $event]);
    }
}
