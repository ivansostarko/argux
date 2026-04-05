<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX Social Media Scraper Mock REST API.
 * 7 platforms, scraper CRUD, scraped post feed with AI flagging.
 */
class SocialScraperApiController extends Controller
{
    private static function scrapers(): array
    {
        return [
            ['id'=>'sc01','platform'=>'Facebook','profileUrl'=>'https://facebook.com/marko.horvat.zg','profileHandle'=>'marko.horvat.zg','personId'=>1,'personName'=>'Marko Horvat','orgId'=>null,'orgName'=>'','status'=>'Active','interval'=>'Every 15min','lastRun'=>'2026-03-27 09:25','totalPosts'=>423,'newPosts'=>3,'keywords'=>['port','business','meeting','security'],'operationCode'=>'HAWK'],
            ['id'=>'sc02','platform'=>'Instagram','profileUrl'=>'https://instagram.com/horvat_official','profileHandle'=>'@horvat_official','personId'=>1,'personName'=>'Marko Horvat','orgId'=>null,'orgName'=>'','status'=>'Active','interval'=>'Every 30min','lastRun'=>'2026-03-27 09:00','totalPosts'=>289,'newPosts'=>1,'keywords'=>['lifestyle','travel','yacht'],'operationCode'=>'HAWK'],
            ['id'=>'sc03','platform'=>'X','profileUrl'=>'https://x.com/mendoza_carlos','profileHandle'=>'@mendoza_carlos','personId'=>9,'personName'=>'Carlos Mendoza','orgId'=>null,'orgName'=>'','status'=>'Active','interval'=>'Every 15min','lastRun'=>'2026-03-27 09:20','totalPosts'=>567,'newPosts'=>5,'keywords'=>['business','import','logistics'],'operationCode'=>'HAWK'],
            ['id'=>'sc04','platform'=>'Telegram','profileUrl'=>'https://t.me/hassan_y7','profileHandle'=>'@hassan_y7','personId'=>7,'personName'=>'Youssef Hassan','orgId'=>null,'orgName'=>'','status'=>'Active','interval'=>'Every 10min','lastRun'=>'2026-03-27 09:27','totalPosts'=>189,'newPosts'=>2,'keywords'=>['shipping','cargo','delivery'],'operationCode'=>'GLACIER'],
            ['id'=>'sc05','platform'=>'LinkedIn','profileUrl'=>'https://linkedin.com/in/ahmed-alrashid','profileHandle'=>'ahmed-alrashid','personId'=>3,'personName'=>'Ahmed Al-Rashid','orgId'=>2,'orgName'=>'Rashid Holdings','status'=>'Active','interval'=>'Every 1h','lastRun'=>'2026-03-27 08:00','totalPosts'=>134,'newPosts'=>0,'keywords'=>['investment','partnership','finance'],'operationCode'=>'GLACIER'],
            ['id'=>'sc06','platform'=>'TikTok','profileUrl'=>'https://tiktok.com/@babic_ivan','profileHandle'=>'@babic_ivan','personId'=>12,'personName'=>'Ivan Babić','orgId'=>null,'orgName'=>'','status'=>'Paused','interval'=>'Every 30min','lastRun'=>'2026-03-25 12:00','totalPosts'=>78,'newPosts'=>0,'keywords'=>['workout','nightlife','cars'],'operationCode'=>'HAWK'],
            ['id'=>'sc07','platform'=>'YouTube','profileUrl'=>'https://youtube.com/@alpha-security-group','profileHandle'=>'@alpha-security-group','personId'=>null,'personName'=>'','orgId'=>1,'orgName'=>'Alpha Security Group','status'=>'Active','interval'=>'Every 6h','lastRun'=>'2026-03-27 06:00','totalPosts'=>34,'newPosts'=>0,'keywords'=>['security','corporate','recruitment'],'operationCode'=>''],
            ['id'=>'sc08','platform'=>'Facebook','profileUrl'=>'https://facebook.com/elena.petrova.hr','profileHandle'=>'elena.petrova.hr','personId'=>2,'personName'=>'Elena Petrova','orgId'=>null,'orgName'=>'','status'=>'Active','interval'=>'Every 1h','lastRun'=>'2026-03-27 08:30','totalPosts'=>456,'newPosts'=>2,'keywords'=>['finance','travel','luxury'],'operationCode'=>''],
            ['id'=>'sc09','platform'=>'Instagram','profileUrl'=>'https://instagram.com/mendoza_lifestyle','profileHandle'=>'@mendoza_lifestyle','personId'=>9,'personName'=>'Carlos Mendoza','orgId'=>null,'orgName'=>'','status'=>'Active','interval'=>'Every 30min','lastRun'=>'2026-03-27 09:15','totalPosts'=>312,'newPosts'=>1,'keywords'=>['car','travel','nightlife'],'operationCode'=>'HAWK'],
            ['id'=>'sc10','platform'=>'Telegram','profileUrl'=>'https://t.me/adriatic_maritime_ch','profileHandle'=>'@adriatic_maritime_ch','personId'=>null,'personName'=>'','orgId'=>6,'orgName'=>'Adriatic Shipping','status'=>'Error','interval'=>'Every 15min','lastRun'=>'2026-03-26 18:00','totalPosts'=>67,'newPosts'=>0,'keywords'=>['vessel','port','schedule'],'operationCode'=>'HAWK'],
            ['id'=>'sc11','platform'=>'X','profileUrl'=>'https://x.com/fatima_alz','profileHandle'=>'@fatima_alz','personId'=>11,'personName'=>'Fatima Al-Zahra','orgId'=>null,'orgName'=>'','status'=>'Active','interval'=>'Every 1h','lastRun'=>'2026-03-27 08:00','totalPosts'=>98,'newPosts'=>0,'keywords'=>['travel','family'],'operationCode'=>'HAWK'],
            ['id'=>'sc12','platform'=>'Reddit','profileUrl'=>'https://reddit.com/u/balkan_trade_watch','profileHandle'=>'u/balkan_trade_watch','personId'=>null,'personName'=>'','orgId'=>null,'orgName'=>'','status'=>'Queued','interval'=>'Every 2h','lastRun'=>'—','totalPosts'=>0,'newPosts'=>0,'keywords'=>['Croatia','smuggling','Adriatic','arms'],'operationCode'=>''],
        ];
    }

