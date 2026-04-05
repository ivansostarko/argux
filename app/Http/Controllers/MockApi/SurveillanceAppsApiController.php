<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * ARGUX Surveillance Apps Mock REST API.
 * Deployed surveillance agents with SMS, calls, contacts, screenshots, remote commands.
 */
class SurveillanceAppsApiController extends Controller
{
    private static function apps(): array
    {
        return [
            ['id'=>'app01','personId'=>1,'personName'=>'Marko Horvat','type'=>'Full Monitor','status'=>'Active','platform'=>'Android','deviceModel'=>'Samsung Galaxy S24 Ultra','osVersion'=>'Android 14','appVersion'=>'4.2.1','imei'=>'354987102345671','macAddress'=>'A4:C3:F0:2B:8E:11','phoneNumber'=>'+385 91 234 5678','lastCheckIn'=>'2026-03-27 09:28','lastCheckInAgo'=>'2m ago','battery'=>78,'signal'=>92,'storage'=>34,'lat'=>45.8064,'lng'=>15.9706,'locationName'=>'Savska 41, Zagreb','operationCode'=>'HAWK','installedDate'=>'2026-01-15',
                'stats'=>['sms'=>847,'calls'=>234,'contacts'=>312,'photos'=>89,'screenshots'=>156,'totalData'=>'2.4 GB'],
                'sms'=>[['id'=>'s01','from'=>'+385 91 234 5678','to'=>'+385 98 765 4321','direction'=>'out','body'=>'Potvrđujem, četvrtak navečer, dok sedam.','timestamp'=>'2026-03-27 08:22','flagged'=>true,'flagReason'=>'Keywords: četvrtak, dok'],['id'=>'s02','from'=>'+385 98 765 4321','to'=>'+385 91 234 5678','direction'=>'in','body'=>'Razumijem. Dogovoren sam za 23h.','timestamp'=>'2026-03-27 08:24','flagged'=>true,'flagReason'=>'Keywords: dogovoren, 23h'],['id'=>'s03','from'=>'+385 91 234 5678','to'=>'+385 99 111 2222','direction'=>'out','body'=>'Babić, javi se kad stigneš na lokaciju.','timestamp'=>'2026-03-26 22:10','flagged'=>false,'flagReason'=>''],['id'=>'s04','from'=>'+385 91 234 5678','to'=>'+385 92 333 4444','direction'=>'out','body'=>'Treba mi prijevoz sutra ujutro, 06:30.','timestamp'=>'2026-03-26 18:45','flagged'=>false,'flagReason'=>'']],
                'calls'=>[['id'=>'cl01','number'=>'+385 98 765 4321','name'=>'Unknown','direction'=>'out','duration'=>'4:12','timestamp'=>'2026-03-27 08:22','recorded'=>true],['id'=>'cl02','number'=>'+385 99 111 2222','name'=>'Babić Ivan','direction'=>'out','duration'=>'1:45','timestamp'=>'2026-03-26 22:05','recorded'=>true],['id'=>'cl03','number'=>'+385 92 333 4444','name'=>'Driver','direction'=>'in','duration'=>'0:32','timestamp'=>'2026-03-26 18:40','recorded'=>false]],
                'contacts'=>[['id'=>'ct01','name'=>'Babić Ivan','phone'=>'+385 99 111 2222','email'=>'','label'=>'Business','starred'=>true],['id'=>'ct02','name'=>'Mendoza C.','phone'=>'+385 98 765 4321','email'=>'','label'=>'Other','starred'=>true],['id'=>'ct03','name'=>'Elena P.','phone'=>'+385 91 876 5432','email'=>'elena.p@mail.com','label'=>'Personal','starred'=>false],['id'=>'ct04','name'=>'Driver','phone'=>'+385 92 333 4444','email'=>'','label'=>'Work','starred'=>false]],
                'calendar'=>[['id'=>'ev01','title'=>'Port Meeting','date'=>'2026-03-27','time'=>'23:00','location'=>'Port Terminal, Gate 7','notes'=>'Bring documents'],['id'=>'ev02','title'=>'Café Europa','date'=>'2026-03-28','time'=>'10:00','location'=>'Vukovarska 58','notes'=>'']],
                'notifications'=>[['id'=>'n01','app'=>'Signal','title'=>'New message','body'=>'You have 3 new messages','timestamp'=>'2026-03-27 08:30'],['id'=>'n02','app'=>'WhatsApp','title'=>'Babić Ivan','body'=>'Na lokaciji sam.','timestamp'=>'2026-03-26 22:15']],
                'screenshots'=>[['id'=>'sc01','timestamp'=>'2026-03-27 08:22','app'=>'Signal','size'=>'1.2 MB'],['id'=>'sc02','timestamp'=>'2026-03-26 22:10','app'=>'WhatsApp','size'=>'0.8 MB']],
                'photos'=>[['id'=>'ph01','filename'=>'IMG_20260327_082200.jpg','timestamp'=>'2026-03-27 08:22','size'=>'4.2 MB','location'=>'Savska 41']],
                'networkInfo'=>['carrier'=>'A1 Hrvatska','type'=>'5G','ip'=>'10.0.2.15','wifi'=>'Alpha-Guest (connected)','vpn'=>'None','dns'=>'8.8.8.8']],
            ['id'=>'app02','personId'=>9,'personName'=>'Carlos Mendoza','type'=>'Stealth Suite','status'=>'Stealth','platform'=>'Android','deviceModel'=>'Google Pixel 8 Pro','osVersion'=>'Android 14','appVersion'=>'4.2.1','imei'=>'354987102345672','macAddress'=>'B2:D4:E1:3C:9F:22','phoneNumber'=>'+385 98 765 4321','lastCheckIn'=>'2026-03-27 09:25','lastCheckInAgo'=>'5m ago','battery'=>45,'signal'=>78,'storage'=>56,'lat'=>45.7842,'lng'=>15.9501,'locationName'=>'A3 Motorway','operationCode'=>'HAWK','installedDate'=>'2026-02-01',
                'stats'=>['sms'=>423,'calls'=>167,'contacts'=>89,'photos'=>34,'screenshots'=>78,'totalData'=>'1.1 GB'],
                'sms'=>[['id'=>'s05','from'=>'+34 612 345 678','to'=>'+385 98 765 4321','direction'=>'in','body'=>'El paquete está listo. Confirma la ubicación.','timestamp'=>'2026-03-27 07:10','flagged'=>true,'flagReason'=>'Spanish: paquete (package)'],['id'=>'s06','from'=>'+385 98 765 4321','to'=>'+385 91 234 5678','direction'=>'out','body'=>'Everything confirmed for Thursday.','timestamp'=>'2026-03-27 08:24','flagged'=>true,'flagReason'=>'Keywords: Thursday, confirmed']],
                'calls'=>[['id'=>'cl04','number'=>'+34 612 345 678','name'=>'Colombia Contact','direction'=>'in','duration'=>'8:34','timestamp'=>'2026-03-27 06:15','recorded'=>true],['id'=>'cl05','number'=>'+385 91 234 5678','name'=>'Horvat M.','direction'=>'out','duration'=>'2:10','timestamp'=>'2026-03-26 21:45','recorded'=>true]],
                'contacts'=>[['id'=>'ct05','name'=>'Horvat M.','phone'=>'+385 91 234 5678','email'=>'','label'=>'Business','starred'=>true],['id'=>'ct06','name'=>'Colombia','phone'=>'+34 612 345 678','email'=>'','label'=>'Other','starred'=>true]],
                'calendar'=>[],'notifications'=>[['id'=>'n03','app'=>'Maps','title'=>'Navigation','body'=>'Arrive at 09:45','timestamp'=>'2026-03-27 08:10']],'screenshots'=>[['id'=>'sc03','timestamp'=>'2026-03-27 07:15','app'=>'Maps','size'=>'0.9 MB']],'photos'=>[],'networkInfo'=>['carrier'=>'T-Mobile HR','type'=>'4G LTE','ip'=>'10.0.3.22','wifi'=>'Not connected','vpn'=>'ProtonVPN (active)','dns'=>'1.1.1.1']],
            ['id'=>'app03','personId'=>7,'personName'=>'Youssef Hassan','type'=>'Comms Intercept','status'=>'Active','platform'=>'Android','deviceModel'=>'OnePlus 12','osVersion'=>'Android 14','appVersion'=>'4.1.8','imei'=>'354987102345673','macAddress'=>'C3:E5:F2:4D:A0:33','phoneNumber'=>'+385 95 555 7777','lastCheckIn'=>'2026-03-27 08:10','lastCheckInAgo'=>'1h ago','battery'=>62,'signal'=>65,'storage'=>22,'lat'=>45.8090,'lng'=>15.9920,'locationName'=>'Warehouse District','operationCode'=>'GLACIER','installedDate'=>'2026-02-10',
                'stats'=>['sms'=>234,'calls'=>89,'contacts'=>45,'photos'=>12,'screenshots'=>34,'totalData'=>'640 MB'],
                'sms'=>[['id'=>'s07','from'=>'+961 3 123 456','to'=>'+385 95 555 7777','direction'=>'in','body'=>'الشحنة جاهزة ليوم الخميس. تأكيد الموقع.','timestamp'=>'2026-03-27 07:55','flagged'=>true,'flagReason'=>'Arabic: shipping, Thursday, location']],
                'calls'=>[['id'=>'cl06','number'=>'+961 3 123 456','name'=>'Lebanon','direction'=>'in','duration'=>'12:45','timestamp'=>'2026-03-26 23:30','recorded'=>true]],
                'contacts'=>[['id'=>'ct07','name'=>'Al-Rashid A.','phone'=>'+385 91 999 8888','email'=>'','label'=>'Business','starred'=>true]],
                'calendar'=>[],'notifications'=>[],'screenshots'=>[],'photos'=>[],'networkInfo'=>['carrier'=>'Telemach','type'=>'4G','ip'=>'10.0.4.8','wifi'=>'Not connected','vpn'=>'None','dns'=>'8.8.4.4']],
            ['id'=>'app04','personId'=>12,'personName'=>'Ivan Babić','type'=>'GPS Tracker','status'=>'Active','platform'=>'Android','deviceModel'=>'Xiaomi 14','osVersion'=>'Android 14','appVersion'=>'4.2.0','imei'=>'354987102345674','macAddress'=>'D4:F6:03:5E:B1:44','phoneNumber'=>'+385 99 111 2222','lastCheckIn'=>'2026-03-27 09:30','lastCheckInAgo'=>'Now','battery'=>91,'signal'=>88,'storage'=>18,'lat'=>45.8090,'lng'=>15.9920,'locationName'=>'Warehouse District','operationCode'=>'HAWK','installedDate'=>'2026-03-01',
                'stats'=>['sms'=>156,'calls'=>78,'contacts'=>67,'photos'=>23,'screenshots'=>45,'totalData'=>'380 MB'],
                'sms'=>[['id'=>'s08','from'=>'+385 91 234 5678','to'=>'+385 99 111 2222','direction'=>'in','body'=>'Babić, javi se kad stigneš na lokaciju.','timestamp'=>'2026-03-26 22:10','flagged'=>false,'flagReason'=>'']],
                'calls'=>[['id'=>'cl07','number'=>'+385 91 234 5678','name'=>'Horvat M.','direction'=>'in','duration'=>'1:45','timestamp'=>'2026-03-26 22:05','recorded'=>true]],
                'contacts'=>[['id'=>'ct08','name'=>'Horvat Marko','phone'=>'+385 91 234 5678','email'=>'','label'=>'Business','starred'=>true]],
                'calendar'=>[],'notifications'=>[],'screenshots'=>[],'photos'=>[],'networkInfo'=>['carrier'=>'A1 Hrvatska','type'=>'4G LTE','ip'=>'10.0.5.12','wifi'=>'Not connected','vpn'=>'None','dns'=>'8.8.8.8']],
            ['id'=>'app05','personId'=>3,'personName'=>'Ahmed Al-Rashid','type'=>'Full Monitor','status'=>'Paused','platform'=>'iOS','deviceModel'=>'iPhone 15 Pro Max','osVersion'=>'iOS 17.4','appVersion'=>'4.1.5','imei'=>'354987102345675','macAddress'=>'E5:07:14:6F:C2:55','phoneNumber'=>'+385 91 999 8888','lastCheckIn'=>'2026-03-25 18:00','lastCheckInAgo'=>'2d ago','battery'=>0,'signal'=>0,'storage'=>67,'lat'=>45.8131,'lng'=>15.9772,'locationName'=>'Last: Hotel Esplanade','operationCode'=>'GLACIER','installedDate'=>'2026-01-20',
                'stats'=>['sms'=>567,'calls'=>189,'contacts'=>234,'photos'=>56,'screenshots'=>89,'totalData'=>'3.8 GB'],
                'sms'=>[],'calls'=>[],'contacts'=>[['id'=>'ct09','name'=>'Hassan Y.','phone'=>'+385 95 555 7777','email'=>'','label'=>'Business','starred'=>true]],'calendar'=>[],'notifications'=>[],'screenshots'=>[],'photos'=>[],'networkInfo'=>['carrier'=>'—','type'=>'—','ip'=>'—','wifi'=>'—','vpn'=>'—','dns'=>'—']],
            ['id'=>'app06','personId'=>11,'personName'=>'Fatima Al-Zahra','type'=>'GPS Tracker','status'=>'Offline','platform'=>'Android','deviceModel'=>'Samsung Galaxy A54','osVersion'=>'Android 13','appVersion'=>'4.0.9','imei'=>'354987102345676','macAddress'=>'F6:18:25:70:D3:66','phoneNumber'=>'+385 92 888 3333','lastCheckIn'=>'2026-03-22 14:30','lastCheckInAgo'=>'5d ago','battery'=>0,'signal'=>0,'storage'=>8,'lat'=>45.3271,'lng'=>14.4422,'locationName'=>'Last: Rijeka Port','operationCode'=>'HAWK','installedDate'=>'2026-02-15',
                'stats'=>['sms'=>89,'calls'=>34,'contacts'=>28,'photos'=>7,'screenshots'=>12,'totalData'=>'180 MB'],
                'sms'=>[],'calls'=>[],'contacts'=>[],'calendar'=>[],'notifications'=>[],'screenshots'=>[],'photos'=>[],'networkInfo'=>['carrier'=>'—','type'=>'—','ip'=>'—','wifi'=>'—','vpn'=>'—','dns'=>'—']],
        ];
    }

