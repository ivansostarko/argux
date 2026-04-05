<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX Web Scraper Mock REST API.
 * News portals, court records, sanctions lists, dark web monitors.
 */
class WebScraperApiController extends Controller
{
    private static function sources(): array
    {
        return [
            ['id'=>'ws01','name'=>'Index.hr','url'=>'https://index.hr','category'=>'News Portal','country'=>'Croatia','countryFlag'=>'🇭🇷','language'=>'Croatian','status'=>'Active','health'=>98,'schedule'=>'Every 15min','lastSync'=>'2026-03-27 09:25','articleCount'=>4820,'newArticles'=>12,'cssSelector'=>'article.news-item','urlPattern'=>'/vijesti/*','entityTags'=>['Horvat','Babić','Alpha Security'],'keywords'=>['port','smuggling','security'],'operationCode'=>'HAWK'],
            ['id'=>'ws02','name'=>'Jutarnji List','url'=>'https://jutarnji.hr','category'=>'News Portal','country'=>'Croatia','countryFlag'=>'🇭🇷','language'=>'Croatian','status'=>'Active','health'=>95,'schedule'=>'Every 15min','lastSync'=>'2026-03-27 09:20','articleCount'=>3240,'newArticles'=>8,'cssSelector'=>'div.article-content','urlPattern'=>'/naslov/*','entityTags'=>['Zagreb','Maritime'],'keywords'=>['crime','court','maritime'],'operationCode'=>''],
            ['id'=>'ws03','name'=>'EU Sanctions CFSP','url'=>'https://data.europa.eu/sanctions','category'=>'Sanctions List','country'=>'EU','countryFlag'=>'🇪🇺','language'=>'English','status'=>'Active','health'=>100,'schedule'=>'Every 1h','lastSync'=>'2026-03-27 08:02','articleCount'=>2847,'newArticles'=>3,'cssSelector'=>'','urlPattern'=>'/api/sanctions/*','entityTags'=>['Al-Rashid','Hassan'],'keywords'=>['sanctions','CFSP','restricted'],'operationCode'=>'GLACIER'],
            ['id'=>'ws04','name'=>'Croatian Court Portal','url'=>'https://sudska-praksa.hr','category'=>'Court Records','country'=>'Croatia','countryFlag'=>'🇭🇷','language'=>'Croatian','status'=>'Active','health'=>92,'schedule'=>'Every 6h','lastSync'=>'2026-03-27 06:00','articleCount'=>890,'newArticles'=>2,'cssSelector'=>'div.case-detail','urlPattern'=>'/predmet/*','entityTags'=>['Horvat','Mendoza'],'keywords'=>['smuggling','fraud','money laundering'],'operationCode'=>'HAWK'],
            ['id'=>'ws05','name'=>'Dark Web — Tor Markets','url'=>'onion://classified','category'=>'Dark Web','country'=>'Global','countryFlag'=>'🌍','language'=>'Multi','status'=>'Error','health'=>0,'schedule'=>'Every 1h','lastSync'=>'2026-03-26 18:00','articleCount'=>1240,'newArticles'=>0,'cssSelector'=>'','urlPattern'=>'','entityTags'=>['weapons','drugs','documents'],'keywords'=>['Croatia','Adriatic','shipping'],'operationCode'=>''],
            ['id'=>'ws06','name'=>'Official Gazette (NN)','url'=>'https://narodne-novine.nn.hr','category'=>'Government Gazette','country'=>'Croatia','countryFlag'=>'🇭🇷','language'=>'Croatian','status'=>'Active','health'=>99,'schedule'=>'Every 24h','lastSync'=>'2026-03-27 01:00','articleCount'=>12400,'newArticles'=>0,'cssSelector'=>'div.gazette-entry','urlPattern'=>'/clanci/*','entityTags'=>[],'keywords'=>['regulation','amendment','decree'],'operationCode'=>''],
            ['id'=>'ws07','name'=>'OpenCorporates','url'=>'https://opencorporates.com','category'=>'Corporate Registry','country'=>'Global','countryFlag'=>'🌍','language'=>'English','status'=>'Active','health'=>95,'schedule'=>'Every 24h','lastSync'=>'2026-03-27 03:00','articleCount'=>342,'newArticles'=>5,'cssSelector'=>'','urlPattern'=>'/companies/*','entityTags'=>['Alpha Security','Meridian','Rashid Holdings'],'keywords'=>['director','shareholder','dissolution'],'operationCode'=>'GLACIER'],
            ['id'=>'ws08','name'=>'MarineTraffic AIS','url'=>'https://marinetraffic.com','category'=>'Maritime & Aviation','country'=>'Global','countryFlag'=>'🌍','language'=>'English','status'=>'Active','health'=>93,'schedule'=>'Every 30min','lastSync'=>'2026-03-27 09:00','articleCount'=>1580,'newArticles'=>14,'cssSelector'=>'','urlPattern'=>'/ais/details/*','entityTags'=>['Adriatic Maritime','vessel'],'keywords'=>['port','dock','cargo','Rijeka'],'operationCode'=>'HAWK'],
            ['id'=>'ws09','name'=>'FlightRadar24','url'=>'https://flightradar24.com','category'=>'Maritime & Aviation','country'=>'Global','countryFlag'=>'🌍','language'=>'English','status'=>'Paused','health'=>0,'schedule'=>'Manual','lastSync'=>'2026-03-20 12:00','articleCount'=>245,'newArticles'=>0,'cssSelector'=>'','urlPattern'=>'/data/flights/*','entityTags'=>['Al-Rashid','Mendoza'],'keywords'=>['private jet','charter','Zagreb'],'operationCode'=>'GLACIER'],
            ['id'=>'ws10','name'=>'Europol Public Alerts','url'=>'https://europol.europa.eu/publications','category'=>'News Portal','country'=>'EU','countryFlag'=>'🇪🇺','language'=>'English','status'=>'Active','health'=>97,'schedule'=>'Every 1h','lastSync'=>'2026-03-27 08:30','articleCount'=>567,'newArticles'=>1,'cssSelector'=>'article.publication','urlPattern'=>'/publications/*','entityTags'=>['organized crime','trafficking'],'keywords'=>['Adriatic','Balkans','maritime'],'operationCode'=>''],
            ['id'=>'ws11','name'=>'USDT Academic Papers','url'=>'https://scholar.google.com','category'=>'Academic & Research','country'=>'Global','countryFlag'=>'🌍','language'=>'English','status'=>'Scheduled','health'=>0,'schedule'=>'Every 7d','lastSync'=>'2026-03-20 00:00','articleCount'=>89,'newArticles'=>0,'cssSelector'=>'','urlPattern'=>'/scholar?q=*','entityTags'=>[],'keywords'=>['trade based money laundering','maritime smuggling'],'operationCode'=>''],
            ['id'=>'ws12','name'=>'Lloyd\'s List Maritime','url'=>'https://lloydslist.com','category'=>'Maritime & Aviation','country'=>'UK','countryFlag'=>'🇬🇧','language'=>'English','status'=>'Active','health'=>91,'schedule'=>'Every 6h','lastSync'=>'2026-03-27 06:00','articleCount'=>423,'newArticles'=>3,'cssSelector'=>'div.article-body','urlPattern'=>'/maritime/*','entityTags'=>['Adriatic Shipping'],'keywords'=>['sanctions evasion','dark fleet','AIS manipulation'],'operationCode'=>'HAWK'],
            ['id'=>'ws13','name'=>'Transparency Int\'l','url'=>'https://transparency.org','category'=>'Sanctions List','country'=>'Global','countryFlag'=>'🌍','language'=>'English','status'=>'Active','health'=>96,'schedule'=>'Every 24h','lastSync'=>'2026-03-27 02:00','articleCount'=>234,'newArticles'=>0,'cssSelector'=>'article.post','urlPattern'=>'/cpi/*','entityTags'=>['corruption','PEP'],'keywords'=>['Croatia','corruption','politically exposed'],'operationCode'=>''],
            ['id'=>'ws14','name'=>'Dark Web — Forums','url'=>'onion://classified-2','category'=>'Dark Web','country'=>'Global','countryFlag'=>'🌍','language'=>'Multi','status'=>'Active','health'=>78,'schedule'=>'Every 2h','lastSync'=>'2026-03-27 08:00','articleCount'=>567,'newArticles'=>4,'cssSelector'=>'','urlPattern'=>'','entityTags'=>['forged docs','weapons'],'keywords'=>['passport','Croatian','Schengen'],'operationCode'=>''],
            ['id'=>'ws15','name'=>'OCCRP Investigations','url'=>'https://occrp.org','category'=>'News Portal','country'=>'Global','countryFlag'=>'🌍','language'=>'English','status'=>'Active','health'=>94,'schedule'=>'Every 12h','lastSync'=>'2026-03-27 06:00','articleCount'=>178,'newArticles'=>1,'cssSelector'=>'article.investigation','urlPattern'=>'/investigations/*','entityTags'=>['organized crime','shell companies'],'keywords'=>['Balkans','money laundering','offshore'],'operationCode'=>'GLACIER'],
        ];
    }

