<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX Admin Knowledge Base Mock REST API.
 * Categorized help articles with search, CRUD, view tracking, helpful ratings.
 */
class AdminKbApiController extends Controller
{
    private static function categories(): array
    {
        return [
            ['id'=>'getting-started','name'=>'Getting Started','icon'=>'🚀','color'=>'#3b82f6','description'=>'Platform basics, first login, navigation guide'],
            ['id'=>'map-tracking','name'=>'Map & Tracking','icon'=>'🗺️','color'=>'#22c55e','description'=>'Tactical map, entity tracking, geofences, layers'],
            ['id'=>'intelligence','name'=>'Intelligence','icon'=>'🔍','color'=>'#8b5cf6','description'=>'Face recognition, scrapers, connections, workflows'],
            ['id'=>'devices','name'=>'Devices & Cameras','icon'=>'📡','color'=>'#06b6d4','description'=>'Device management, camera setup, GPS trackers'],
            ['id'=>'admin','name'=>'Administration','icon'=>'⚙️','color'=>'#f59e0b','description'=>'User management, roles, configuration, backups'],
            ['id'=>'security','name'=>'Security & Compliance','icon'=>'🔐','color'=>'#ef4444','description'=>'Authentication, encryption, audit, data retention'],
            ['id'=>'troubleshooting','name'=>'Troubleshooting','icon'=>'🔧','color'=>'#f97316','description'=>'Common issues, error codes, recovery procedures'],
        ];
    }

