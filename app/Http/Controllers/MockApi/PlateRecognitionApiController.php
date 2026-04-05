<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * ARGUX Plate Recognition / LPR Mock REST API.
 * YOLOv8 + PaddleOCR scans, readers, watchlist.
 */
class PlateRecognitionApiController extends Controller
{
    private static function readers(): array
    {
        return [
            ['id'=>'lpr-01','name'=>'Vukovarska East','location'=>'Vukovarska cesta, Zagreb','lat'=>45.802,'lng'=>15.995,'cameraId'=>8,'status'=>'Online','captureCount'=>12840],
            ['id'=>'lpr-02','name'=>'Airport Cargo Gate','location'=>'Zagreb Airport','lat'=>45.743,'lng'=>16.069,'cameraId'=>14,'status'=>'Online','captureCount'=>8920],
            ['id'=>'lpr-03','name'=>'A1 Highway Km 78','location'=>'A1 Highway South','lat'=>45.327,'lng'=>16.334,'cameraId'=>null,'status'=>'Online','captureCount'=>34560],
            ['id'=>'lpr-04','name'=>'Savska Safe House','location'=>'Savska cesta 41, Zagreb','lat'=>45.807,'lng'=>15.985,'cameraId'=>null,'status'=>'Online','captureCount'=>6780],
            ['id'=>'lpr-05','name'=>'Port Terminal Entry','location'=>'Port Terminal, Zagreb','lat'=>45.818,'lng'=>15.992,'cameraId'=>null,'status'=>'Online','captureCount'=>9450],
            ['id'=>'lpr-06','name'=>'Ilica / Frankopanska','location'=>'Ilica, Zagreb','lat'=>45.813,'lng'=>15.978,'cameraId'=>8,'status'=>'Online','captureCount'=>18920],
            ['id'=>'lpr-07','name'=>'Rashid Tower Parking','location'=>'Dubai, UAE','lat'=>25.205,'lng'=>55.271,'cameraId'=>11,'status'=>'Online','captureCount'=>4230],
            ['id'=>'lpr-08','name'=>'Split Coastal Road','location'=>'Split, Croatia','lat'=>43.508,'lng'=>16.440,'cameraId'=>3,'status'=>'Maintenance','captureCount'=>7120],
            ['id'=>'lpr-09','name'=>'Mobile Unit Alpha','location'=>'Variable — Zagreb','lat'=>45.815,'lng'=>15.982,'cameraId'=>null,'status'=>'Online','captureCount'=>2340],
        ];
    }

