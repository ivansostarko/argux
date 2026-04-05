<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX Data Sources Mock REST API.
 * 22 external integrations across 6 categories.
 */
class DataSourcesApiController extends Controller
{
    private static function sources(): array
    {
        $sync = fn($s,$d,$r,$st,$dt) => ['id'=>'sl-'.Str::random(4),'ts'=>$s,'duration'=>$d,'records'=>$r,'status'=>$st,'detail'=>$dt];
        return [
            ['id'=>'ds01','name'=>'National Business Registry','provider'=>'Ministry of Justice','category'=>'Government','country'=>'Croatia','countryFlag'=>'🇭🇷','status'=>'Connected','health'=>98,'protocol'=>'SOAP','endpoint'=>'https://sudreg.pravosudje.hr/api/v2','auth'=>'Certificate','rateLimit'=>'100/min','errorRate'=>0.2,'encryptRest'=>true,'encryptTransit'=>true,'schedule'=>'Every 6h','lastSync'=>'2026-03-27 08:00','nextSync'=>'2026-03-27 14:00','recordCount'=>'2.1M','dataFields'=>['company_name','registration_number','directors','shareholders','address','status'],'linkedModules'=>['Organizations','Persons','Reports'],'tags'=>[['label'=>'Production','color'=>'#22c55e'],['label'=>'SOAP','color'=>'#3b82f6']],'syncLog'=>[$sync('08:00','12s',847,'success','Full sync'),  $sync('02:00','14s',23,'success','Delta')],'notes'=>'Primary source for Croatian company data'],
            ['id'=>'ds02','name'=>'Population Registry','provider'=>'Ministry of Interior','category'=>'Government','country'=>'Croatia','countryFlag'=>'🇭🇷','status'=>'Connected','health'=>99,'protocol'=>'REST','endpoint'=>'https://mup.gov.hr/api/persons','auth'=>'Certificate + VPN','rateLimit'=>'50/min','errorRate'=>0.1,'encryptRest'=>true,'encryptTransit'=>true,'schedule'=>'Every 12h','lastSync'=>'2026-03-27 06:00','nextSync'=>'2026-03-27 18:00','recordCount'=>'4.2M','dataFields'=>['oib','full_name','dob','address','citizenship','photo'],'linkedModules'=>['Persons','Face Recognition'],'tags'=>[['label'=>'Classified','color'=>'#ef4444'],['label'=>'REST','color'=>'#3b82f6']],'syncLog'=>[$sync('06:00','45s',12,'success','Delta sync')],'notes'=>'Requires MUP VPN tunnel'],
            ['id'=>'ds03','name'=>'Vehicle Registry','provider'=>'Ministry of Interior','category'=>'Government','country'=>'Croatia','countryFlag'=>'🇭🇷','status'=>'Connected','health'=>97,'protocol'=>'REST','endpoint'=>'https://mup.gov.hr/api/vehicles','auth'=>'Certificate','rateLimit'=>'100/min','errorRate'=>0.3,'encryptRest'=>true,'encryptTransit'=>true,'schedule'=>'Every 4h','lastSync'=>'2026-03-27 08:15','nextSync'=>'2026-03-27 12:15','recordCount'=>'1.8M','dataFields'=>['plate','make','model','year','owner_oib','color','vin'],'linkedModules'=>['Vehicles','LPR','Persons'],'tags'=>[['label'=>'Production','color'=>'#22c55e']],'syncLog'=>[$sync('08:15','8s',156,'success','Delta')],'notes'=>''],
            ['id'=>'ds04','name'=>'Court Records','provider'=>'Ministry of Justice','category'=>'Government','country'=>'Croatia','countryFlag'=>'🇭🇷','status'=>'Degraded','health'=>72,'protocol'=>'SOAP','endpoint'=>'https://sudovi.pravosudje.hr/ws','auth'=>'Certificate','rateLimit'=>'30/min','errorRate'=>4.8,'encryptRest'=>true,'encryptTransit'=>true,'schedule'=>'Every 24h','lastSync'=>'2026-03-27 02:00','nextSync'=>'2026-03-28 02:00','recordCount'=>'890K','dataFields'=>['case_number','court','parties','status','verdict','date'],'linkedModules'=>['Persons','Organizations','Reports'],'tags'=>[['label'=>'Degraded','color'=>'#f59e0b'],['label'=>'SOAP','color'=>'#3b82f6']],'syncLog'=>[$sync('02:00','2m 15s',45,'partial','3 timeout errors on batch 7')],'notes'=>'Intermittent timeout issues'],
            ['id'=>'ds05','name'=>'Land Registry','provider'=>'Ministry of Justice','category'=>'Government','country'=>'Croatia','countryFlag'=>'🇭🇷','status'=>'Connected','health'=>95,'protocol'=>'REST','endpoint'=>'https://oss.uredjenazemlja.hr/api','auth'=>'API Key','rateLimit'=>'60/min','errorRate'=>0.5,'encryptRest'=>false,'encryptTransit'=>true,'schedule'=>'Every 24h','lastSync'=>'2026-03-27 01:00','nextSync'=>'2026-03-28 01:00','recordCount'=>'3.4M','dataFields'=>['parcel_id','owner','address','size','encumbrances'],'linkedModules'=>['Persons','Organizations'],'tags'=>[['label'=>'Production','color'=>'#22c55e']],'syncLog'=>[$sync('01:00','34s',0,'success','No changes')],'notes'=>''],
            ['id'=>'ds06','name'=>'Tax Authority','provider'=>'Porezna Uprava','category'=>'Government','country'=>'Croatia','countryFlag'=>'🇭🇷','status'=>'Paused','health'=>0,'protocol'=>'SOAP','endpoint'=>'https://eporezna.gov.hr/ws/v3','auth'=>'Certificate + MFA','rateLimit'=>'20/min','errorRate'=>0,'encryptRest'=>true,'encryptTransit'=>true,'schedule'=>'Manual','lastSync'=>'2026-03-15 10:00','nextSync'=>'—','recordCount'=>'—','dataFields'=>['oib','tax_status','declarations','debt'],'linkedModules'=>['Persons','Organizations'],'tags'=>[['label'=>'Paused','color'=>'#6b7280'],['label'=>'Classified','color'=>'#ef4444']],'syncLog'=>[],'notes'=>'Paused pending new certificate'],
            ['id'=>'ds07','name'=>'INTERPOL I-24/7','provider'=>'INTERPOL','category'=>'Law Enforcement','country'=>'International','countryFlag'=>'🌍','status'=>'Connected','health'=>99,'protocol'=>'Proprietary','endpoint'=>'i247.interpol.int (classified)','auth'=>'PKI + Hardware Token','rateLimit'=>'Classified','errorRate'=>0.0,'encryptRest'=>true,'encryptTransit'=>true,'schedule'=>'Real-time','lastSync'=>'2026-03-27 09:28','nextSync'=>'Real-time','recordCount'=>'Classified','dataFields'=>['red_notices','stolen_docs','stolen_vehicles','wanted_persons'],'linkedModules'=>['Persons','Vehicles','Alerts'],'tags'=>[['label'=>'Classified','color'=>'#ef4444'],['label'=>'Real-time','color'=>'#8b5cf6']],'syncLog'=>[$sync('09:28','<1s',1,'success','Red notice update')],'notes'=>'NCB Zagreb dedicated terminal'],
            ['id'=>'ds08','name'=>'Europol SIENA','provider'=>'Europol','category'=>'Law Enforcement','country'=>'EU','countryFlag'=>'🇪🇺','status'=>'Connected','health'=>97,'protocol'=>'Proprietary','endpoint'=>'siena.europol.europa.eu','auth'=>'Certificate + SIENA Auth','rateLimit'=>'Classified','errorRate'=>0.3,'encryptRest'=>true,'encryptTransit'=>true,'schedule'=>'Every 1h','lastSync'=>'2026-03-27 09:00','nextSync'=>'2026-03-27 10:00','recordCount'=>'Classified','dataFields'=>['messages','alerts','analysis_files','cross_border'],'linkedModules'=>['Persons','Organizations','Alerts'],'tags'=>[['label'=>'Classified','color'=>'#ef4444']],'syncLog'=>[$sync('09:00','3s',4,'success','4 new messages')],'notes'=>''],
            ['id'=>'ds09','name'=>'National Police Database','provider'=>'MUP','category'=>'Law Enforcement','country'=>'Croatia','countryFlag'=>'🇭🇷','status'=>'Connected','health'=>96,'protocol'=>'ODBC','endpoint'=>'ndb.mup.internal:5432','auth'=>'Certificate + VPN','rateLimit'=>'200/min','errorRate'=>0.4,'encryptRest'=>true,'encryptTransit'=>true,'schedule'=>'Every 30min','lastSync'=>'2026-03-27 09:15','nextSync'=>'2026-03-27 09:45','recordCount'=>'12.4M','dataFields'=>['criminal_records','warrants','investigations','persons_of_interest'],'linkedModules'=>['Persons','Alerts','Reports'],'tags'=>[['label'=>'Classified','color'=>'#ef4444'],['label'=>'Production','color'=>'#22c55e']],'syncLog'=>[$sync('09:15','6s',23,'success','23 new records')],'notes'=>''],
            ['id'=>'ds10','name'=>'EU Sanctions List CFSP','provider'=>'European Council','category'=>'Financial','country'=>'EU','countryFlag'=>'🇪🇺','status'=>'Connected','health'=>100,'protocol'=>'REST','endpoint'=>'https://data.europa.eu/euodp/en/sanctions','auth'=>'Open','rateLimit'=>'Unlimited','errorRate'=>0,'encryptRest'=>false,'encryptTransit'=>true,'schedule'=>'Every 1h','lastSync'=>'2026-03-27 08:02','nextSync'=>'2026-03-27 09:02','recordCount'=>'2,847','dataFields'=>['name','dob','nationality','sanctions_type','legal_basis','listed_date'],'linkedModules'=>['Persons','Organizations','Alerts'],'tags'=>[['label'=>'Open','color'=>'#22c55e'],['label'=>'Real-time','color'=>'#8b5cf6']],'syncLog'=>[$sync('08:02','2s',12,'success','12 new, 3 removed')],'notes'=>''],
            ['id'=>'ds11','name'=>'Bank Transaction Monitor','provider'=>'FINA','category'=>'Financial','country'=>'Croatia','countryFlag'=>'🇭🇷','status'=>'Connected','health'=>94,'protocol'=>'WebSocket','endpoint'=>'wss://aml.fina.hr/stream','auth'=>'Certificate + OAuth2','rateLimit'=>'Real-time','errorRate'=>0.6,'encryptRest'=>true,'encryptTransit'=>true,'schedule'=>'Real-time','lastSync'=>'2026-03-27 09:28','nextSync'=>'Streaming','recordCount'=>'47.2M','dataFields'=>['transaction_id','sender','receiver','amount','currency','reference','risk_score'],'linkedModules'=>['Persons','Organizations','Alerts','Reports'],'tags'=>[['label'=>'Real-time','color'=>'#8b5cf6'],['label'=>'AML','color'=>'#f59e0b']],'syncLog'=>[$sync('09:28','—',1,'success','Stream active')],'notes'=>'AML threshold: €10,000'],
            ['id'=>'ds12','name'=>'Social Media Aggregator','provider'=>'Internal','category'=>'OSINT','country'=>'Global','countryFlag'=>'🌍','status'=>'Connected','health'=>88,'protocol'=>'gRPC','endpoint'=>'social.argux.internal:9090','auth'=>'mTLS','rateLimit'=>'500/min','errorRate'=>1.2,'encryptRest'=>true,'encryptTransit'=>true,'schedule'=>'Every 15min','lastSync'=>'2026-03-27 09:20','nextSync'=>'2026-03-27 09:35','recordCount'=>'1.2M','dataFields'=>['platform','username','post_content','engagement','media_urls','sentiment'],'linkedModules'=>['Persons','Scraper','Reports'],'tags'=>[['label'=>'gRPC','color'=>'#8b5cf6']],'syncLog'=>[$sync('09:20','4s',87,'success','87 new posts')],'notes'=>'Covers: FB, X, IG, TikTok, Telegram'],
            ['id'=>'ds13','name'=>'News Monitor','provider'=>'Internal','category'=>'OSINT','country'=>'Global','countryFlag'=>'🌍','status'=>'Connected','health'=>91,'protocol'=>'REST','endpoint'=>'news.argux.internal/api/v2','auth'=>'API Key','rateLimit'=>'1000/min','errorRate'=>0.9,'encryptRest'=>false,'encryptTransit'=>true,'schedule'=>'Every 10min','lastSync'=>'2026-03-27 09:25','nextSync'=>'2026-03-27 09:35','recordCount'=>'8.7M','dataFields'=>['headline','source','published','content','entities','relevance'],'linkedModules'=>['Persons','Organizations','Reports'],'tags'=>[['label'=>'Production','color'=>'#22c55e']],'syncLog'=>[$sync('09:25','2s',34,'success','34 articles')],'notes'=>'500+ news sources monitored'],
            ['id'=>'ds14','name'=>'GPS Tracker Fleet','provider'=>'Internal','category'=>'Technical','country'=>'Croatia','countryFlag'=>'🇭🇷','status'=>'Connected','health'=>92,'protocol'=>'MQTT','endpoint'=>'mqtt.argux.internal:8883','auth'=>'mTLS','rateLimit'=>'Unlimited','errorRate'=>0.8,'encryptRest'=>true,'encryptTransit'=>true,'schedule'=>'Real-time (2s)','lastSync'=>'2026-03-27 09:30','nextSync'=>'Streaming','recordCount'=>'245M','dataFields'=>['device_id','lat','lng','speed','heading','battery','signal'],'linkedModules'=>['Map','Devices','Persons','Alerts'],'tags'=>[['label'=>'Real-time','color'=>'#8b5cf6'],['label'=>'MQTT','color'=>'#06b6d4']],'syncLog'=>[$sync('09:30','—',0,'success','20 trackers streaming')],'notes'=>'2-second GPS intervals'],
            ['id'=>'ds15','name'=>'Camera Network','provider'=>'Internal','category'=>'Technical','country'=>'Croatia','countryFlag'=>'🇭🇷','status'=>'Degraded','health'=>84,'protocol'=>'RTSP','endpoint'=>'Various RTSP endpoints','auth'=>'ONVIF Digest','rateLimit'=>'Per camera','errorRate'=>3.2,'encryptRest'=>false,'encryptTransit'=>true,'schedule'=>'Real-time','lastSync'=>'2026-03-27 09:30','nextSync'=>'Streaming','recordCount'=>'—','dataFields'=>['camera_id','stream_url','resolution','fps','ptz_support','analytics'],'linkedModules'=>['Map','Vision','Face Recognition','Alerts'],'tags'=>[['label'=>'Real-time','color'=>'#8b5cf6'],['label'=>'Degraded','color'=>'#f59e0b']],'syncLog'=>[$sync('09:30','—',0,'partial','CAM-03 offline, CAM-14 degraded')],'notes'=>'147 cameras (11 fixed, 6 PTZ)'],
            ['id'=>'ds16','name'=>'IMSI Catcher Array','provider'=>'Classified','category'=>'Technical','country'=>'Croatia','countryFlag'=>'🇭🇷','status'=>'Connected','health'=>100,'protocol'=>'Proprietary','endpoint'=>'Classified','auth'=>'Hardware Token','rateLimit'=>'Classified','errorRate'=>0,'encryptRest'=>true,'encryptTransit'=>true,'schedule'=>'Real-time','lastSync'=>'2026-03-27 09:30','nextSync'=>'Streaming','recordCount'=>'Classified','dataFields'=>['imsi','imei','signal_strength','location','timestamp'],'linkedModules'=>['Map','Devices','Persons'],'tags'=>[['label'=>'Classified','color'=>'#ef4444'],['label'=>'Real-time','color'=>'#8b5cf6']],'syncLog'=>[],'notes'=>'Classified operational asset'],
            ['id'=>'ds17','name'=>'OpenCorporates','provider'=>'OpenCorporates Ltd','category'=>'Commercial','country'=>'Global','countryFlag'=>'🌍','status'=>'Connected','health'=>95,'protocol'=>'REST','endpoint'=>'https://api.opencorporates.com/v0.4','auth'=>'API Key','rateLimit'=>'500/day','errorRate'=>0.5,'encryptRest'=>false,'encryptTransit'=>true,'schedule'=>'Every 24h','lastSync'=>'2026-03-27 03:00','nextSync'=>'2026-03-28 03:00','recordCount'=>'210M','dataFields'=>['company_name','jurisdiction','registration','officers','filings'],'linkedModules'=>['Organizations','Connections'],'tags'=>[['label'=>'Commercial','color'=>'#06b6d4']],'syncLog'=>[$sync('03:00','1m 45s',342,'success','342 updates')],'notes'=>'210M+ company records worldwide'],
            ['id'=>'ds18','name'=>'Dark Web Monitor','provider'=>'Internal','category'=>'OSINT','country'=>'Global','countryFlag'=>'🌍','status'=>'Error','health'=>0,'protocol'=>'REST','endpoint'=>'darkweb.argux.internal/api','auth'=>'mTLS + API Key','rateLimit'=>'10/min','errorRate'=>100,'encryptRest'=>true,'encryptTransit'=>true,'schedule'=>'Every 1h','lastSync'=>'2026-03-26 18:00','nextSync'=>'Retrying...','recordCount'=>'124K','dataFields'=>['source','content','threat_level','entities','urls'],'linkedModules'=>['Persons','Organizations','Alerts'],'tags'=>[['label'=>'Error','color'=>'#ef4444']],'syncLog'=>[$sync('18:00','—',0,'error','Tor proxy timeout after 30s')],'notes'=>'Tor proxy requires restart'],
            ['id'=>'ds19','name'=>'Maritime AIS','provider'=>'MarineTraffic','category'=>'Commercial','country'=>'Global','countryFlag'=>'🌍','status'=>'Connected','health'=>93,'protocol'=>'WebSocket','endpoint'=>'wss://stream.marinetraffic.com/v2','auth'=>'API Key + OAuth2','rateLimit'=>'Real-time','errorRate'=>0.7,'encryptRest'=>false,'encryptTransit'=>true,'schedule'=>'Real-time','lastSync'=>'2026-03-27 09:30','nextSync'=>'Streaming','recordCount'=>'89M','dataFields'=>['mmsi','imo','vessel_name','lat','lng','speed','heading','destination','eta'],'linkedModules'=>['Map','Organizations','Alerts'],'tags'=>[['label'=>'Real-time','color'=>'#8b5cf6'],['label'=>'Commercial','color'=>'#06b6d4']],'syncLog'=>[$sync('09:30','—',0,'success','Stream active')],'notes'=>'Tracks Adriatic Maritime vessels'],
        ];
    }

