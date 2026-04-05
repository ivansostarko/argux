<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX Face Recognition Mock REST API.
 * InsightFace/ArcFace captures, search, match history.
 */
class FaceRecognitionApiController extends Controller
{
    private static function captures(): array
    {
        return [
            ['id'=>'fc01','captureUrl'=>'/faces/horvat_port_01.jpg','personId'=>1,'personName'=>'Marko Horvat','personAvatar'=>'','personRisk'=>'Critical','confidence'=>94,'status'=>'Confirmed Match','cameraId'=>7,'cameraName'=>'CAM-07 Port Terminal','lat'=>45.3271,'lng'=>14.4422,'location'=>'Port Terminal East, Gate 7','timestamp'=>'2026-03-27 09:15','timeAgo'=>'15m ago','operationCode'=>'HAWK','disguise'=>'None','companions'=>'1 unknown male','quality'=>92,'tags'=>['port','gate-7','high-confidence']],
            ['id'=>'fc02','captureUrl'=>'/faces/horvat_cafe_01.jpg','personId'=>1,'personName'=>'Marko Horvat','personAvatar'=>'','personRisk'=>'Critical','confidence'=>91,'status'=>'Confirmed Match','cameraId'=>14,'cameraName'=>'CAM-14 Building C','lat'=>45.8131,'lng'=>15.9772,'location'=>'Café Europa, Vukovarska','timestamp'=>'2026-03-25 16:30','timeAgo'=>'2d ago','operationCode'=>'HAWK','disguise'=>'Sunglasses','companions'=>'Babić Ivan','quality'=>88,'tags'=>['cafe','babic','sunglasses']],
            ['id'=>'fc03','captureUrl'=>'/faces/mendoza_port_01.jpg','personId'=>9,'personName'=>'Carlos Mendoza','personAvatar'=>'','personRisk'=>'Critical','confidence'=>87,'status'=>'Confirmed Match','cameraId'=>7,'cameraName'=>'CAM-07 Port Terminal','lat'=>45.3271,'lng'=>14.4422,'location'=>'Port Terminal East','timestamp'=>'2026-03-26 22:15','timeAgo'=>'11h ago','operationCode'=>'HAWK','disguise'=>'Baseball cap','companions'=>'None','quality'=>79,'tags'=>['port','night','cap']],
            ['id'=>'fc04','captureUrl'=>'/faces/babic_warehouse_01.jpg','personId'=>12,'personName'=>'Ivan Babić','personAvatar'=>'','personRisk'=>'High','confidence'=>82,'status'=>'Confirmed Match','cameraId'=>12,'cameraName'=>'CAM-12 Warehouse','lat'=>45.8090,'lng'=>15.9920,'location'=>'Warehouse District','timestamp'=>'2026-03-27 03:15','timeAgo'=>'6h ago','operationCode'=>'HAWK','disguise'=>'Hood','companions'=>'None','quality'=>71,'tags'=>['night-vision','warehouse','hood']],
            ['id'=>'fc05','captureUrl'=>'/faces/unknown_port_01.jpg','personId'=>null,'personName'=>'Unknown','personAvatar'=>'','personRisk'=>'No Risk','confidence'=>0,'status'=>'No Match','cameraId'=>7,'cameraName'=>'CAM-07 Port Terminal','lat'=>45.3271,'lng'=>14.4422,'location'=>'Port Terminal East','timestamp'=>'2026-03-27 08:50','timeAgo'=>'40m ago','operationCode'=>'','disguise'=>'None','companions'=>'None','quality'=>94,'tags'=>['unmatched','port']],
            ['id'=>'fc06','captureUrl'=>'/faces/hassan_street_01.jpg','personId'=>7,'personName'=>'Youssef Hassan','personAvatar'=>'','personRisk'=>'High','confidence'=>76,'status'=>'Possible Match','cameraId'=>3,'cameraName'=>'CAM-03 Street','lat'=>45.8090,'lng'=>15.9800,'location'=>'Near Warehouse District','timestamp'=>'2026-03-26 19:30','timeAgo'=>'14h ago','operationCode'=>'GLACIER','disguise'=>'None','companions'=>'2 unknown males','quality'=>65,'tags'=>['low-quality','companions']],
            ['id'=>'fc07','captureUrl'=>'/faces/alrashid_hotel_01.jpg','personId'=>3,'personName'=>'Ahmed Al-Rashid','personAvatar'=>'','personRisk'=>'Critical','confidence'=>89,'status'=>'Confirmed Match','cameraId'=>22,'cameraName'=>'CAM-22 Hotel Lobby','lat'=>45.8070,'lng'=>15.9740,'location'=>'Hotel Esplanade Lobby','timestamp'=>'2026-03-25 12:00','timeAgo'=>'2d ago','operationCode'=>'GLACIER','disguise'=>'None','companions'=>'Hassan Y.','quality'=>95,'tags'=>['hotel','esplanade','companion-hassan']],
            ['id'=>'fc08','captureUrl'=>'/faces/unknown_warehouse_01.jpg','personId'=>null,'personName'=>'Unknown','personAvatar'=>'','personRisk'=>'No Risk','confidence'=>0,'status'=>'Pending Review','cameraId'=>12,'cameraName'=>'CAM-12 Warehouse','lat'=>45.8090,'lng'=>15.9920,'location'=>'Warehouse District','timestamp'=>'2026-03-27 03:18','timeAgo'=>'6h ago','operationCode'=>'','disguise'=>'Full face mask','companions'=>'None','quality'=>42,'tags'=>['masked','night','pending']],
            ['id'=>'fc09','captureUrl'=>'/faces/rossi_border_01.jpg','personId'=>6,'personName'=>'Marco Rossi','personAvatar'=>'','personRisk'=>'Medium','confidence'=>73,'status'=>'Possible Match','cameraId'=>null,'cameraName'=>'Border Camera','lat'=>45.4800,'lng'=>15.5200,'location'=>'Croatia-Bosnia Border','timestamp'=>'2026-03-24 08:15','timeAgo'=>'3d ago','operationCode'=>'CERBERUS','disguise'=>'None','companions'=>'Driver','quality'=>68,'tags'=>['border','crossing']],
            ['id'=>'fc10','captureUrl'=>'/faces/horvat_vukovarska_01.jpg','personId'=>1,'personName'=>'Marko Horvat','personAvatar'=>'','personRisk'=>'Critical','confidence'=>96,'status'=>'Confirmed Match','cameraId'=>14,'cameraName'=>'CAM-14 Building C','lat'=>45.8055,'lng'=>15.9852,'location'=>'Vukovarska cesta','timestamp'=>'2026-03-27 07:45','timeAgo'=>'2h ago','operationCode'=>'HAWK','disguise'=>'None','companions'=>'None','quality'=>97,'tags'=>['high-confidence','vukovarska']],
            ['id'=>'fc11','captureUrl'=>'/faces/petrova_street_01.jpg','personId'=>2,'personName'=>'Elena Petrova','personAvatar'=>'','personRisk'=>'Medium','confidence'=>84,'status'=>'Confirmed Match','cameraId'=>3,'cameraName'=>'CAM-03 Street','lat'=>45.8100,'lng'=>15.9750,'location'=>'Ilica Street','timestamp'=>'2026-03-26 14:20','timeAgo'=>'19h ago','operationCode'=>'','disguise'=>'None','companions'=>'None','quality'=>86,'tags'=>['street','ilica']],
            ['id'=>'fc12','captureUrl'=>'/faces/unknown_port_02.jpg','personId'=>null,'personName'=>'Unknown','personAvatar'=>'','personRisk'=>'No Risk','confidence'=>0,'status'=>'Pending Review','cameraId'=>7,'cameraName'=>'CAM-07 Port Terminal','lat'=>45.3271,'lng'=>14.4422,'location'=>'Port Terminal East','timestamp'=>'2026-03-27 09:10','timeAgo'=>'20m ago','operationCode'=>'','disguise'=>'None','companions'=>'With fc01 subject','quality'=>88,'tags'=>['unmatched','port','companion']],
            ['id'=>'fc13','captureUrl'=>'/faces/fatima_rijeka_01.jpg','personId'=>11,'personName'=>'Fatima Al-Zahra','personAvatar'=>'','personRisk'=>'High','confidence'=>78,'status'=>'Possible Match','cameraId'=>null,'cameraName'=>'Rijeka Port Camera','lat'=>45.3271,'lng'=>14.4422,'location'=>'Rijeka Port Terminal','timestamp'=>'2026-03-22 14:30','timeAgo'=>'5d ago','operationCode'=>'HAWK','disguise'=>'Headscarf','companions'=>'None','quality'=>72,'tags'=>['rijeka','headscarf']],
            ['id'=>'fc14','captureUrl'=>'/faces/horvat_highway_01.jpg','personId'=>1,'personName'=>'Marko Horvat','personAvatar'=>'','personRisk'=>'Critical','confidence'=>68,'status'=>'Possible Match','cameraId'=>null,'cameraName'=>'Highway Cam A3-km247','lat'=>45.7842,'lng'=>15.9501,'location'=>'A3 Motorway km 247','timestamp'=>'2026-03-27 08:10','timeAgo'=>'1h ago','operationCode'=>'HAWK','disguise'=>'None','companions'=>'Driver','quality'=>54,'tags'=>['highway','low-quality','vehicle']],
            ['id'=>'fc15','captureUrl'=>'/faces/unknown_diplomatic_01.jpg','personId'=>null,'personName'=>'Unknown','personAvatar'=>'','personRisk'=>'No Risk','confidence'=>0,'status'=>'No Match','cameraId'=>null,'cameraName'=>'Diplomatic Quarter','lat'=>45.8120,'lng'=>15.9680,'location'=>'Near Embassy Row','timestamp'=>'2026-03-23 15:20','timeAgo'=>'4d ago','operationCode'=>'','disguise'=>'None','companions'=>'Babić nearby','quality'=>90,'tags'=>['diplomatic','unmatched']],
        ];
    }