    private static function articles(): array
    {
        return [
            ['id'=>'wa01','sourceId'=>'ws01','sourceName'=>'Index.hr','sourceCategory'=>'News Portal','title'=>'Pojačane sigurnosne mjere u Luci Rijeka','excerpt'=>'Lučka uprava najavila pojačane sigurnosne kontrole nakon serije incidenata...','url'=>'https://index.hr/vijesti/clanak/luka-rijeka-sigurnost/2468135','contentType'=>'article','relevance'=>'Critical','personIds'=>[1],'personNames'=>['Marko Horvat'],'orgIds'=>[6],'orgNames'=>['Adriatic Shipping'],'country'=>'Croatia','language'=>'Croatian','publishedAt'=>'2026-03-27 07:30','scrapedAt'=>'2026-03-27 07:32','timeAgo'=>'2h ago','hasMedia'=>true,'mediaType'=>'Photo','aiFlagged'=>true,'aiReason'=>'Mentions entity Horvat + port security keywords','tags'=>['port','security','rijeka','HAWK']],
            ['id'=>'wa02','sourceId'=>'ws03','sourceName'=>'EU Sanctions CFSP','sourceCategory'=>'Sanctions List','title'=>'Council Decision (CFSP) 2026/487 — New listings','excerpt'=>'12 individuals and 3 entities added to EU restrictive measures...','url'=>'https://data.europa.eu/sanctions/2026-487','contentType'=>'sanctions_entry','relevance'=>'Critical','personIds'=>[],'personNames'=>[],'orgIds'=>[],'orgNames'=>[],'country'=>'EU','language'=>'English','publishedAt'=>'2026-03-27 08:00','scrapedAt'=>'2026-03-27 08:02','timeAgo'=>'1h ago','hasMedia'=>false,'mediaType'=>'','aiFlagged'=>true,'aiReason'=>'New CFSP sanctions — cross-reference with ARGUX entities required','tags'=>['sanctions','CFSP','new-listings']],
            ['id'=>'wa03','sourceId'=>'ws04','sourceName'=>'Croatian Court Portal','sourceCategory'=>'Court Records','title'=>'Predmet Kž-287/2026 — Pranje novca','excerpt'=>'Županijski sud u Zagrebu — optužnica za pranje novca i financijski kriminalitet...','url'=>'https://sudska-praksa.hr/predmet/Kz-287-2026','contentType'=>'court_filing','relevance'=>'High','personIds'=>[1,9],'personNames'=>['Marko Horvat','Carlos Mendoza'],'orgIds'=>[1],'orgNames'=>['Alpha Security Group'],'country'=>'Croatia','language'=>'Croatian','publishedAt'=>'2026-03-26 14:00','scrapedAt'=>'2026-03-27 06:00','timeAgo'=>'19h ago','hasMedia'=>false,'mediaType'=>'','aiFlagged'=>true,'aiReason'=>'Court filing mentions Horvat and Mendoza — money laundering charges','tags'=>['court','money-laundering','HAWK']],
            ['id'=>'wa04','sourceId'=>'ws07','sourceName'=>'OpenCorporates','sourceCategory'=>'Corporate Registry','title'=>'Adriatic Maritime Holdings — Director Change','excerpt'=>'Filing: change of director registered. New director: offshore entity from Cyprus...','url'=>'https://opencorporates.com/companies/hr/080912345','contentType'=>'corporate_filing','relevance'=>'High','personIds'=>[3],'personNames'=>['Ahmed Al-Rashid'],'orgIds'=>[2],'orgNames'=>['Rashid Holdings'],'country'=>'Croatia','language'=>'English','publishedAt'=>'2026-03-26 10:00','scrapedAt'=>'2026-03-27 03:00','timeAgo'=>'6h ago','hasMedia'=>false,'mediaType'=>'','aiFlagged'=>true,'aiReason'=>'Director change to offshore entity — shell company indicator','tags'=>['corporate','director-change','offshore','GLACIER']],
            ['id'=>'wa05','sourceId'=>'ws08','sourceName'=>'MarineTraffic AIS','sourceCategory'=>'Maritime & Aviation','title'=>'Vessel ADRIATIC STAR — AIS Dark Period','excerpt'=>'Vessel ADRIATIC STAR (IMO 9876543) went dark for 14 hours in international waters...','url'=>'https://marinetraffic.com/ais/details/ships/9876543','contentType'=>'vessel_record','relevance'=>'Critical','personIds'=>[1],'personNames'=>['Marko Horvat'],'orgIds'=>[6],'orgNames'=>['Adriatic Shipping'],'country'=>'Global','language'=>'English','publishedAt'=>'2026-03-26 22:00','scrapedAt'=>'2026-03-27 09:00','timeAgo'=>'30m ago','hasMedia'=>true,'mediaType'=>'Map','aiFlagged'=>true,'aiReason'=>'AIS manipulation detected — vessel dark period matches smuggling pattern','tags'=>['AIS','dark-period','vessel','HAWK']],
            ['id'=>'wa06','sourceId'=>'ws14','sourceName'=>'Dark Web — Forums','sourceCategory'=>'Dark Web','title'=>'Forged Croatian passports — batch available','excerpt'=>'Forum post offering batch of 50 Croatian passports. Schengen travel docs...','url'=>'onion://classified','contentType'=>'dark_web_post','relevance'=>'High','personIds'=>[],'personNames'=>[],'orgIds'=>[],'orgNames'=>[],'country'=>'Global','language'=>'English','publishedAt'=>'2026-03-27 06:15','scrapedAt'=>'2026-03-27 08:00','timeAgo'=>'1h ago','hasMedia'=>false,'mediaType'=>'','aiFlagged'=>true,'aiReason'=>'Croatian passport forgery — national security threat','tags'=>['dark-web','passport','forgery']],
            ['id'=>'wa07','sourceId'=>'ws12','sourceName'=>"Lloyd's List Maritime",'sourceCategory'=>'Maritime & Aviation','title'=>'Adriatic dark fleet activity rises 40%','excerpt'=>'Analysis shows significant increase in vessels disabling AIS transponders in Adriatic...','url'=>'https://lloydslist.com/maritime/dark-fleet-adriatic','contentType'=>'article','relevance'=>'High','personIds'=>[],'personNames'=>[],'orgIds'=>[6],'orgNames'=>['Adriatic Shipping'],'country'=>'Global','language'=>'English','publishedAt'=>'2026-03-26 12:00','scrapedAt'=>'2026-03-27 06:00','timeAgo'=>'3h ago','hasMedia'=>true,'mediaType'=>'Chart','aiFlagged'=>false,'aiReason'=>'','tags'=>['dark-fleet','AIS','Adriatic','HAWK']],
            ['id'=>'wa08','sourceId'=>'ws15','sourceName'=>'OCCRP Investigations','sourceCategory'=>'News Portal','title'=>'Shell Companies in the Balkans — Money Trails','excerpt'=>'Investigation reveals network of shell companies used for trade-based money laundering...','url'=>'https://occrp.org/investigations/balkans-money-trails','contentType'=>'article','relevance'=>'Critical','personIds'=>[3],'personNames'=>['Ahmed Al-Rashid'],'orgIds'=>[2,8],'orgNames'=>['Rashid Holdings','Meridian Finance'],'country'=>'Global','language'=>'English','publishedAt'=>'2026-03-25 10:00','scrapedAt'=>'2026-03-27 06:00','timeAgo'=>'1d ago','hasMedia'=>true,'mediaType'=>'Infographic','aiFlagged'=>true,'aiReason'=>'Shell company network matches ARGUX investigation targets','tags'=>['OCCRP','shell-companies','money-laundering','GLACIER']],
            ['id'=>'wa09','sourceId'=>'ws06','sourceName'=>'Official Gazette (NN)','sourceCategory'=>'Government Gazette','title'=>'Zakon o izmjenama Kaznenog zakona — NN 34/2026','excerpt'=>'Amendments to Criminal Code: enhanced penalties for organized crime...','url'=>'https://narodne-novine.nn.hr/clanci/2026_03_34_567.html','contentType'=>'gazette_notice','relevance'=>'Medium','personIds'=>[],'personNames'=>[],'orgIds'=>[],'orgNames'=>[],'country'=>'Croatia','language'=>'Croatian','publishedAt'=>'2026-03-20 00:00','scrapedAt'=>'2026-03-27 01:00','timeAgo'=>'7d ago','hasMedia'=>false,'mediaType'=>'','aiFlagged'=>false,'aiReason'=>'','tags'=>['gazette','criminal-code','legislation']],
            ['id'=>'wa10','sourceId'=>'ws10','sourceName'=>'Europol Public Alerts','sourceCategory'=>'News Portal','title'=>'EMPACT — Maritime smuggling threat assessment','excerpt'=>'Europol threat assessment highlights Adriatic corridor for maritime smuggling operations...','url'=>'https://europol.europa.eu/publications/empact-maritime-2026','contentType'=>'article','relevance'=>'High','personIds'=>[],'personNames'=>[],'orgIds'=>[],'orgNames'=>[],'country'=>'EU','language'=>'English','publishedAt'=>'2026-03-24 09:00','scrapedAt'=>'2026-03-27 08:30','timeAgo'=>'1h ago','hasMedia'=>true,'mediaType'=>'PDF','aiFlagged'=>true,'aiReason'=>'Adriatic corridor matches HAWK operation area','tags'=>['EMPACT','europol','maritime','Adriatic']],
            ['id'=>'wa11','sourceId'=>'ws01','sourceName'=>'Index.hr','sourceCategory'=>'News Portal','title'=>'Uhićenja u Splitu — krijumčarska mreža','excerpt'=>'Policija uhitila pet osoba u okviru akcije protiv krijumčarenja...','url'=>'https://index.hr/vijesti/split-uhicenja/2468200','contentType'=>'article','relevance'=>'Medium','personIds'=>[],'personNames'=>[],'orgIds'=>[],'orgNames'=>[],'country'=>'Croatia','language'=>'Croatian','publishedAt'=>'2026-03-26 16:00','scrapedAt'=>'2026-03-27 09:25','timeAgo'=>'17h ago','hasMedia'=>true,'mediaType'=>'Photo','aiFlagged'=>false,'aiReason'=>'','tags'=>['arrest','Split','smuggling']],
            ['id'=>'wa12','sourceId'=>'ws13','sourceName'=>'Transparency Int\'l','sourceCategory'=>'Sanctions List','title'=>'Croatia CPI 2025 — Score decline','excerpt'=>'Croatia Corruption Perceptions Index declined to 47/100 in 2025...','url'=>'https://transparency.org/cpi/2025/croatia','contentType'=>'research_paper','relevance'=>'Low','personIds'=>[],'personNames'=>[],'orgIds'=>[],'orgNames'=>[],'country'=>'Croatia','language'=>'English','publishedAt'=>'2026-01-15 00:00','scrapedAt'=>'2026-03-27 02:00','timeAgo'=>'2mo ago','hasMedia'=>true,'mediaType'=>'Chart','aiFlagged'=>false,'aiReason'=>'','tags'=>['CPI','corruption','transparency']],
        ];
    }

