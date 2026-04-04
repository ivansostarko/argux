<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * ARGUX Admin Statistics Mock REST API.
 * 6 tabs of chart data: overview, activity, devices, alerts, media, subjects.
 */
class AdminStatisticsApiController extends Controller
{
    /** GET /mock-api/admin/statistics/{tab} — Data for a single tab */
    public function tab(Request $request, string $tab): JsonResponse
    {
        $valid = ['overview','activity','devices','alerts','media','subjects'];
        if (!in_array($tab, $valid)) {
            return response()->json(['message' => "Invalid tab: {$tab}. Valid: " . implode(', ', $valid), 'code' => 'INVALID_TAB'], 404);
        }
        $method = "data_" . $tab;
        return response()->json(['tab' => $tab, 'data' => self::$method()]);
    }

    /** GET /mock-api/admin/statistics — All tabs + metadata */
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'tabs' => [
                ['id'=>'overview','label'=>'Overview','icon'=>'📊'],
                ['id'=>'activity','label'=>'Activity','icon'=>'⚡'],
                ['id'=>'devices','label'=>'Devices','icon'=>'📡'],
                ['id'=>'alerts','label'=>'Alerts','icon'=>'🚨'],
                ['id'=>'media','label'=>'Media & AI','icon'=>'🤖'],
                ['id'=>'subjects','label'=>'Subjects','icon'=>'🎯'],
            ],
            'generated_at' => now()->toDateTimeString(),
        ]);
    }

    private static function data_overview(): array
    {
        return [
            'kpis' => [
                ['label'=>'Total Events','value'=>'1,247,832','trend'=>'+12.4%','color'=>'#3b82f6'],
                ['label'=>'Entities Tracked','value'=>'12,847','trend'=>'+89 today','color'=>'#22c55e'],
                ['label'=>'Active Operations','value'=>'5','trend'=>'HAWK leading','color'=>'#f59e0b'],
                ['label'=>'AI Jobs Processed','value'=>'8,432','trend'=>'+340 this week','color'=>'#8b5cf6'],
                ['label'=>'Storage Used','value'=>'2.4 TB','trend'=>'30% of 8 TB','color'=>'#06b6d4'],
                ['label'=>'System Uptime','value'=>'99.97%','trend'=>'42 days','color'=>'#22c55e'],
            ],
            'event_trend' => [
                ['month'=>'Oct','events'=>82400],['month'=>'Nov','events'=>94200],['month'=>'Dec','events'=>87600],
                ['month'=>'Jan','events'=>105800],['month'=>'Feb','events'=>118400],['month'=>'Mar','events'=>134200],
            ],
            'entity_growth' => [
                ['month'=>'Oct','persons'=>8200,'orgs'=>420,'vehicles'=>1800],
                ['month'=>'Nov','persons'=>8900,'orgs'=>450,'vehicles'=>2100],
                ['month'=>'Dec','persons'=>9400,'orgs'=>470,'vehicles'=>2400],
                ['month'=>'Jan','persons'=>10200,'orgs'=>510,'vehicles'=>2700],
                ['month'=>'Feb','persons'=>11400,'orgs'=>540,'vehicles'=>3000],
                ['month'=>'Mar','persons'=>12847,'orgs'=>580,'vehicles'=>3200],
            ],
            'storage_donut' => [
                ['label'=>'Video','value'=>1320,'color'=>'#3b82f6'],['label'=>'Camera','value'=>515,'color'=>'#8b5cf6'],
                ['label'=>'Audio','value'=>236,'color'=>'#f59e0b'],['label'=>'Documents','value'=>193,'color'=>'#22c55e'],
                ['label'=>'Photos','value'=>172,'color'=>'#ec4899'],['label'=>'Backups','value'=>129,'color'=>'#06b6d4'],
                ['label'=>'AI Models','value'=>48,'color'=>'#ef4444'],
            ],
        ];
    }

    private static function data_activity(): array
    {
        return [
            'heatmap' => [
                [12,8,4,2,1,3,5,18,45,67,78,82,80,75,68,55,48,42,38,30,25,20,16,14],
                [10,6,3,1,2,4,6,20,50,72,85,88,84,78,70,58,50,44,40,32,26,22,18,12],
                [14,10,5,3,2,5,8,22,48,70,82,86,82,76,65,54,46,40,36,28,22,18,16,12],
                [11,7,4,2,1,3,7,19,46,68,80,84,80,74,66,56,48,42,37,29,24,20,17,13],
                [15,12,6,3,2,4,6,16,42,64,76,80,78,72,62,52,44,38,34,26,20,16,14,10],
                [8,5,3,2,2,3,4,10,20,28,32,30,28,24,20,16,14,12,10,8,6,5,4,3],
                [6,4,2,1,1,2,3,8,14,18,22,20,18,16,14,12,10,8,6,5,4,3,3,2],
            ],
            'heatmap_days' => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
            'top_subjects' => [
                ['name'=>'Horvat (#1)','value'=>4280,'color'=>'#ef4444'],['name'=>'Mendoza (#9)','value'=>3650,'color'=>'#f97316'],
                ['name'=>'Al-Rashid (#3)','value'=>2890,'color'=>'#f59e0b'],['name'=>'Hassan (#7)','value'=>2540,'color'=>'#22c55e'],
                ['name'=>'Babić (#12)','value'=>2120,'color'=>'#3b82f6'],['name'=>'Kovačević (#5)','value'=>1830,'color'=>'#8b5cf6'],
                ['name'=>'Petrović (#8)','value'=>1450,'color'=>'#06b6d4'],['name'=>'Ilić (#15)','value'=>1120,'color'=>'#ec4899'],
            ],
            'event_type_breakdown' => [
                ['label'=>'GPS','value'=>3420,'color'=>'#3b82f6'],['label'=>'Phone','value'=>2890,'color'=>'#22c55e'],
                ['label'=>'Camera','value'=>2150,'color'=>'#8b5cf6'],['label'=>'LPR','value'=>1680,'color'=>'#f59e0b'],
                ['label'=>'Face','value'=>980,'color'=>'#ec4899'],['label'=>'Audio','value'=>540,'color'=>'#06b6d4'],
                ['label'=>'Video','value'=>320,'color'=>'#f97316'],['label'=>'Photo','value'=>180,'color'=>'#ef4444'],
            ],
        ];
    }

    private static function data_devices(): array
    {
        return [
            'by_type' => [
                ['type'=>'Phone','online'=>34,'degraded'=>3,'offline'=>1],
                ['type'=>'GPS','online'=>28,'degraded'=>2,'offline'=>0],
                ['type'=>'Camera','online'=>42,'degraded'=>5,'offline'=>2],
                ['type'=>'Mic','online'=>8,'degraded'=>1,'offline'=>0],
                ['type'=>'LPR','online'=>12,'degraded'=>1,'offline'=>1],
                ['type'=>'Face','online'=>6,'degraded'=>0,'offline'=>0],
                ['type'=>'Desktop','online'=>15,'degraded'=>0,'offline'=>0],
            ],
            'battery_distribution' => [
                ['range'=>'0-20%','count'=>4,'color'=>'#ef4444'],['range'=>'21-40%','count'=>8,'color'=>'#f97316'],
                ['range'=>'41-60%','count'=>18,'color'=>'#f59e0b'],['range'=>'61-80%','count'=>32,'color'=>'#22c55e'],
                ['range'=>'81-100%','count'=>45,'color'=>'#3b82f6'],
            ],
            'sync_rate' => [
                ['type'=>'Phone','rates'=>[98,97,99,98,96,99,98]],['type'=>'GPS','rates'=>[99,99,100,99,98,99,100]],
                ['type'=>'Camera','rates'=>[95,94,96,93,95,94,96]],['type'=>'LPR','rates'=>[97,98,97,99,98,97,98]],
            ],
        ];
    }

    private static function data_alerts(): array
    {
        return [
            'frequency' => [
                ['day'=>'Mon','alerts'=>42],['day'=>'Tue','alerts'=>38],['day'=>'Wed','alerts'=>55],
                ['day'=>'Thu','alerts'=>48],['day'=>'Fri','alerts'=>63],['day'=>'Sat','alerts'=>28],['day'=>'Sun','alerts'=>22],
            ],
            'severity_donut' => [
                ['label'=>'Critical','value'=>23,'color'=>'#ef4444'],['label'=>'Warning','value'=>67,'color'=>'#f59e0b'],
                ['label'=>'Informational','value'=>142,'color'=>'#3b82f6'],
            ],
            'response_time' => [
                ['range'=>'<1min','count'=>45],['range'=>'1-5min','count'=>78],['range'=>'5-15min','count'=>42],
                ['range'=>'15-30min','count'=>18],['range'=>'30-60min','count'=>8],['range'=>'>1hr','count'=>3],
            ],
            'top_rules' => [
                ['name'=>'Zone Entry — Savska','value'=>89,'color'=>'#ef4444'],
                ['name'=>'Co-location Horvat+Mendoza','value'=>67,'color'=>'#f97316'],
                ['name'=>'LPR — ZG-XXXX plates','value'=>52,'color'=>'#f59e0b'],
                ['name'=>'Face Match > 85%','value'=>41,'color'=>'#8b5cf6'],
                ['name'=>'Signal Lost > 30min','value'=>34,'color'=>'#3b82f6'],
                ['name'=>'Speed > 120 km/h','value'=>28,'color'=>'#22c55e'],
            ],
        ];
    }

    private static function data_media(): array
    {
        return [
            'upload_volume' => [
                ['month'=>'Oct','video'=>120,'audio'=>45,'photos'=>38,'documents'=>22],
                ['month'=>'Nov','video'=>135,'audio'=>52,'photos'=>42,'documents'=>28],
                ['month'=>'Dec','video'=>110,'audio'=>40,'photos'=>35,'documents'=>20],
                ['month'=>'Jan','video'=>148,'audio'=>58,'photos'=>48,'documents'=>30],
                ['month'=>'Feb','video'=>162,'audio'=>65,'photos'=>52,'documents'=>35],
                ['month'=>'Mar','video'=>180,'audio'=>72,'photos'=>58,'documents'=>38],
            ],
            'ai_processing' => [
                ['label'=>'Face Recognition','processed'=>12480,'queue'=>8,'rate'=>'98.2%','color'=>'#8b5cf6'],
                ['label'=>'LPR OCR','processed'=>28940,'queue'=>3,'rate'=>'99.1%','color'=>'#f59e0b'],
                ['label'=>'Transcription','processed'=>4280,'queue'=>12,'rate'=>'94.5%','color'=>'#3b82f6'],
                ['label'=>'Translation','processed'=>1890,'queue'=>2,'rate'=>'97.8%','color'=>'#22c55e'],
            ],
            'face_match_rate' => [
                ['month'=>'Oct','rate'=>82.4],['month'=>'Nov','rate'=>84.1],['month'=>'Dec','rate'=>85.8],
                ['month'=>'Jan','rate'=>87.2],['month'=>'Feb','rate'=>88.5],['month'=>'Mar','rate'=>89.7],
            ],
        ];
    }

    private static function data_subjects(): array
    {
        return [
            'top_persons' => [
                ['name'=>'Marko Horvat','value'=>4280,'color'=>'#ef4444'],['name'=>'Carlos Mendoza','value'=>3650,'color'=>'#f97316'],
                ['name'=>'Omar Al-Rashid','value'=>2890,'color'=>'#f59e0b'],['name'=>'Yusuf Hassan','value'=>2540,'color'=>'#22c55e'],
                ['name'=>'Ivan Babić','value'=>2120,'color'=>'#3b82f6'],['name'=>'Ana Kovačević','value'=>1830,'color'=>'#8b5cf6'],
                ['name'=>'Petar Petrović','value'=>1450,'color'=>'#06b6d4'],['name'=>'Sandra Ilić','value'=>1120,'color'=>'#ec4899'],
                ['name'=>'Nikola Krajina','value'=>890,'color'=>'#f97316'],['name'=>'Elena Petrova','value'=>720,'color'=>'#3b82f6'],
            ],
            'top_orgs' => [
                ['name'=>'Meridian Holdings','value'=>12,'color'=>'#ef4444'],['name'=>'Balkan Trade LLC','value'=>9,'color'=>'#f97316'],
                ['name'=>'Adriatic Shipping','value'=>8,'color'=>'#f59e0b'],['name'=>'Nova Construction','value'=>7,'color'=>'#22c55e'],
                ['name'=>'Global Freight','value'=>6,'color'=>'#3b82f6'],
            ],
            'risk_distribution' => [
                ['label'=>'Critical','value'=>5,'color'=>'#ef4444'],['label'=>'High','value'=>12,'color'=>'#f97316'],
                ['label'=>'Medium','value'=>28,'color'=>'#f59e0b'],['label'=>'Low','value'=>67,'color'=>'#22c55e'],
            ],
            'new_entities_trend' => [
                ['month'=>'Oct','persons'=>120,'orgs'=>8,'vehicles'=>45],
                ['month'=>'Nov','persons'=>145,'orgs'=>12,'vehicles'=>52],
                ['month'=>'Dec','persons'=>98,'orgs'=>6,'vehicles'=>38],
                ['month'=>'Jan','persons'=>178,'orgs'=>15,'vehicles'=>65],
                ['month'=>'Feb','persons'=>192,'orgs'=>11,'vehicles'=>72],
                ['month'=>'Mar','persons'=>210,'orgs'=>14,'vehicles'=>80],
            ],
        ];
    }
}