    private static function scans(): array
    {
        return [
            ['id'=>'ls01','plate'=>'ZG-1847-AB','plateConfidence'=>97,'readerId'=>'lpr-01','readerName'=>'Vukovarska East','readerLocation'=>'Vukovarska cesta','cameraId'=>8,'cameraName'=>'CAM-08','vehicleId'=>1,'vehicleMake'=>'BMW','vehicleModel'=>'5 Series','vehicleColor'=>'Dark Blue','personId'=>1,'personName'=>'Marko Horvat','orgId'=>null,'orgName'=>'','status'=>'Watchlist Hit','direction'=>'East','speed'=>48,'lane'=>'Lane 2','timestamp'=>'2026-03-27 07:45','timeAgo'=>'2h ago','lat'=>45.802,'lng'=>15.995,'operationCode'=>'HAWK','watchlistMatch'=>true,'tags'=>['watchlist','HAWK','morning']],
            ['id'=>'ls02','plate'=>'ZG-1847-AB','plateConfidence'=>94,'readerId'=>'lpr-04','readerName'=>'Savska Safe House','readerLocation'=>'Savska 41','cameraId'=>null,'cameraName'=>'—','vehicleId'=>1,'vehicleMake'=>'BMW','vehicleModel'=>'5 Series','vehicleColor'=>'Dark Blue','personId'=>1,'personName'=>'Marko Horvat','orgId'=>null,'orgName'=>'','status'=>'Watchlist Hit','direction'=>'Entering','speed'=>12,'lane'=>'Entry','timestamp'=>'2026-03-27 09:20','timeAgo'=>'10m ago','lat'=>45.807,'lng'=>15.985,'operationCode'=>'HAWK','watchlistMatch'=>true,'tags'=>['watchlist','HAWK','savska']],
            ['id'=>'ls03','plate'=>'ZG-4421-MN','plateConfidence'=>96,'readerId'=>'lpr-03','readerName'=>'A1 Highway Km 78','readerLocation'=>'A1 Highway','cameraId'=>null,'cameraName'=>'—','vehicleId'=>4,'vehicleMake'=>'Toyota','vehicleModel'=>'Land Cruiser','vehicleColor'=>'White','personId'=>9,'personName'=>'Carlos Mendoza','orgId'=>null,'orgName'=>'','status'=>'Watchlist Hit','direction'=>'South','speed'=>112,'lane'=>'Fast Lane','timestamp'=>'2026-03-27 08:10','timeAgo'=>'1h ago','lat'=>45.327,'lng'=>16.334,'operationCode'=>'HAWK','watchlistMatch'=>true,'tags'=>['watchlist','HAWK','highway','speed']],
            ['id'=>'ls04','plate'=>'ZG-9912-KP','plateConfidence'=>91,'readerId'=>'lpr-06','readerName'=>'Ilica / Frankopanska','readerLocation'=>'Ilica, Zagreb','cameraId'=>8,'cameraName'=>'CAM-08','vehicleId'=>null,'vehicleMake'=>'Audi','vehicleModel'=>'A6','vehicleColor'=>'Black','personId'=>12,'personName'=>'Ivan Babić','orgId'=>null,'orgName'=>'','status'=>'Matched','direction'=>'West','speed'=>35,'lane'=>'Lane 1','timestamp'=>'2026-03-26 22:05','timeAgo'=>'11h ago','lat'=>45.813,'lng'=>15.978,'operationCode'=>'HAWK','watchlistMatch'=>false,'tags'=>['matched','night']],
            ['id'=>'ls05','plate'=>'DU-3391-AA','plateConfidence'=>88,'readerId'=>'lpr-07','readerName'=>'Rashid Tower Parking','readerLocation'=>'Dubai','cameraId'=>11,'cameraName'=>'CAM-11','vehicleId'=>null,'vehicleMake'=>'Mercedes','vehicleModel'=>'S-Class','vehicleColor'=>'Silver','personId'=>3,'personName'=>'Ahmed Al-Rashid','orgId'=>2,'orgName'=>'Rashid Holdings','status'=>'Matched','direction'=>'Entering','speed'=>8,'lane'=>'Parking Entry','timestamp'=>'2026-03-25 14:00','timeAgo'=>'2d ago','lat'=>25.205,'lng'=>55.271,'operationCode'=>'GLACIER','watchlistMatch'=>false,'tags'=>['matched','dubai','GLACIER']],
            ['id'=>'ls06','plate'=>'ZG-????-??','plateConfidence'=>34,'readerId'=>'lpr-08','readerName'=>'Split Coastal Road','readerLocation'=>'Split','cameraId'=>3,'cameraName'=>'CAM-03','vehicleId'=>null,'vehicleMake'=>'Unknown','vehicleModel'=>'Unknown','vehicleColor'=>'Dark','personId'=>null,'personName'=>'','orgId'=>null,'orgName'=>'','status'=>'Partial Read','direction'=>'North','speed'=>78,'lane'=>'Lane 1','timestamp'=>'2026-03-24 08:15','timeAgo'=>'3d ago','lat'=>43.508,'lng'=>16.440,'operationCode'=>'','watchlistMatch'=>false,'tags'=>['partial','low-confidence','night']],
            ['id'=>'ls07','plate'=>'ST-2288-HK','plateConfidence'=>92,'readerId'=>'lpr-08','readerName'=>'Split Coastal Road','readerLocation'=>'Split','cameraId'=>3,'cameraName'=>'CAM-03','vehicleId'=>null,'vehicleMake'=>'VW','vehicleModel'=>'Transporter','vehicleColor'=>'White','personId'=>null,'personName'=>'','orgId'=>null,'orgName'=>'','status'=>'Unknown','direction'=>'South','speed'=>62,'lane'=>'Lane 2','timestamp'=>'2026-03-26 11:30','timeAgo'=>'22h ago','lat'=>43.508,'lng'=>16.440,'operationCode'=>'','watchlistMatch'=>false,'tags'=>['unknown','transporter']],
            ['id'=>'ls08','plate'=>'ZG-1847-AB','plateConfidence'=>95,'readerId'=>'lpr-05','readerName'=>'Port Terminal Entry','readerLocation'=>'Port Terminal','cameraId'=>null,'cameraName'=>'—','vehicleId'=>1,'vehicleMake'=>'BMW','vehicleModel'=>'5 Series','vehicleColor'=>'Dark Blue','personId'=>1,'personName'=>'Marko Horvat','orgId'=>null,'orgName'=>'','status'=>'Watchlist Hit','direction'=>'Entering','speed'=>15,'lane'=>'Gate 7','timestamp'=>'2026-03-27 08:45','timeAgo'=>'45m ago','lat'=>45.818,'lng'=>15.992,'operationCode'=>'HAWK','watchlistMatch'=>true,'tags'=>['watchlist','HAWK','port','gate-7']],
            ['id'=>'ls09','plate'=>'RI-7834-CC','plateConfidence'=>89,'readerId'=>'lpr-09','readerName'=>'Mobile Unit Alpha','readerLocation'=>'Zagreb variable','cameraId'=>null,'cameraName'=>'Mobile','vehicleId'=>null,'vehicleMake'=>'Fiat','vehicleModel'=>'Ducato','vehicleColor'=>'White','personId'=>null,'personName'=>'','orgId'=>5,'orgName'=>'Balkan Transit','status'=>'Matched','direction'=>'—','speed'=>null,'lane'=>'Parked','timestamp'=>'2026-03-26 16:40','timeAgo'=>'17h ago','lat'=>45.815,'lng'=>15.982,'operationCode'=>'HAWK','watchlistMatch'=>false,'tags'=>['matched','balkan-transit','parked']],
            ['id'=>'ls10','plate'=>'ZG-4421-MN','plateConfidence'=>93,'readerId'=>'lpr-01','readerName'=>'Vukovarska East','readerLocation'=>'Vukovarska cesta','cameraId'=>8,'cameraName'=>'CAM-08','vehicleId'=>4,'vehicleMake'=>'Toyota','vehicleModel'=>'Land Cruiser','vehicleColor'=>'White','personId'=>9,'personName'=>'Carlos Mendoza','orgId'=>null,'orgName'=>'','status'=>'Watchlist Hit','direction'=>'West','speed'=>42,'lane'=>'Lane 1','timestamp'=>'2026-03-26 22:10','timeAgo'=>'11h ago','lat'=>45.802,'lng'=>15.995,'operationCode'=>'HAWK','watchlistMatch'=>true,'tags'=>['watchlist','HAWK','night','mendoza']],
        ];
    }