    /** GET /mock-api/face-recognition */
    public function index(Request $request): JsonResponse
    {
        $data = self::captures();
        $status = $request->query('status', '');
        $camera = $request->query('camera', '');
        $personId = $request->query('person_id', '');
        $op = $request->query('operation', '');
        $minConf = (int) $request->query('min_confidence', 0);
        $search = strtolower($request->query('search', ''));

        if ($status && $status !== 'all') $data = array_values(array_filter($data, fn($c) => $c['status'] === $status));
        if ($camera && $camera !== 'all') $data = array_values(array_filter($data, fn($c) => $c['cameraName'] === $camera));
        if ($personId) $data = array_values(array_filter($data, fn($c) => $c['personId'] == $personId));
        if ($op && $op !== 'all') $data = array_values(array_filter($data, fn($c) => $c['operationCode'] === $op));
        if ($minConf > 0) $data = array_values(array_filter($data, fn($c) => $c['confidence'] >= $minConf));
        if ($search) $data = array_values(array_filter($data, fn($c) => str_contains(strtolower($c['personName'].' '.$c['location'].' '.$c['cameraName'].' '.implode(' ',$c['tags'])), $search)));

        return response()->json(['data' => $data, 'meta' => ['total' => count($data)]]);
    }

    /** GET /mock-api/face-recognition/{id} */
    public function show(string $id): JsonResponse
    {
        $capture = collect(self::captures())->firstWhere('id', $id);
        if (!$capture) return response()->json(['message' => 'Capture not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $capture]);
    }

    /** POST /mock-api/face-recognition/search */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'person_id' => ['required_without:image', 'nullable', 'integer'],
            'image' => ['required_without:person_id', 'nullable', 'string'],
        ]);
        Log::info('FaceRecognition API: search', ['person_id' => $request->input('person_id')]);
        usleep(800_000); // Simulate ArcFace inference
        $pid = $request->input('person_id');
        $matches = collect(self::captures())->filter(fn($c) => $c['personId'] == $pid && $c['confidence'] >= 50)->values()->toArray();
        if (empty($matches) && $pid) {
            $matches = [['id' => 'fc-sim-'.Str::random(4), 'personId' => $pid, 'personName' => 'Search result', 'confidence' => rand(65, 95), 'status' => 'Possible Match', 'cameraName' => 'CAM-07 Port Terminal', 'location' => 'Port Terminal East', 'timestamp' => now()->subHours(rand(1, 48))->toDateTimeString(), 'timeAgo' => rand(1, 48) . 'h ago', 'quality' => rand(60, 95), 'tags' => ['search-result']]];
        }
        return response()->json(['data' => $matches, 'meta' => ['total' => count($matches), 'model' => 'ArcFace R100', 'inference_ms' => rand(120, 450)]]);
    }

    /** PATCH /mock-api/face-recognition/{id}/status */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $capture = collect(self::captures())->firstWhere('id', $id);
        if (!$capture) return response()->json(['message' => 'Capture not found.', 'code' => 'NOT_FOUND'], 404);
        $request->validate(['status' => ['required', 'in:Confirmed Match,Possible Match,No Match,Pending Review']]);
        return response()->json(['message' => 'Status updated.', 'id' => $id, 'status' => $request->input('status')]);
    }

    /** GET /mock-api/face-recognition/cameras */
    public function cameras(): JsonResponse
    {
        return response()->json(['data' => [
            ['id'=>1,'name'=>'CAM-01 Main Gate','location'=>'Port Terminal Main Gate','status'=>'online','type'=>'Fixed','resolution'=>'4K'],
            ['id'=>3,'name'=>'CAM-03 Street','location'=>'Vukovarska Street','status'=>'online','type'=>'PTZ','resolution'=>'1080p'],
            ['id'=>7,'name'=>'CAM-07 Port Terminal','location'=>'Port Terminal East Gate 7','status'=>'online','type'=>'Fixed','resolution'=>'4K'],
            ['id'=>12,'name'=>'CAM-12 Warehouse','location'=>'Warehouse District','status'=>'online','type'=>'Night Vision','resolution'=>'1080p'],
            ['id'=>14,'name'=>'CAM-14 Building C','location'=>'Building C Entrance','status'=>'degraded','type'=>'Fixed','resolution'=>'480p'],
            ['id'=>22,'name'=>'CAM-22 Hotel Lobby','location'=>'Hotel Esplanade','status'=>'online','type'=>'Fixed','resolution'=>'4K'],
        ]]);
    }

    /** GET /mock-api/face-recognition/stats */
    public function stats(): JsonResponse
    {
        $all = self::captures();
        return response()->json([
            'total' => count($all),
            'confirmed' => count(array_filter($all, fn($c) => $c['status'] === 'Confirmed Match')),
            'possible' => count(array_filter($all, fn($c) => $c['status'] === 'Possible Match')),
            'noMatch' => count(array_filter($all, fn($c) => $c['status'] === 'No Match')),
            'pending' => count(array_filter($all, fn($c) => $c['status'] === 'Pending Review')),
            'avgConfidence' => round(collect($all)->where('confidence', '>', 0)->avg('confidence')),
            'model' => 'InsightFace ArcFace R100',
            'gpuUtilization' => 34,
        ]);
    }
}