    private static function posts(): array
    {
        return [
            ['id'=>'sp01','scraperId'=>'sc01','platform'=>'Facebook','contentType'=>'post','personId'=>1,'personName'=>'Marko Horvat','orgId'=>null,'orgName'=>'','profileHandle'=>'marko.horvat.zg','content'=>'Another productive day at the office. Big things coming for Alpha Security Group! 🚀 #business #security #Zagreb','likes'=>47,'shares'=>3,'comments'=>8,'views'=>0,'sentiment'=>'positive','aiFlagged'=>false,'aiReason'=>'','mediaUrl'=>'','hasMedia'=>false,'timestamp'=>'2026-03-27 08:00','timeAgo'=>'1h ago','tags'=>['business','security']],
            ['id'=>'sp02','scraperId'=>'sc02','platform'=>'Instagram','contentType'=>'photo','personId'=>1,'personName'=>'Marko Horvat','orgId'=>null,'orgName'=>'','profileHandle'=>'@horvat_official','content'=>'Sunset over the Adriatic. Nothing beats this view. 🌅 #Croatia #Adriatic #life','likes'=>234,'shares'=>0,'comments'=>19,'views'=>0,'sentiment'=>'positive','aiFlagged'=>true,'aiReason'=>'Location metadata: Rijeka port area. Time: 19:30 — matches HAWK surveillance window','mediaUrl'=>'/mock/horvat_sunset.jpg','hasMedia'=>true,'timestamp'=>'2026-03-26 19:30','timeAgo'=>'14h ago','tags'=>['Adriatic','location-flagged','HAWK']],
            ['id'=>'sp03','scraperId'=>'sc03','platform'=>'X','contentType'=>'post','personId'=>9,'personName'=>'Carlos Mendoza','orgId'=>null,'orgName'=>'','profileHandle'=>'@mendoza_carlos','content'=>'Just landed in Zagreb. Time for some business meetings. The Balkans are full of opportunities! 🇭🇷','likes'=>12,'shares'=>2,'comments'=>4,'views'=>1890,'sentiment'=>'neutral','aiFlagged'=>true,'aiReason'=>'Travel alert: Mendoza arrived Zagreb — correlates with HAWK operation timeline','mediaUrl'=>'','hasMedia'=>false,'timestamp'=>'2026-03-27 06:15','timeAgo'=>'3h ago','tags'=>['travel','Zagreb','arrival','HAWK']],
            ['id'=>'sp04','scraperId'=>'sc04','platform'=>'Telegram','contentType'=>'post','personId'=>7,'personName'=>'Youssef Hassan','orgId'=>null,'orgName'=>'','profileHandle'=>'@hassan_y7','content'=>'الشحنة جاهزة. تأكيد الموقع غداً. لا تتأخر.','likes'=>0,'shares'=>0,'comments'=>1,'views'=>0,'sentiment'=>'flagged','aiFlagged'=>true,'aiReason'=>'Arabic text — keywords: shipment (الشحنة), location confirmation, urgency. Matches GLACIER intercept patterns.','mediaUrl'=>'','hasMedia'=>false,'timestamp'=>'2026-03-27 07:55','timeAgo'=>'1h ago','tags'=>['arabic','flagged','shipping','GLACIER']],
            ['id'=>'sp05','scraperId'=>'sc05','platform'=>'LinkedIn','contentType'=>'article','personId'=>3,'personName'=>'Ahmed Al-Rashid','orgId'=>2,'orgName'=>'Rashid Holdings','profileHandle'=>'ahmed-alrashid','content'=>'Excited to announce Rashid Holdings\' new strategic partnership with Meridian Finance for expanding trade operations in the Adriatic region. #investment #partnership','likes'=>89,'shares'=>12,'comments'=>23,'views'=>4500,'sentiment'=>'positive','aiFlagged'=>true,'aiReason'=>'Mentions Meridian Finance — entity under GLACIER investigation. New partnership announcement.','mediaUrl'=>'','hasMedia'=>false,'timestamp'=>'2026-03-25 10:00','timeAgo'=>'2d ago','tags'=>['partnership','Meridian','GLACIER']],
            ['id'=>'sp06','scraperId'=>'sc09','platform'=>'Instagram','contentType'=>'reel','personId'=>9,'personName'=>'Carlos Mendoza','orgId'=>null,'orgName'=>'','profileHandle'=>'@mendoza_lifestyle','content'=>'New ride 🔥 BMW X5 M Competition. Zagreb streets hit different at night. #cars #nightlife #Zagreb','likes'=>567,'shares'=>0,'comments'=>42,'views'=>12400,'sentiment'=>'positive','aiFlagged'=>true,'aiReason'=>'Vehicle identified: BMW X5 M — not previously registered to Mendoza. OSINT cross-reference needed.','mediaUrl'=>'/mock/mendoza_bmw.jpg','hasMedia'=>true,'timestamp'=>'2026-03-26 23:30','timeAgo'=>'10h ago','tags'=>['vehicle','BMW','night','HAWK']],
            ['id'=>'sp07','scraperId'=>'sc08','platform'=>'Facebook','contentType'=>'photo','personId'=>2,'personName'=>'Elena Petrova','orgId'=>null,'orgName'=>'','profileHandle'=>'elena.petrova.hr','content'=>'Weekend getaway to Dubrovnik with friends 🏖️ These moments matter! #travel #Dubrovnik #Croatia','likes'=>123,'shares'=>4,'comments'=>15,'views'=>0,'sentiment'=>'positive','aiFlagged'=>false,'aiReason'=>'','mediaUrl'=>'/mock/petrova_dubrovnik.jpg','hasMedia'=>true,'timestamp'=>'2026-03-23 14:00','timeAgo'=>'4d ago','tags'=>['travel','Dubrovnik']],
            ['id'=>'sp08','scraperId'=>'sc01','platform'=>'Facebook','contentType'=>'share','personId'=>1,'personName'=>'Marko Horvat','orgId'=>1,'orgName'=>'Alpha Security Group','profileHandle'=>'marko.horvat.zg','content'=>'Shared Alpha Security Group\'s post: "We are hiring! Join the leading private security company in Croatia. 🛡️"','likes'=>34,'shares'=>8,'comments'=>5,'views'=>0,'sentiment'=>'neutral','aiFlagged'=>false,'aiReason'=>'','mediaUrl'=>'','hasMedia'=>false,'timestamp'=>'2026-03-26 12:00','timeAgo'=>'21h ago','tags'=>['recruitment','Alpha']],
            ['id'=>'sp09','scraperId'=>'sc03','platform'=>'X','contentType'=>'comment','personId'=>9,'personName'=>'Carlos Mendoza','orgId'=>null,'orgName'=>'','profileHandle'=>'@mendoza_carlos','content'=>'@user_unknown Confirmed. Thursday evening. Same place as last time. DM me the details.','likes'=>1,'shares'=>0,'comments'=>0,'views'=>234,'sentiment'=>'flagged','aiFlagged'=>true,'aiReason'=>'Keywords: "confirmed", "Thursday evening", "same place" — matches HAWK operational trigger words','mediaUrl'=>'','hasMedia'=>false,'timestamp'=>'2026-03-27 08:30','timeAgo'=>'1h ago','tags'=>['Thursday','confirmed','HAWK','coded']],
            ['id'=>'sp10','scraperId'=>'sc04','platform'=>'Telegram','contentType'=>'photo','personId'=>7,'personName'=>'Youssef Hassan','orgId'=>null,'orgName'=>'','profileHandle'=>'@hassan_y7','content'=>'Photo shared in private channel — no caption','likes'=>0,'shares'=>0,'comments'=>0,'views'=>0,'sentiment'=>'neutral','aiFlagged'=>true,'aiReason'=>'Photo metadata shows GPS coordinates near Warehouse District. Time: 02:14 AM.','mediaUrl'=>'/mock/hassan_warehouse.jpg','hasMedia'=>true,'timestamp'=>'2026-03-27 02:14','timeAgo'=>'7h ago','tags'=>['warehouse','night','location-flagged','GLACIER']],
            ['id'=>'sp11','scraperId'=>'sc07','platform'=>'YouTube','contentType'=>'video','personId'=>null,'personName'=>'','orgId'=>1,'orgName'=>'Alpha Security Group','profileHandle'=>'@alpha-security-group','content'=>'Alpha Security Group — Corporate Overview 2026. Our team, our mission, our commitment to excellence.','likes'=>12,'shares'=>2,'comments'=>3,'views'=>890,'sentiment'=>'positive','aiFlagged'=>false,'aiReason'=>'','mediaUrl'=>'/mock/alpha_corporate.mp4','hasMedia'=>true,'timestamp'=>'2026-03-20 10:00','timeAgo'=>'7d ago','tags'=>['corporate','video','Alpha']],
            ['id'=>'sp12','scraperId'=>'sc11','platform'=>'X','contentType'=>'post','personId'=>11,'personName'=>'Fatima Al-Zahra','orgId'=>null,'orgName'=>'','profileHandle'=>'@fatima_alz','content'=>'Missing home. Inshallah I will visit Rijeka again soon. Beautiful port city 🌊','likes'=>8,'shares'=>0,'comments'=>2,'views'=>456,'sentiment'=>'positive','aiFlagged'=>true,'aiReason'=>'Mentions Rijeka port — subject last seen at Rijeka Port (offline 5 days)','mediaUrl'=>'','hasMedia'=>false,'timestamp'=>'2026-03-26 16:00','timeAgo'=>'17h ago','tags'=>['Rijeka','port','location-clue','HAWK']],
        ];
    }

