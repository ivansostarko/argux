<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * ARGUX Risks Dashboard Mock REST API.
 * Serves data matching the original Risks page structure (capitalized risk levels).
 */
class RisksApiController extends Controller
{
    /** GET /mock-api/risks/summary — KPI counts per entity type */
    public function summary(): JsonResponse
    {
        // Returns person/org/vehicle risk counts used by KPI cards
        return response()->json([
            'persons' => ['Critical'=>3,'High'=>5,'Medium'=>8,'Low'=>5,'No Risk'=>2,'total'=>23],
            'organizations' => ['Critical'=>2,'High'=>3,'Medium'=>4,'Low'=>3,'No Risk'=>1,'total'=>13],
            'vehicles' => ['Critical'=>1,'High'=>4,'Medium'=>6,'Low'=>7,'No Risk'=>2,'total'=>20],
        ]);
    }

    /** GET /mock-api/risks/persons — Filtered person list */
    public function persons(Request $request): JsonResponse
    {
        // This returns the same shape as mockPersons but the page already has the full list
        // The API handles search/risk filter server-side
        return response()->json(['status' => 'ok']);
    }

    /** GET /mock-api/risks/persons/{id}/factors — Factor breakdown */
    public function personFactors(int $id): JsonResponse
    {
        $factors = self::getPersonFactors();
        if (!isset($factors[$id])) {
            return response()->json(['message'=>'Person not found.','code'=>'NOT_FOUND'], 404);
        }
        return response()->json(['data' => $factors[$id]]);
    }

    /** GET /mock-api/risks/organizations/{id}/factors — Org factor breakdown */
    public function orgFactors(int $id): JsonResponse
    {
        $map = [
            101 => [['id'=>'orf1','category'=>'financial','icon'=>'💰','label'=>'Shell company structure','severity'=>'critical','score'=>94,'detail'=>'€2.1M in flagged transactions; 3 shell companies in ownership chain'],['id'=>'orf2','category'=>'connections','icon'=>'🔗','label'=>'High-risk persons linked','severity'=>'critical','score'=>91,'detail'=>'Horvat (director), Mendoza (contractor), Al-Rashid (investor)'],['id'=>'orf3','category'=>'zone','icon'=>'🛡️','label'=>'Port zone violations','severity'=>'high','score'=>78,'detail'=>'3 unauthorized vessel movements in restricted port zones']],
            102 => [['id'=>'orf4','category'=>'connections','icon'=>'🔗','label'=>'Cross-border logistics','severity'=>'high','score'=>82,'detail'=>'Linked to Mendoza, Babić; fleet used in cross-border operations'],['id'=>'orf5','category'=>'lpr','icon'=>'🚗','label'=>'Fleet LPR flags','severity'=>'high','score'=>76,'detail'=>'4 fleet vehicles flagged at border checkpoints']],
            103 => [['id'=>'orf6','category'=>'financial','icon'=>'💰','label'=>'AML flagged transactions','severity'=>'critical','score'=>96,'detail'=>'23 flagged transactions totaling €847K in 90 days'],['id'=>'orf7','category'=>'connections','icon'=>'🔗','label'=>'Beneficial ownership risk','severity'=>'high','score'=>80,'detail'=>'Al-Rashid (beneficial owner), Petrenko (director)']],
        ];
        if (!isset($map[$id])) {
            return response()->json(['message'=>'Organization not found or no factors.','code'=>'NOT_FOUND'], 404);
        }
        return response()->json(['data' => $map[$id]]);
    }

    /** GET /mock-api/risks/factor-categories — All factor category definitions */
    public function factorCategories(): JsonResponse
    {
        return response()->json(['data' => [
            ['id'=>'connections','label'=>'High-risk connections','icon'=>'🔗','color'=>'#ef4444'],
            ['id'=>'zone','label'=>'Zone violations','icon'=>'🛡️','color'=>'#f59e0b'],
            ['id'=>'behavior','label'=>'Behavioral anomalies','icon'=>'🧠','color'=>'#8b5cf6'],
            ['id'=>'lpr','label'=>'LPR activity','icon'=>'🚗','color'=>'#3b82f6'],
            ['id'=>'colocation','label'=>'Co-location patterns','icon'=>'📍','color'=>'#ec4899'],
            ['id'=>'anomaly','label'=>'AI-detected anomalies','icon'=>'⚠️','color'=>'#f97316'],
            ['id'=>'financial','label'=>'Financial flags','icon'=>'💰','color'=>'#10b981'],
            ['id'=>'surveillance','label'=>'Surveillance gaps','icon'=>'👁️','color'=>'#6b7280'],
        ]]);
    }

