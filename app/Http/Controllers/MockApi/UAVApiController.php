<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX UAV / Drone Fleet Mock REST API.
 * Fleet management, missions, telemetry, AI detections.
 */
class UAVApiController extends Controller
{
    private static function uavs(): array
    {
        return [
            ['id'=>1,'callsign'=>'HAWK-1','model'=>'Bayraktar Mini','manufacturer'=>'Baykar','type'=>'fixed-wing','uavClass'=>'tactical','serialNumber'=>'BK-2024-001','status'=>'deployed','firmware'=>'v4.2.1','weight'=>6.5,'maxPayload'=>1.5,'wingspan'=>200,'maxSpeed'=>120,'cruiseSpeed'=>70,'maxAltitude'=>5000,'maxRange'=>150,'endurance'=>180,'batteryType'=>'Li-Po 6S','batteryCapacity'=>22000,'batteryLevel'=>78,'batteryVoltage'=>22.4,'chargeCycles'=>142,'sensors'=>['EO/IR Camera','Thermal Imaging','SIGINT Payload'],'hasGPS'=>true,'hasRTK'=>true,'hasThermal'=>true,'hasLiDAR'=>false,'hasNightVision'=>true,'hasEW'=>true,'cameraResolution'=>'4K 30fps','gimbalType'=>'3-axis stabilized','dataLink'=>'C-Band BLOS','frequency'=>'4.4-4.9 GHz','encryptedLink'=>true,'videoFeed'=>true,'maxDataRate'=>'10 Mbps','assignedOperator'=>'Cpt. Matić','assignedOperation'=>'HAWK','assignedTeam'=>'Alpha','homeBase'=>'Zagreb FOB','lat'=>45.8195,'lng'=>15.9815,'lastFlightDate'=>'2026-03-29','totalFlightHours'=>487,'totalFlights'=>234,'lastMaintenance'=>'2026-03-15','nextMaintenance'=>'2026-04-15','notes'=>'Primary tactical UAV for Operation HAWK.','createdAt'=>'2024-06-01'],
            ['id'=>2,'callsign'=>'SHADOW-3','model'=>'DJI Matrice 350 RTK','manufacturer'=>'DJI','type'=>'quadcopter','uavClass'=>'surveillance','serialNumber'=>'DJI-M350-003','status'=>'deployed','firmware'=>'v09.01.01','weight'=>6.3,'maxPayload'=>2.7,'wingspan'=>77,'maxSpeed'=>82,'cruiseSpeed'=>50,'maxAltitude'=>7000,'maxRange'=>20,'endurance'=>55,'batteryType'=>'TB65 Dual','batteryCapacity'=>5880,'batteryLevel'=>62,'batteryVoltage'=>44.8,'chargeCycles'=>89,'sensors'=>['Zenmuse H30T','RTK Module','Thermal+Zoom'],'hasGPS'=>true,'hasRTK'=>true,'hasThermal'=>true,'hasLiDAR'=>false,'hasNightVision'=>true,'hasEW'=>false,'cameraResolution'=>'48MP / 4K Video','gimbalType'=>'3-axis','dataLink'=>'OcuSync 3 Enterprise','frequency'=>'2.4/5.8 GHz','encryptedLink'=>true,'videoFeed'=>true,'maxDataRate'=>'15 Mbps','assignedOperator'=>'Sgt. Kovač','assignedOperation'=>'HAWK','assignedTeam'=>'Bravo','homeBase'=>'Zagreb FOB','lat'=>45.7945,'lng'=>15.9490,'lastFlightDate'=>'2026-03-29','totalFlightHours'=>312,'totalFlights'=>567,'lastMaintenance'=>'2026-03-20','nextMaintenance'=>'2026-04-20','notes'=>'Surveillance workhorse with dual thermal/zoom.','createdAt'=>'2024-09-01'],
            ['id'=>3,'callsign'=>'EAGLE-7','model'=>'WingtraOne GEN II','manufacturer'=>'Wingtra','type'=>'vtol','uavClass'=>'reconnaissance','serialNumber'=>'WG-GII-007','status'=>'operational','firmware'=>'v2.8.0','weight'=>4.3,'maxPayload'=>0.8,'wingspan'=>125,'maxSpeed'=>57,'cruiseSpeed'=>42,'maxAltitude'=>5500,'maxRange'=>50,'endurance'=>59,'batteryType'=>'Li-Po 4S','batteryCapacity'=>16000,'batteryLevel'=>100,'batteryVoltage'=>16.8,'chargeCycles'=>67,'sensors'=>['Sony RX1R II 42MP','PPK GNSS'],'hasGPS'=>true,'hasRTK'=>true,'hasThermal'=>false,'hasLiDAR'=>false,'hasNightVision'=>false,'hasEW'=>false,'cameraResolution'=>'42MP','gimbalType'=>'Fixed nadir','dataLink'=>'900 MHz','frequency'=>'900 MHz','encryptedLink'=>true,'videoFeed'=>false,'maxDataRate'=>'1 Mbps','assignedOperator'=>null,'assignedOperation'=>null,'assignedTeam'=>null,'homeBase'=>'Zagreb FOB','lat'=>null,'lng'=>null,'lastFlightDate'=>'2026-03-25','totalFlightHours'=>189,'totalFlights'=>123,'lastMaintenance'=>'2026-03-10','nextMaintenance'=>'2026-04-10','notes'=>'High-res mapping platform.','createdAt'=>'2024-11-01'],
            ['id'=>4,'callsign'=>'REAPER-2','model'=>'Alta X','manufacturer'=>'Freefly Systems','type'=>'octocopter','uavClass'=>'cargo','serialNumber'=>'FF-AX-002','status'=>'maintenance','firmware'=>'v1.5.3','weight'=>6.9,'maxPayload'=>15.9,'wingspan'=>118,'maxSpeed'=>65,'cruiseSpeed'=>40,'maxAltitude'=>3700,'maxRange'=>5,'endurance'=>20,'batteryType'=>'Li-Po 12S','batteryCapacity'=>44000,'batteryLevel'=>0,'batteryVoltage'=>0,'chargeCycles'=>34,'sensors'=>['Delivery Bay Cam'],'hasGPS'=>true,'hasRTK'=>false,'hasThermal'=>false,'hasLiDAR'=>false,'hasNightVision'=>false,'hasEW'=>false,'dataLink'=>'2.4 GHz','frequency'=>'2.4 GHz','encryptedLink'=>false,'videoFeed'=>true,'maxDataRate'=>'5 Mbps','assignedOperator'=>null,'assignedOperation'=>null,'assignedTeam'=>null,'homeBase'=>'Zagreb FOB','lat'=>null,'lng'=>null,'lastFlightDate'=>'2026-03-18','totalFlightHours'=>45,'totalFlights'=>28,'lastMaintenance'=>'2026-03-28','nextMaintenance'=>'2026-04-28','notes'=>'Motor 4 replaced. Awaiting test flight.','createdAt'=>'2025-01-15'],
            ['id'=>5,'callsign'=>'GHOST-1','model'=>'Black Hornet 4','manufacturer'=>'Teledyne FLIR','type'=>'micro','uavClass'=>'reconnaissance','serialNumber'=>'BH4-001','status'=>'operational','firmware'=>'v3.1.0','weight'=>0.033,'maxPayload'=>0,'wingspan'=>12,'maxSpeed'=>21,'cruiseSpeed'=>10,'maxAltitude'=>100,'maxRange'=>2,'endurance'=>25,'batteryType'=>'Custom Li-Po','batteryCapacity'=>350,'batteryLevel'=>95,'batteryVoltage'=>3.7,'chargeCycles'=>210,'sensors'=>['EO 720p','Thermal 160x120'],'hasGPS'=>true,'hasRTK'=>false,'hasThermal'=>true,'hasLiDAR'=>false,'hasNightVision'=>true,'hasEW'=>false,'dataLink'=>'Digital COFDM','frequency'=>'Classified','encryptedLink'=>true,'videoFeed'=>true,'maxDataRate'=>'2 Mbps','assignedOperator'=>'Lt. Perić','assignedOperation'=>'HAWK','assignedTeam'=>'Delta','homeBase'=>'Field Kit','lat'=>null,'lng'=>null,'lastFlightDate'=>'2026-03-27','totalFlightHours'=>78,'totalFlights'=>312,'lastMaintenance'=>'2026-03-22','nextMaintenance'=>'2026-04-22','notes'=>'Nano drone for covert close-range recon.','createdAt'=>'2024-08-01'],
            ['id'=>6,'callsign'=>'CONDOR-4','model'=>'eBee X','manufacturer'=>'AgEagle','type'=>'fixed-wing','uavClass'=>'surveillance','serialNumber'=>'SE-EBX-004','status'=>'standby','firmware'=>'v5.0.1','weight'=>1.6,'maxPayload'=>0.5,'wingspan'=>116,'maxSpeed'=>110,'cruiseSpeed'=>65,'maxAltitude'=>5000,'maxRange'=>60,'endurance'=>90,'batteryType'=>'Li-Po 4S','batteryCapacity'=>7000,'batteryLevel'=>100,'batteryVoltage'=>16.8,'chargeCycles'=>156,'sensors'=>['S.O.D.A. 3D 20MP','senseFly Aeria X'],'hasGPS'=>true,'hasRTK'=>true,'hasThermal'=>false,'hasLiDAR'=>false,'hasNightVision'=>false,'hasEW'=>false,'dataLink'=>'Long Range Wi-Fi','frequency'=>'2.4 GHz','encryptedLink'=>false,'videoFeed'=>false,'maxDataRate'=>'8 Mbps','assignedOperator'=>null,'assignedOperation'=>'PHOENIX','assignedTeam'=>null,'homeBase'=>'Zagreb FOB','lat'=>null,'lng'=>null,'lastFlightDate'=>'2026-03-20','totalFlightHours'=>267,'totalFlights'=>189,'lastMaintenance'=>'2026-03-05','nextMaintenance'=>'2026-04-05','notes'=>'Survey/mapping. Standby for PHOENIX op.','createdAt'=>'2024-03-01'],
            ['id'=>7,'callsign'=>'PHANTOM-5','model'=>'Mavic 3 Enterprise','manufacturer'=>'DJI','type'=>'quadcopter','uavClass'=>'surveillance','serialNumber'=>'DJI-M3E-005','status'=>'operational','firmware'=>'v08.01.04','weight'=>0.92,'maxPayload'=>0,'wingspan'=>38,'maxSpeed'=>75,'cruiseSpeed'=>45,'maxAltitude'=>6000,'maxRange'=>15,'endurance'=>45,'batteryType'=>'Li-Po 4S','batteryCapacity'=>5000,'batteryLevel'=>88,'batteryVoltage'=>17.2,'chargeCycles'=>203,'sensors'=>['56MP Wide','12MP Tele 56x','Thermal 640x512'],'hasGPS'=>true,'hasRTK'=>false,'hasThermal'=>true,'hasLiDAR'=>false,'hasNightVision'=>true,'hasEW'=>false,'cameraResolution'=>'56MP / 4K','gimbalType'=>'3-axis','dataLink'=>'OcuSync 3','frequency'=>'2.4/5.8 GHz','encryptedLink'=>true,'videoFeed'=>true,'maxDataRate'=>'15 Mbps','assignedOperator'=>'Sgt. Matić','assignedOperation'=>'HAWK','assignedTeam'=>'Alpha','homeBase'=>'Zagreb FOB','lat'=>45.8162,'lng'=>15.9825,'lastFlightDate'=>'2026-03-29','totalFlightHours'=>423,'totalFlights'=>890,'lastMaintenance'=>'2026-03-18','nextMaintenance'=>'2026-04-18','notes'=>'Versatile surveillance drone.','createdAt'=>'2024-04-01'],
            ['id'=>8,'callsign'=>'VIPER-2','model'=>'Skydio X10','manufacturer'=>'Skydio','type'=>'quadcopter','uavClass'=>'tactical','serialNumber'=>'SK-X10-002','status'=>'operational','firmware'=>'v2.3.0','weight'=>2.6,'maxPayload'=>0.5,'wingspan'=>45,'maxSpeed'=>58,'cruiseSpeed'=>38,'maxAltitude'=>4500,'maxRange'=>12,'endurance'=>35,'batteryType'=>'Li-Po 6S','batteryCapacity'=>5500,'batteryLevel'=>72,'batteryVoltage'=>22.1,'chargeCycles'=>98,'sensors'=>['64MP 4K','NightSense IR','FLIR Lepton'],'hasGPS'=>true,'hasRTK'=>true,'hasThermal'=>true,'hasLiDAR'=>true,'hasNightVision'=>true,'hasEW'=>false,'cameraResolution'=>'64MP / 4K 60fps','gimbalType'=>'6-DOF visual','dataLink'=>'Skydio Link','frequency'=>'2.4/5.8 GHz','encryptedLink'=>true,'videoFeed'=>true,'maxDataRate'=>'12 Mbps','assignedOperator'=>'Cpt. Matić','assignedOperation'=>'HAWK','assignedTeam'=>'Alpha','homeBase'=>'Zagreb FOB','lat'=>null,'lng'=>null,'lastFlightDate'=>'2026-03-28','totalFlightHours'=>156,'totalFlights'=>342,'lastMaintenance'=>'2026-03-22','nextMaintenance'=>'2026-04-22','notes'=>'AI autonomous flight with obstacle avoidance.','createdAt'=>'2025-02-01'],
            ['id'=>9,'callsign'=>'RELAY-1','model'=>'IF1200A','manufacturer'=>'Inspired Flight','type'=>'hexacopter','uavClass'=>'communication','serialNumber'=>'IF-1200-001','status'=>'standby','firmware'=>'v1.8.2','weight'=>12.5,'maxPayload'=>4.5,'wingspan'=>120,'maxSpeed'=>72,'cruiseSpeed'=>45,'maxAltitude'=>4000,'maxRange'=>8,'endurance'=>38,'batteryType'=>'Li-Po 12S Dual','batteryCapacity'=>32000,'batteryLevel'=>100,'batteryVoltage'=>50.4,'chargeCycles'=>45,'sensors'=>['Comm Relay Payload','Mesh Node'],'hasGPS'=>true,'hasRTK'=>false,'hasThermal'=>false,'hasLiDAR'=>false,'hasNightVision'=>false,'hasEW'=>true,'dataLink'=>'Military L-Band','frequency'=>'1-2 GHz','encryptedLink'=>true,'videoFeed'=>false,'maxDataRate'=>'50 Mbps','assignedOperator'=>null,'assignedOperation'=>null,'assignedTeam'=>null,'homeBase'=>'Zagreb FOB','lat'=>null,'lng'=>null,'lastFlightDate'=>'2026-03-15','totalFlightHours'=>89,'totalFlights'=>34,'lastMaintenance'=>'2026-03-10','nextMaintenance'=>'2026-04-10','notes'=>'Airborne comms relay for extended ops.','createdAt'=>'2025-03-01'],
        ];
    }