    private static function articles(): array
    {
        return [
            ['id'=>'kb-01','categoryId'=>'getting-started','title'=>'First Login & Platform Overview','summary'=>'How to access ARGUX for the first time and configure your workspace.','content'=>"After receiving credentials, navigate to login. Enter email/password and complete 2FA.\n\nOnce authenticated, you land on the Tactical Map. The sidebar provides navigation to all modules.\n\nRecommended first steps:\n1. Update your Profile and security settings\n2. Familiarize with the Map toolbar\n3. Review assigned operations\n4. Configure notification preferences",'author'=>'System Admin','updatedAt'=>'2026-03-20','views'=>847,'helpful'=>92,'helpfulTotal'=>100,'readTime'=>'5 min','tags'=>['onboarding','login','navigation'],'relatedIds'=>['kb-02','kb-03']],
            ['id'=>'kb-02','categoryId'=>'getting-started','title'=>'Understanding the Sidebar Navigation','summary'=>'Guide to sidebar sections: Command, Subjects, Intelligence, Analysis, Monitoring, Tools.','content'=>"The sidebar is organized into 7 sections:\n\nCommand — Map, Vision, Operations\nSubjects — Persons, Organizations, Vehicles, Devices\nIntelligence — Plate/Face recognition, Scrapers, Apps\nAnalysis — Connections, Workflows, Data sources\nMonitoring — Alerts, Activity, Notifications, Risks\nTools — AI Assistant, Records, Storage, Reports\nSystem — Jobs, Settings",'author'=>'Training Team','updatedAt'=>'2026-03-18','views'=>623,'helpful'=>88,'helpfulTotal'=>95,'readTime'=>'4 min','tags'=>['navigation','sidebar','modules'],'relatedIds'=>['kb-01','kb-04']],
            ['id'=>'kb-03','categoryId'=>'getting-started','title'=>'Keyboard Shortcuts Reference','summary'=>'Master keyboard shortcuts across all ARGUX modules.','content'=>"Press Ctrl+Q on any page to see shortcuts.\n\nGlobal: F=search, R=reset, N=new, Esc=close\nMap: S=sidebar, L=layers, +/-=zoom\nVision: 1/2/3/4=grid, A=AI, N=NVG",'author'=>'Training Team','updatedAt'=>'2026-03-22','views'=>1204,'helpful'=>96,'helpfulTotal'=>100,'readTime'=>'3 min','tags'=>['shortcuts','keyboard','productivity'],'relatedIds'=>['kb-01','kb-02']],
            ['id'=>'kb-04','categoryId'=>'getting-started','title'=>'Theme & Display Settings','summary'=>'Switch between dark/light themes, change fonts, adjust display.','content'=>"ARGUX supports 10 themes (7 dark, 3 light) and 7 fonts.\n\nDark: Tactical Dark, Midnight Ops, Stealth Green, Crimson Ops, Desert Storm, Ocean Depth, Phantom Gray\nLight: Arctic White, Sand Light, Silver Steel",'author'=>'UX Team','updatedAt'=>'2026-03-15','views'=>389,'helpful'=>82,'helpfulTotal'=>90,'readTime'=>'2 min','tags'=>['themes','display','customization'],'relatedIds'=>['kb-01']],
            ['id'=>'kb-05','categoryId'=>'map-tracking','title'=>'Tactical Map — Complete Guide','summary'=>'Map interface: toolbar, markers, layers, tracking, intelligence panels.','content'=>"The Tactical Map is the central hub. It shows real-time positions, camera feeds, geofences.\n\nToolbar groups: Period, Subjects, Sources, Layers, Tiles, Tools, Intelligence.\n\nRight-click any marker for context menu navigation.",'author'=>'Operations','updatedAt'=>'2026-03-24','views'=>2341,'helpful'=>94,'helpfulTotal'=>100,'readTime'=>'8 min','tags'=>['map','tracking','markers','layers'],'relatedIds'=>['kb-06','kb-07']],
            ['id'=>'kb-06','categoryId'=>'map-tracking','title'=>'Entity Tracking & Trail Lines','summary'=>'Activate real-time tracking, view trails, analyze routes.','content'=>"Open Entity Tracker panel. Select persons for live tracking.\n\nFeatures: 2s GPS updates, trail lines, route drawing, activity heatmaps, zone history.\n\nUse Stop All Tracking to clear sessions.",'author'=>'Cpt. Horvat','updatedAt'=>'2026-03-23','views'=>1567,'helpful'=>91,'helpfulTotal'=>98,'readTime'=>'5 min','tags'=>['tracking','GPS','trails'],'relatedIds'=>['kb-05','kb-08']],
            ['id'=>'kb-07','categoryId'=>'map-tracking','title'=>'Geofence Zones — Create & Monitor','summary'=>'Drawing zones, configuring alerts, monitoring breaches.','content'=>"Zone Editor tool:\nCircle: click center, drag radius\nPolygon: click vertices, double-click to close\n\nProperties: name, type (restricted/monitored/safe), severity, linked persons.",'author'=>'Operations','updatedAt'=>'2026-03-21','views'=>892,'helpful'=>87,'helpfulTotal'=>94,'readTime'=>'4 min','tags'=>['geofence','zones','alerts'],'relatedIds'=>['kb-05','kb-06']],
            ['id'=>'kb-08','categoryId'=>'map-tracking','title'=>'Map Tile Providers & 3D Modes','summary'=>'16 raster tiles, vector tiles, 4 3D rendering modes.','content'=>"20+ base maps, all free and self-hostable.\n\nRaster: CartoDB, ESRI, Stamen, OSM, OpenTopo\nVector: OpenFreeMap\n3D: Virtual, Realistic, Terrain, Night",'author'=>'IT Infrastructure','updatedAt'=>'2026-03-19','views'=>445,'helpful'=>80,'helpfulTotal'=>88,'readTime'=>'3 min','tags'=>['tiles','maps','3D','offline'],'relatedIds'=>['kb-05']],
            ['id'=>'kb-09','categoryId'=>'intelligence','title'=>'Face Recognition — Search & Match','summary'=>'Upload photos, run searches against the camera network.','content'=>"Upload a reference photo or select from known persons.\n\nResults show: matched captures, confidence %, camera source, timestamp, location.\n\nPowered by InsightFace/ArcFace (ONNX Runtime, GPU-accelerated).",'author'=>'AI Team','updatedAt'=>'2026-03-25','views'=>1823,'helpful'=>90,'helpfulTotal'=>96,'readTime'=>'6 min','tags'=>['face','recognition','AI','cameras'],'relatedIds'=>['kb-10']],
            ['id'=>'kb-10','categoryId'=>'intelligence','title'=>'LPR — License Plate Recognition','summary'=>'Plate detection, OCR reading, sighting history.','content'=>"YOLOv8 detects plates, PaddleOCR reads characters.\n\nSupports: Croatian, EU, international formats.\n\nSighting data: plate, direction, speed, lane, camera, timestamp.",'author'=>'AI Team','updatedAt'=>'2026-03-24','views'=>1245,'helpful'=>85,'helpfulTotal'=>92,'readTime'=>'4 min','tags'=>['LPR','plates','OCR','YOLO'],'relatedIds'=>['kb-09']],
            ['id'=>'kb-11','categoryId'=>'intelligence','title'=>'Social Media Scrapers','summary'=>'Configure scrapers for 7 platforms.','content'=>"Platforms: Facebook, X, Instagram, TikTok, YouTube, LinkedIn, Telegram.\n\nEach scraper: target URL, keywords, interval, assigned person.\nActions: start, pause, delete.",'author'=>'Lt. Perić','updatedAt'=>'2026-03-22','views'=>678,'helpful'=>83,'helpfulTotal'=>90,'readTime'=>'4 min','tags'=>['scraper','social','OSINT'],'relatedIds'=>['kb-12']],
            ['id'=>'kb-12','categoryId'=>'intelligence','title'=>'Connections Graph Analysis','summary'=>'Force-directed graph, co-location analysis, network visualization.','content'=>"Interactive graph: persons and orgs as nodes, connections as edges.\n\nEdge types: financial, family, business, criminal.\nStrength-based thickness, type-based coloring.\n\nClick node to focus, right-click for context menu.",'author'=>'Maj. Novak','updatedAt'=>'2026-03-20','views'=>1456,'helpful'=>93,'helpfulTotal'=>98,'readTime'=>'6 min','tags'=>['connections','graph','network','analysis'],'relatedIds'=>['kb-11']],
            ['id'=>'kb-13','categoryId'=>'devices','title'=>'Device Management Overview','summary'=>'Monitor all devices: phones, GPS, cameras, microphones, LPR readers.','content'=>"147+ devices across 7 types.\n\nDevice cards show: status, signal, battery, last seen, sync status.\nReal-time updates via WebSocket.",'author'=>'IT Support','updatedAt'=>'2026-03-23','views'=>934,'helpful'=>86,'helpfulTotal'=>92,'readTime'=>'5 min','tags'=>['devices','monitoring','status'],'relatedIds'=>['kb-14']],
            ['id'=>'kb-14','categoryId'=>'devices','title'=>'Camera Network Setup (RTSP/ONVIF)','summary'=>'Adding cameras, configuring streams, managing the vision wall.','content'=>"Cameras connect via RTSP or ONVIF protocol.\n\nSetup: add device → enter stream URL → test connection → assign to grid.\n\nVision wall supports 1/4/9/16 grid layouts with fullscreen toggle.",'author'=>'IT Support','updatedAt'=>'2026-03-21','views'=>756,'helpful'=>84,'helpfulTotal'=>90,'readTime'=>'5 min','tags'=>['cameras','RTSP','ONVIF','vision'],'relatedIds'=>['kb-13']],
            ['id'=>'kb-15','categoryId'=>'admin','title'=>'User & Role Management','summary'=>'Creating users, assigning roles, managing permissions.','content'=>"Roles: Super Admin, Admin, Security Officer, Audit Reader, Support Agent (admin scope).\nOperator roles: Senior Operator, Intelligence Analyst, Operator, Viewer, Trainee.\n\nPermission matrix: 32 modules × 6 actions (view, create, edit, delete, export, manage).",'author'=>'Col. Tomić','updatedAt'=>'2026-03-26','views'=>1122,'helpful'=>91,'helpfulTotal'=>96,'readTime'=>'7 min','tags'=>['users','roles','permissions','RBAC'],'relatedIds'=>['kb-16']],
            ['id'=>'kb-16','categoryId'=>'admin','title'=>'System Configuration Guide','summary'=>'11 configuration tabs: general, security, notifications, map, backup, AI, etc.','content'=>"Configuration organized in 11 tabs.\n\nKey settings: language, timezone, MFA enforcement, map defaults, retention policies, backup schedules, AI model deployment, licence management.",'author'=>'Col. Tomić','updatedAt'=>'2026-03-25','views'=>567,'helpful'=>88,'helpfulTotal'=>94,'readTime'=>'6 min','tags'=>['config','settings','system'],'relatedIds'=>['kb-15']],
            ['id'=>'kb-17','categoryId'=>'security','title'=>'Authentication & MFA Setup','summary'=>'Login flow, 2FA methods, backup codes, session management.','content'=>"ARGUX supports 3 MFA methods: Authenticator App, SMS, Email.\n\nBackup codes: 8 one-time codes generated in Profile → Security.\n\nSessions: view active sessions, revoke individual sessions, force logout.",'author'=>'Security Team','updatedAt'=>'2026-03-24','views'=>1890,'helpful'=>95,'helpfulTotal'=>100,'readTime'=>'5 min','tags'=>['authentication','MFA','2FA','security'],'relatedIds'=>['kb-18']],
            ['id'=>'kb-18','categoryId'=>'security','title'=>'Data Encryption & Sovereignty','summary'=>'AES-256 at rest, TLS 1.3 in transit, air-gap deployment.','content'=>"All data encrypted AES-256 at rest. TLS 1.3 for all connections.\n\nAir-gap capable: all services run locally. No external API calls.\nData stored on customer hardware only.",'author'=>'Security Team','updatedAt'=>'2026-03-22','views'=>678,'helpful'=>90,'helpfulTotal'=>95,'readTime'=>'4 min','tags'=>['encryption','sovereignty','air-gap','TLS'],'relatedIds'=>['kb-17']],
            ['id'=>'kb-19','categoryId'=>'troubleshooting','title'=>'Common Error Codes & Solutions','summary'=>'Reference for ARGUX error codes and resolution steps.','content'=>"ERR-001: Authentication failed → Check credentials, verify MFA\nERR-002: Session expired → Re-login, check timeout settings\nERR-003: Device offline → Check network, power, signal\nERR-004: Sync failed → Verify endpoint, check certificates\nERR-005: GPU OOM → Reduce batch size, restart AI service",'author'=>'IT Support','updatedAt'=>'2026-03-26','views'=>2456,'helpful'=>94,'helpfulTotal'=>100,'readTime'=>'5 min','tags'=>['errors','troubleshooting','solutions'],'relatedIds'=>[]],
        ];
    }