    /** GET /mock-api/scraper/scrapers */
    public function scrapers(Request $request): JsonResponse
    {
        $data = self::scrapers();
        $platform = $request->query('platform', '');
        $status = $request->query('status', '');
        $personId = $request->query('person_id', '');
        $search = strtolower($request->query('search', ''));

        if ($platform && $platform !== 'all') $data = array_values(array_filter($data, fn($s) => $s['platform'] === $platform));
        if ($status && $status !== 'all') $data = array_values(array_filter($data, fn($s) => $s['status'] === $status));
        if ($personId) $data = array_values(array_filter($data, fn($s) => $s['personId'] == $personId));
        if ($search) $data = array_values(array_filter($data, fn($s) => str_contains(strtolower($s['profileHandle'].' '.$s['personName'].' '.$s['orgName'].' '.implode(' ',$s['keywords'])), $search)));

        return response()->json(['data' => $data, 'meta' => ['total' => count($data)]]);
    }

    /** GET /mock-api/scraper/posts */
    public function posts(Request $request): JsonResponse
    {
        $data = self::posts();
        $platform = $request->query('platform', '');
        $personId = $request->query('person_id', '');
        $sentiment = $request->query('sentiment', '');
        $flagged = $request->query('flagged', '');
        $search = strtolower($request->query('search', ''));

        if ($platform && $platform !== 'all') $data = array_values(array_filter($data, fn($p) => $p['platform'] === $platform));
        if ($personId) $data = array_values(array_filter($data, fn($p) => $p['personId'] == $personId));
        if ($sentiment && $sentiment !== 'all') $data = array_values(array_filter($data, fn($p) => $p['sentiment'] === $sentiment));
        if ($flagged === '1') $data = array_values(array_filter($data, fn($p) => $p['aiFlagged']));
        if ($search) $data = array_values(array_filter($data, fn($p) => str_contains(strtolower($p['content'].' '.$p['personName'].' '.$p['profileHandle'].' '.implode(' ',$p['tags'])), $search)));

        return response()->json(['data' => $data, 'meta' => ['total' => count($data)]]);
    }