    /** GET /mock-api/data-sources */
    public function index(Request $request): JsonResponse
    {
        $data = self::sources();
        $cat = $request->query('category', '');
        $status = $request->query('status', '');
        $country = $request->query('country', '');
        $search = strtolower($request->query('search', ''));

        if ($cat && $cat !== 'all') $data = array_values(array_filter($data, fn($d) => $d['category'] === $cat));
        if ($status && $status !== 'all') $data = array_values(array_filter($data, fn($d) => $d['status'] === $status));
        if ($country && $country !== 'all') $data = array_values(array_filter($data, fn($d) => $d['country'] === $country));
        if ($search) $data = array_values(array_filter($data, fn($d) => str_contains(strtolower($d['name'].' '.$d['provider'].' '.$d['protocol'].' '.implode(' ',$d['dataFields'])), $search)));

        return response()->json(['data' => $data, 'meta' => ['total' => count($data)]]);
    }

    /** GET /mock-api/data-sources/{id} */
    public function show(string $id): JsonResponse
    {
        $ds = collect(self::sources())->firstWhere('id', $id);
        if (!$ds) return response()->json(['message' => 'Data source not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $ds]);
    }

    /** POST /mock-api/data-sources */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:200'],
            'provider' => ['required', 'string'],
            'category' => ['required', 'in:Government,Law Enforcement,Financial,OSINT,Technical,Commercial'],
            'protocol' => ['required', 'in:REST,SOAP,gRPC,MQTT,ODBC,RTSP,ONVIF,Proprietary,WebSocket'],
            'endpoint' => ['required', 'string'],
        ]);
        Log::info('DataSources API: created', ['name' => $request->input('name')]);
        usleep(400_000);
        return response()->json(['message' => 'Data source created.', 'data' => [
            'id' => 'ds-' . Str::random(6), 'name' => $request->input('name'),
            'provider' => $request->input('provider'), 'category' => $request->input('category'),
            'status' => 'Paused', 'health' => 0, 'protocol' => $request->input('protocol'),
        ]], 201);
    }

    /** POST /mock-api/data-sources/{id}/sync */
    public function sync(string $id): JsonResponse
    {
        $ds = collect(self::sources())->firstWhere('id', $id);
        if (!$ds) return response()->json(['message' => 'Data source not found.', 'code' => 'NOT_FOUND'], 404);
        if ($ds['status'] === 'Paused') return response()->json(['message' => 'Cannot sync paused source.', 'code' => 'SOURCE_PAUSED'], 409);
        if ($ds['status'] === 'Error') return response()->json(['message' => 'Cannot sync — source in error state. Fix connection first.', 'code' => 'SOURCE_ERROR'], 409);
        return response()->json(['message' => "Sync triggered for {$ds['name']}.", 'id' => $id, 'status' => 'syncing']);
    }

    /** PATCH /mock-api/data-sources/{id}/pause */
    public function togglePause(string $id): JsonResponse
    {
        $ds = collect(self::sources())->firstWhere('id', $id);
        if (!$ds) return response()->json(['message' => 'Data source not found.', 'code' => 'NOT_FOUND'], 404);
        $newStatus = $ds['status'] === 'Paused' ? 'Connected' : 'Paused';
        return response()->json(['message' => $newStatus === 'Paused' ? 'Source paused.' : 'Source resumed.', 'id' => $id, 'status' => $newStatus]);
    }

    /** DELETE /mock-api/data-sources/{id} */
    public function destroy(string $id): JsonResponse
    {
        $ds = collect(self::sources())->firstWhere('id', $id);
        if (!$ds) return response()->json(['message' => 'Data source not found.', 'code' => 'NOT_FOUND'], 404);
        if (in_array('Classified', array_column($ds['tags'], 'label'))) {
            return response()->json(['message' => 'Cannot delete classified data source.', 'code' => 'CLASSIFIED'], 403);
        }
        Log::info('DataSources API: deleted', ['id' => $id]);
        return response()->json(['message' => "Source \"{$ds['name']}\" deleted.", 'id' => $id]);
    }

    /** POST /mock-api/data-sources/sync-all */
    public function syncAll(): JsonResponse
    {
        $healthy = count(array_filter(self::sources(), fn($d) => in_array($d['status'], ['Connected', 'Degraded'])));
        return response()->json(['message' => "Sync triggered for {$healthy} healthy sources.", 'count' => $healthy]);
    }
}