    private static function getPersonFactors(): array
    {
        return [
            1 => [
                ['id'=>'rf1','category'=>'connections','icon'=>'🔗','label'=>'High-risk connections','severity'=>'critical','score'=>95,'detail'=>'5 connections to Critical/High entities (Mendoza, Babić, Al-Rashid, Hassan, Alpha Security)'],
                ['id'=>'rf2','category'=>'zone','icon'=>'🛡️','label'=>'Zone violations','severity'=>'critical','score'=>92,'detail'=>'3 restricted zone breaches in 7 days. Port Terminal entry 11 times in 14 days.'],
                ['id'=>'rf3','category'=>'behavior','icon'=>'🧠','label'=>'Counter-surveillance','severity'=>'high','score'=>87,'detail'=>'Evasive driving (120km/h urban), weekend activity surge, route changes.'],
                ['id'=>'rf4','category'=>'lpr','icon'=>'🚗','label'=>'LPR activity','severity'=>'high','score'=>82,'detail'=>'31 LPR captures in 30 days. Vehicle ZG-1847-AB at 8 monitored locations.'],
                ['id'=>'rf5','category'=>'colocation','icon'=>'📍','label'=>'Co-location pattern','severity'=>'critical','score'=>96,'detail'=>'8 co-location events with Mendoza. 6 weekly meetings with Babić at Vukovarska.'],
                ['id'=>'rf6','category'=>'anomaly','icon'=>'⚠️','label'=>'AI anomalies','severity'=>'high','score'=>85,'detail'=>'3 route deviations, 1 temporal anomaly (weekend surge), 1 speed anomaly detected.'],
            ],
            9 => [
                ['id'=>'rf7','category'=>'connections','icon'=>'🔗','label'=>'International network','severity'=>'critical','score'=>93,'detail'=>'Direct links to Horvat + Balkan Transit Group. Cross-border connections in 3 countries.'],
                ['id'=>'rf8','category'=>'lpr','icon'=>'🚗','label'=>'Vehicle tracking','severity'=>'critical','score'=>90,'detail'=>'Vehicle tracked across 3 countries in 48h; 8 LPR hits near port facilities.'],
                ['id'=>'rf9','category'=>'behavior','icon'=>'🧠','label'=>'Communication security','severity'=>'high','score'=>84,'detail'=>'SIM card changes every 72h; encrypted comms detected; counter-surveillance awareness.'],
            ],
            3 => [
                ['id'=>'rf10','category'=>'financial','icon'=>'💰','label'=>'Suspicious transactions','severity'=>'critical','score'=>94,'detail'=>'€847K in suspicious transactions via Meridian Finance. Multiple shell companies.'],
                ['id'=>'rf11','category'=>'connections','icon'=>'🔗','label'=>'Financial network','severity'=>'critical','score'=>91,'detail'=>'Connected to Horvat, Hassan; beneficial owner of Meridian Finance Ltd.'],
            ],
            7 => [
                ['id'=>'rf12','category'=>'connections','icon'=>'🔗','label'=>'Network ties','severity'=>'high','score'=>78,'detail'=>'Connected to Al-Rashid; shared contacts with Horvat network.'],
                ['id'=>'rf13','category'=>'surveillance','icon'=>'👁️','label'=>'Tracking gaps','severity'=>'high','score'=>75,'detail'=>'3 periods of lost tracking (total 18h) in last 14 days.'],
            ],
            12 => [
                ['id'=>'rf14','category'=>'zone','icon'=>'🛡️','label'=>'Warehouse zone activity','severity'=>'medium','score'=>68,'detail'=>'5 late-night entries to monitored warehouse zone. Loitering detected.'],
                ['id'=>'rf15','category'=>'connections','icon'=>'🔗','label'=>'Horvat associate','severity'=>'high','score'=>74,'detail'=>'Regular meetings with Horvat; warehouse district operational connection.'],
            ],
        ];
    }
}