    /** GET /mock-api/plate-recognition/scans */
    public function scans(Request $request): JsonResponse
    {
        $data = self::scans();
        $status = $request->query('status', '');
        $reader = $request->query('reader', '');
        $personId = $request->query('person_id', '');
        $plate = $request->query('plate', '');
        $watchlist = $request->query('watchlist', '');
        $search = strtolower($request->query('search', ''));

        if ($status && $status !== 'all') $data = array_values(array_filter($data, fn($s) => $s['status'] === $status));
        if ($reader && $reader !== 'all') $data = array_values(array_filter($data, fn($s) => $s['readerName'] === $reader));
        if ($personId) $data = array_values(array_filter($data, fn($s) => $s['personId'] == $personId));
        if ($plate && $plate !== 'all') $data = array_values(array_filter($data, fn($s) => $s['plate'] === $plate));
        if ($watchlist === '1') $data = array_values(array_filter($data, fn($s) => $s['watchlistMatch']));
        if ($search) $data = array_values(array_filter($data, fn($s) => str_contains(strtolower($s['plate'].' '.$s['personName'].' '.$s['readerName'].' '.$s['vehicleMake'].' '.$s['vehicleModel'].' '.implode(' ',$s['tags'])), $search)));

        return response()->json(['data' => $data, 'meta' => ['total' => count($data)]]);
    }