    /** GET /mock-api/surveillance-apps */
    public function index(Request $request): JsonResponse
    {
        $data = self::apps();
        $status = $request->query('status', '');
        $platform = $request->query('platform', '');
        $search = strtolower($request->query('search', ''));

        if ($status && $status !== 'all') $data = array_values(array_filter($data, fn($a) => $a['status'] === $status));
        if ($platform && $platform !== 'all') $data = array_values(array_filter($data, fn($a) => $a['platform'] === $platform));
        if ($search) $data = array_values(array_filter($data, fn($a) => str_contains(strtolower($a['personName'].' '.$a['deviceModel'].' '.$a['phoneNumber'].' '.$a['operationCode']), $search)));

        return response()->json(['data' => $data, 'meta' => ['total' => count($data)]]);
    }

    /** GET /mock-api/surveillance-apps/{id} */
    public function show(string $id): JsonResponse
    {
        $app = collect(self::apps())->firstWhere('id', $id);
        if (!$app) return response()->json(['message' => 'App not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $app]);
    }

    /** GET /mock-api/surveillance-apps/{id}/data/{tab} */
    public function tabData(string $id, string $tab): JsonResponse
    {
        $app = collect(self::apps())->firstWhere('id', $id);
        if (!$app) return response()->json(['message' => 'App not found.', 'code' => 'NOT_FOUND'], 404);
        $validTabs = ['sms', 'calls', 'contacts', 'calendar', 'notifications', 'screenshots', 'photos', 'network', 'location', 'remote'];
        if (!in_array($tab, $validTabs)) return response()->json(['message' => 'Invalid data tab.', 'code' => 'INVALID_TAB'], 422);
        $tabData = match ($tab) {
            'sms' => $app['sms'],
            'calls' => $app['calls'],
            'contacts' => $app['contacts'],
            'calendar' => $app['calendar'],
            'notifications' => $app['notifications'],
            'screenshots' => $app['screenshots'],
            'photos' => $app['photos'],
            'network' => $app['networkInfo'],
            'location' => ['lat' => $app['lat'], 'lng' => $app['lng'], 'name' => $app['locationName'], 'lastUpdate' => $app['lastCheckIn']],
            'remote' => ['available' => $app['status'] === 'Active' || $app['status'] === 'Stealth'],
            default => [],
        };
        return response()->json(['data' => $tabData, 'tab' => $tab, 'appId' => $id]);
    }

    /** POST /mock-api/surveillance-apps/{id}/command */
    public function executeCommand(Request $request, string $id): JsonResponse
    {
        $app = collect(self::apps())->firstWhere('id', $id);
        if (!$app) return response()->json(['message' => 'App not found.', 'code' => 'NOT_FOUND'], 404);
        if (!in_array($app['status'], ['Active', 'Stealth'])) {
            return response()->json(['message' => 'Cannot execute command — agent is '.$app['status'].'.', 'code' => 'AGENT_UNAVAILABLE'], 409);
        }
        $request->validate(['command' => ['required', 'string']]);
        $cmd = $request->input('command');
        Log::info('SurveillanceApps API: command executed', ['appId' => $id, 'command' => $cmd]);
        usleep(300_000);
        return response()->json(['message' => "Command \"{$cmd}\" sent to {$app['personName']}'s device.", 'appId' => $id, 'command' => $cmd, 'status' => 'sent']);
    }

    /** PATCH /mock-api/surveillance-apps/{id}/status */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $app = collect(self::apps())->firstWhere('id', $id);
        if (!$app) return response()->json(['message' => 'App not found.', 'code' => 'NOT_FOUND'], 404);
        $request->validate(['status' => ['required', 'in:Active,Stealth,Paused']]);
        $new = $request->input('status');
        if ($app['status'] === 'Offline') return response()->json(['message' => 'Cannot change status of offline agent.', 'code' => 'AGENT_OFFLINE'], 409);
        if ($app['status'] === 'Compromised') return response()->json(['message' => 'Compromised agent requires manual intervention.', 'code' => 'AGENT_COMPROMISED'], 409);
        return response()->json(['message' => "Agent status changed to {$new}.", 'id' => $id, 'status' => $new]);
    }
}