    /** GET /mock-api/web-scraper/sources */
    public function sources(Request $request): JsonResponse
    {
        $data = self::sources();
        $cat = $request->query('category', '');
        $status = $request->query('status', '');
        $search = strtolower($request->query('search', ''));

        if ($cat && $cat !== 'all') $data = array_values(array_filter($data, fn($s) => $s['category'] === $cat));
        if ($status && $status !== 'all') $data = array_values(array_filter($data, fn($s) => $s['status'] === $status));
        if ($search) $data = array_values(array_filter($data, fn($s) => str_contains(strtolower($s['name'].' '.$s['url'].' '.implode(' ',$s['keywords'])), $search)));

        return response()->json(['data' => $data, 'meta' => ['total' => count($data)]]);
    }

    /** GET /mock-api/web-scraper/articles */
    public function articles(Request $request): JsonResponse
    {
        $data = self::articles();
        $cat = $request->query('category', '');
        $rel = $request->query('relevance', '');
        $flagged = $request->query('flagged', '');
        $personId = $request->query('person_id', '');
        $search = strtolower($request->query('search', ''));

        if ($cat && $cat !== 'all') $data = array_values(array_filter($data, fn($a) => $a['sourceCategory'] === $cat));
        if ($rel && $rel !== 'all') $data = array_values(array_filter($data, fn($a) => $a['relevance'] === $rel));
        if ($flagged === '1') $data = array_values(array_filter($data, fn($a) => $a['aiFlagged']));
        if ($personId) $data = array_values(array_filter($data, fn($a) => in_array((int)$personId, $a['personIds'])));
        if ($search) $data = array_values(array_filter($data, fn($a) => str_contains(strtolower($a['title'].' '.$a['excerpt'].' '.implode(' ',$a['tags']).' '.implode(' ',$a['personNames'])), $search)));

        return response()->json(['data' => $data, 'meta' => ['total' => count($data)]]);
    }