    /** GET /mock-api/admin/kb/categories */
    public function categories(): JsonResponse
    {
        $cats = self::categories();
        $articles = self::articles();
        foreach ($cats as &$c) {
            $catArts = array_filter($articles, fn($a) => $a['categoryId'] === $c['id']);
            $c['articleCount'] = count($catArts);
            $c['totalViews'] = array_sum(array_column($catArts, 'views'));
        }
        return response()->json(['data' => $cats]);
    }

    /** GET /mock-api/admin/kb/articles */
    public function index(Request $request): JsonResponse
    {
        $data = self::articles();
        $search = strtolower($request->query('search', ''));
        $category = $request->query('category', '');

        if ($category) $data = array_values(array_filter($data, fn($a) => $a['categoryId'] === $category));
        if ($search) $data = array_values(array_filter($data, fn($a) => str_contains(strtolower($a['title'].' '.$a['summary'].' '.implode(' ',$a['tags']).' '.$a['content']), $search)));

        return response()->json([
            'data' => array_map(fn($a) => array_diff_key($a, ['content'=>1]), $data),
            'meta' => ['total' => count($data)],
        ]);
    }

    /** GET /mock-api/admin/kb/articles/{id} */
    public function show(string $id): JsonResponse
    {
        $article = collect(self::articles())->firstWhere('id', $id);
        if (!$article) return response()->json(['message'=>'Article not found.','code'=>'NOT_FOUND'], 404);
        $category = collect(self::categories())->firstWhere('id', $article['categoryId']);
        $related = collect(self::articles())->whereIn('id', $article['relatedIds'])->map(fn($a) => ['id'=>$a['id'],'title'=>$a['title'],'categoryId'=>$a['categoryId'],'readTime'=>$a['readTime']])->values();
        return response()->json(['data' => $article, 'category' => $category, 'related' => $related]);
    }