    /** GET /mock-api/scraper/posts/{id} */
    public function showPost(string $id): JsonResponse
    {
        $post = collect(self::posts())->firstWhere('id', $id);
        if (!$post) return response()->json(['message' => 'Post not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $post]);
    }

    /** POST /mock-api/scraper/scrapers */
    public function storeScraper(Request $request): JsonResponse
    {
        $request->validate([
            'platform' => ['required', 'in:Facebook,X,Instagram,TikTok,YouTube,LinkedIn,Telegram,Snapchat,Reddit,WeChat'],
            'profileUrl' => ['required', 'string'],
            'profileHandle' => ['required', 'string'],
            'interval' => ['required', 'string'],
        ]);
        Log::info('Scraper API: scraper created', ['platform' => $request->input('platform'), 'handle' => $request->input('profileHandle')]);
        usleep(400_000);
        return response()->json(['message' => 'Scraper created.', 'data' => [
            'id' => 'sc-' . Str::random(6), 'platform' => $request->input('platform'),
            'profileHandle' => $request->input('profileHandle'), 'status' => 'Queued',
            'totalPosts' => 0, 'newPosts' => 0,
        ]], 201);
    }

    /** POST /mock-api/scraper/scrapers/{id}/run */
    public function runScraper(string $id): JsonResponse
    {
        $scraper = collect(self::scrapers())->firstWhere('id', $id);
        if (!$scraper) return response()->json(['message' => 'Scraper not found.', 'code' => 'NOT_FOUND'], 404);
        if ($scraper['status'] === 'Error') return response()->json(['message' => 'Cannot run — scraper in error state.', 'code' => 'SCRAPER_ERROR'], 409);
        return response()->json(['message' => "Scrape triggered for {$scraper['profileHandle']}.", 'id' => $id, 'status' => 'running']);
    }

    /** PATCH /mock-api/scraper/scrapers/{id}/status */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $scraper = collect(self::scrapers())->firstWhere('id', $id);
        if (!$scraper) return response()->json(['message' => 'Scraper not found.', 'code' => 'NOT_FOUND'], 404);
        $request->validate(['status' => ['required', 'in:Active,Paused']]);
        return response()->json(['message' => "Scraper {$request->input('status')}.", 'id' => $id, 'status' => $request->input('status')]);
    }

    /** DELETE /mock-api/scraper/scrapers/{id} */
    public function destroyScraper(string $id): JsonResponse
    {
        $scraper = collect(self::scrapers())->firstWhere('id', $id);
        if (!$scraper) return response()->json(['message' => 'Scraper not found.', 'code' => 'NOT_FOUND'], 404);
        if ($scraper['status'] === 'Active') return response()->json(['message' => 'Pause scraper before deleting.', 'code' => 'SCRAPER_ACTIVE'], 409);
        Log::info('Scraper API: scraper deleted', ['id' => $id]);
        return response()->json(['message' => "Scraper \"{$scraper['profileHandle']}\" deleted.", 'id' => $id]);
    }
}