    /** GET /mock-api/web-scraper/articles/{id} */
    public function showArticle(string $id): JsonResponse
    {
        $article = collect(self::articles())->firstWhere('id', $id);
        if (!$article) return response()->json(['message' => 'Article not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $article]);
    }

    /** POST /mock-api/web-scraper/sources */
    public function storeSource(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:200'],
            'url' => ['required', 'string'],
            'category' => ['required', 'string'],
            'schedule' => ['required', 'string'],
        ]);
        Log::info('WebScraper API: source created', ['name' => $request->input('name')]);
        usleep(400_000);
        return response()->json(['message' => 'Scraper source created.', 'data' => [
            'id' => 'ws-' . Str::random(6), 'name' => $request->input('name'),
            'url' => $request->input('url'), 'category' => $request->input('category'),
            'status' => 'Scheduled', 'health' => 0, 'articleCount' => 0,
        ]], 201);
    }

    /** POST /mock-api/web-scraper/sources/{id}/sync */
    public function syncSource(string $id): JsonResponse
    {
        $src = collect(self::sources())->firstWhere('id', $id);
        if (!$src) return response()->json(['message' => 'Source not found.', 'code' => 'NOT_FOUND'], 404);
        if ($src['status'] === 'Error') return response()->json(['message' => 'Cannot sync — source in error state.', 'code' => 'SOURCE_ERROR'], 409);
        if ($src['status'] === 'Paused') return response()->json(['message' => 'Cannot sync — source is paused.', 'code' => 'SOURCE_PAUSED'], 409);
        return response()->json(['message' => "Sync triggered for {$src['name']}.", 'id' => $id, 'status' => 'syncing']);
    }

    /** PATCH /mock-api/web-scraper/sources/{id}/status */
    public function updateSourceStatus(Request $request, string $id): JsonResponse
    {
        $src = collect(self::sources())->firstWhere('id', $id);
        if (!$src) return response()->json(['message' => 'Source not found.', 'code' => 'NOT_FOUND'], 404);
        $request->validate(['status' => ['required', 'in:Active,Paused,Scheduled']]);
        return response()->json(['message' => "Source status changed to {$request->input('status')}.", 'id' => $id, 'status' => $request->input('status')]);
    }

    /** DELETE /mock-api/web-scraper/sources/{id} */
    public function destroySource(string $id): JsonResponse
    {
        $src = collect(self::sources())->firstWhere('id', $id);
        if (!$src) return response()->json(['message' => 'Source not found.', 'code' => 'NOT_FOUND'], 404);
        Log::info('WebScraper API: source deleted', ['id' => $id]);
        return response()->json(['message' => "Source \"{$src['name']}\" deleted.", 'id' => $id]);
    }
}