    /** GET /mock-api/uav */
    public function index(Request $request): JsonResponse
    {
        $data = self::uavs();
        $status = $request->query('status', '');
        $type = $request->query('type', '');
        $uavClass = $request->query('class', '');
        $search = strtolower($request->query('search', ''));

        if ($status) $data = array_values(array_filter($data, fn($u) => $u['status'] === $status));
        if ($type) $data = array_values(array_filter($data, fn($u) => $u['type'] === $type));
        if ($uavClass) $data = array_values(array_filter($data, fn($u) => $u['uavClass'] === $uavClass));
        if ($search) $data = array_values(array_filter($data, fn($u) => str_contains(strtolower($u['callsign'].' '.$u['model'].' '.$u['manufacturer'].' '.($u['assignedOperation'] ?? '')), $search)));

        return response()->json(['data' => $data, 'meta' => ['total' => count($data)]]);
    }

    /** GET /mock-api/uav/{id} */
    public function show(int $id): JsonResponse
    {
        $uav = collect(self::uavs())->firstWhere('id', $id);
        if (!$uav) return response()->json(['message' => 'UAV not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $uav]);
    }

    /** POST /mock-api/uav */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'callsign' => ['required', 'string', 'min:2', 'max:20'],
            'model' => ['required', 'string'],
            'type' => ['required', 'in:fixed-wing,quadcopter,hexacopter,octocopter,vtol,micro'],
            'uavClass' => ['required', 'in:tactical,reconnaissance,surveillance,cargo,communication'],
        ]);
        Log::info('UAV API: created', ['callsign' => $request->input('callsign')]);
        usleep(400_000);
        return response()->json(['message' => 'UAV added to fleet.', 'data' => [
            'id' => rand(100, 999), 'callsign' => $request->input('callsign'),
            'model' => $request->input('model'), 'type' => $request->input('type'),
            'uavClass' => $request->input('uavClass'), 'status' => 'standby',
            'batteryLevel' => 100, 'totalFlightHours' => 0,
        ]], 201);
    }

    /** PUT /mock-api/uav/{id} */
    public function update(Request $request, int $id): JsonResponse
    {
        $uav = collect(self::uavs())->firstWhere('id', $id);
        if (!$uav) return response()->json(['message' => 'UAV not found.', 'code' => 'NOT_FOUND'], 404);
        Log::info('UAV API: updated', ['id' => $id]);
        return response()->json(['message' => "UAV {$uav['callsign']} updated.", 'data' => array_merge($uav, $request->all())]);
    }

    /** DELETE /mock-api/uav/{id} */
    public function destroy(int $id): JsonResponse
    {
        $uav = collect(self::uavs())->firstWhere('id', $id);
        if (!$uav) return response()->json(['message' => 'UAV not found.', 'code' => 'NOT_FOUND'], 404);
        if ($uav['status'] === 'deployed') return response()->json(['message' => 'Cannot remove deployed UAV. Recall first.', 'code' => 'UAV_DEPLOYED'], 409);
        Log::info('UAV API: deleted', ['id' => $id, 'callsign' => $uav['callsign']]);
        return response()->json(['message' => "UAV {$uav['callsign']} removed from fleet.", 'id' => $id]);
    }

    /** PATCH /mock-api/uav/{id}/status */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $uav = collect(self::uavs())->firstWhere('id', $id);
        if (!$uav) return response()->json(['message' => 'UAV not found.', 'code' => 'NOT_FOUND'], 404);
        $request->validate(['status' => ['required', 'in:operational,standby,maintenance,deployed,retired']]);
        $new = $request->input('status');
        if ($uav['status'] === 'lost') return response()->json(['message' => 'Lost UAV status cannot be changed remotely.', 'code' => 'UAV_LOST'], 409);
        if ($new === 'deployed' && $uav['batteryLevel'] < 20) return response()->json(['message' => 'Battery too low for deployment (< 20%).', 'code' => 'LOW_BATTERY'], 409);
        return response()->json(['message' => "Status changed to {$new}.", 'id' => $id, 'status' => $new]);
    }

    /** GET /mock-api/uav/stats */
    public function stats(): JsonResponse
    {
        $uavs = self::uavs();
        $statusCounts = [];
        foreach ($uavs as $u) $statusCounts[$u['status']] = ($statusCounts[$u['status']] ?? 0) + 1;
        return response()->json([
            'total' => count($uavs),
            'byStatus' => $statusCounts,
            'deployed' => count(array_filter($uavs, fn($u) => $u['status'] === 'deployed')),
            'operational' => count(array_filter($uavs, fn($u) => $u['status'] === 'operational')),
            'totalFlightHours' => array_sum(array_column($uavs, 'totalFlightHours')),
            'totalFlights' => array_sum(array_column($uavs, 'totalFlights')),
            'avgBattery' => round(collect($uavs)->where('batteryLevel', '>', 0)->avg('batteryLevel')),
        ]);
    }
}