    /** POST /mock-api/admin/kb/articles */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'=>['required','string','min:5','max:200'],
            'summary'=>['required','string','min:10','max:500'],
            'content'=>['required','string','min:20'],
            'category_id'=>['required','string','in:getting-started,map-tracking,intelligence,devices,admin,security,troubleshooting'],
            'tags'=>['nullable','array'],
            'tags.*'=>['string','max:50'],
        ]);
        Log::info('KB API: article created', ['title'=>$request->input('title')]);
        usleep(500_000);
        return response()->json(['message'=>'Article created.','data'=>[
            'id'=>'kb-'.Str::random(6),'categoryId'=>$request->input('category_id'),'title'=>$request->input('title'),
            'summary'=>$request->input('summary'),'content'=>$request->input('content'),
            'author'=>'System Administrator','updatedAt'=>now()->toDateString(),
            'views'=>0,'helpful'=>0,'helpfulTotal'=>0,'readTime'=>'3 min',
            'tags'=>$request->input('tags',[]),'relatedIds'=>[],
        ]], 201);
    }

    /** PUT /mock-api/admin/kb/articles/{id} */
    public function update(Request $request, string $id): JsonResponse
    {
        $article = collect(self::articles())->firstWhere('id', $id);
        if (!$article) return response()->json(['message'=>'Article not found.','code'=>'NOT_FOUND'], 404);
        $request->validate([
            'title'=>['sometimes','string','min:5','max:200'],
            'summary'=>['sometimes','string','min:10','max:500'],
            'content'=>['sometimes','string','min:20'],
            'category_id'=>['sometimes','string'],
            'tags'=>['nullable','array'],
        ]);
        Log::info('KB API: article updated', ['id'=>$id]);
        usleep(400_000);
        return response()->json(['message'=>'Article updated.','data'=>array_merge($article, array_filter([
            'title'=>$request->input('title'),'summary'=>$request->input('summary'),
            'content'=>$request->input('content'),'categoryId'=>$request->input('category_id'),
            'tags'=>$request->input('tags'),'updatedAt'=>now()->toDateString(),
        ], fn($v)=>$v!==null))]);
    }

    /** DELETE /mock-api/admin/kb/articles/{id} */
    public function destroy(string $id): JsonResponse
    {
        $article = collect(self::articles())->firstWhere('id', $id);
        if (!$article) return response()->json(['message'=>'Article not found.','code'=>'NOT_FOUND'], 404);
        Log::info('KB API: article deleted', ['id'=>$id,'title'=>$article['title']]);
        return response()->json(['message'=>"Article \"{$article['title']}\" deleted.",'id'=>$id]);
    }

    /** POST /mock-api/admin/kb/articles/{id}/helpful */
    public function helpful(Request $request, string $id): JsonResponse
    {
        $request->validate(['helpful'=>['required','boolean']]);
        $article = collect(self::articles())->firstWhere('id', $id);
        if (!$article) return response()->json(['message'=>'Article not found.','code'=>'NOT_FOUND'], 404);
        $newTotal = $article['helpfulTotal'] + 1;
        $newHelpful = $article['helpful'] + ($request->boolean('helpful') ? 1 : 0);
        return response()->json([
            'message'=>'Thank you for your feedback.',
            'helpful'=>$newHelpful,'helpfulTotal'=>$newTotal,
            'percentage'=>round($newHelpful/$newTotal*100),
        ]);
    }
}