    /** GET /mock-api/plate-recognition/scans/{id} */
    public function showScan(string $id): JsonResponse
    {
        $scan = collect(self::scans())->firstWhere('id', $id);
        if (!$scan) return response()->json(['message' => 'Scan not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $scan]);
    }

    /** GET /mock-api/plate-recognition/readers */
    public function readers(): JsonResponse
    {
        return response()->json(['data' => self::readers(), 'meta' => ['total' => count(self::readers())]]);
    }

    /** GET /mock-api/plate-recognition/watchlist */
    public function watchlist(): JsonResponse
    {
        $watchlistScans = array_filter(self::scans(), fn($s) => $s['watchlistMatch']);
        $plates = [];
        foreach ($watchlistScans as $s) {
            if (!isset($plates[$s['plate']])) {
                $plates[$s['plate']] = ['plate' => $s['plate'], 'personName' => $s['personName'], 'vehicleDesc' => "{$s['vehicleMake']} {$s['vehicleModel']} · {$s['vehicleColor']}", 'scans' => 0, 'lastSeen' => $s['timestamp'], 'operationCode' => $s['operationCode']];
            }
            $plates[$s['plate']]['scans']++;
            if ($s['timestamp'] > $plates[$s['plate']]['lastSeen']) $plates[$s['plate']]['lastSeen'] = $s['timestamp'];
        }
        return response()->json(['data' => array_values($plates), 'meta' => ['total' => count($plates)]]);
    }

    /** GET /mock-api/plate-recognition/stats */
    public function stats(): JsonResponse
    {
        $scans = self::scans();
        $readers = self::readers();
        return response()->json([
            'totalScans' => count($scans),
            'watchlistHits' => count(array_filter($scans, fn($s) => $s['watchlistMatch'])),
            'matched' => count(array_filter($scans, fn($s) => $s['status'] === 'Matched')),
            'unknown' => count(array_filter($scans, fn($s) => $s['status'] === 'Unknown')),
            'partialReads' => count(array_filter($scans, fn($s) => $s['status'] === 'Partial Read')),
            'readersOnline' => count(array_filter($readers, fn($r) => $r['status'] === 'Online')),
            'readersTotal' => count($readers),
            'avgConfidence' => round(collect($scans)->avg('plateConfidence')),
            'uniquePlates' => count(array_unique(array_column($scans, 'plate'))),
            'model' => 'YOLOv8 + PaddleOCR v3',
        ]);
    }

    /** POST /mock-api/plate-recognition/search */
    public function search(Request $request): JsonResponse
    {
        $request->validate(['plate' => ['required', 'string', 'min:2']]);
        $plate = strtoupper($request->input('plate'));
        $matches = array_values(array_filter(self::scans(), fn($s) => str_contains(strtoupper($s['plate']), $plate)));
        Log::info('PlateRecognition API: search', ['plate' => $plate, 'matches' => count($matches)]);
        return response()->json(['data' => $matches, 'meta' => ['total' => count($matches), 'query' => $plate]]);
    }
}
