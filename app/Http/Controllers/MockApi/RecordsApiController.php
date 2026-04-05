<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX Records / Evidence Management Mock REST API.
 * CRUD, chain of custody, transcript, entity assignment.
 */
class RecordsApiController extends Controller
{
    private static function records(): array
    {
        return [
            ['id'=>'rec-01','title'=>'Horvat Port Meeting — Surveillance Video','type'=>'video','description'=>'Surveillance footage of Horvat at Port Terminal East.','fileUrl'=>'/storage/records/horvat_port_meeting.mp4','fileSize'=>'1.2 GB','mimeType'=>'video/mp4','assignedPersons'=>[['id'=>1,'name'=>'Marko Horvat','type'=>'person']],'assignedOrgs'=>[['id'=>101,'name'=>'Adriatic Maritime Holdings','type'=>'organization']],'transcript'=>'No speech — envelope exchange at 08:47.','createdBy'=>'Sgt. Matić','createdAt'=>'2026-03-27 09:30','updatedAt'=>'2026-03-27 09:30','custody'=>[['id'=>'c01','action'=>'created','user'=>'Sgt. Matić','timestamp'=>'2026-03-27 09:30','details'=>'Imported from CAM-07'],['id'=>'c02','action'=>'accessed','user'=>'Maj. Novak','timestamp'=>'2026-03-27 09:45','details'=>'Viewed for report']],'tags'=>['surveillance','port','meeting']],
            ['id'=>'rec-02','title'=>'Horvat Phone Intercept — Voice Recording','type'=>'audio','description'=>'Phone intercept discussing Thursday port arrangements.','fileUrl'=>'/storage/records/horvat_intercept_01.wav','fileSize'=>'48 MB','mimeType'=>'audio/wav','assignedPersons'=>[['id'=>1,'name'=>'Marko Horvat','type'=>'person']],'assignedOrgs'=>[],'transcript'=>'"...meeting at the port, Thursday... bring the documents..."','createdBy'=>'Sgt. Matić','createdAt'=>'2026-03-26 14:20','updatedAt'=>'2026-03-27 08:00','custody'=>[['id'=>'c03','action'=>'created','user'=>'Sgt. Matić','timestamp'=>'2026-03-26 14:20','details'=>'Phone intercept'],['id'=>'c04','action'=>'modified','user'=>'AI System','timestamp'=>'2026-03-26 14:35','details'=>'Faster-Whisper transcription'],['id'=>'c05','action'=>'accessed','user'=>'Lt. Perić','timestamp'=>'2026-03-27 08:00','details'=>'Keyword analysis']],'tags'=>['intercept','phone','voice']],
            ['id'=>'rec-03','title'=>'Mendoza Passport — Identity Document','type'=>'document','description'=>'Colombian passport CC-87234591.','fileUrl'=>'/storage/records/mendoza_passport.pdf','fileSize'=>'1.4 MB','mimeType'=>'application/pdf','assignedPersons'=>[['id'=>9,'name'=>'Carlos Mendoza','type'=>'person']],'assignedOrgs'=>[],'transcript'=>null,'createdBy'=>'Lt. Perić','createdAt'=>'2026-03-20 09:30','updatedAt'=>'2026-03-20 09:30','custody'=>[['id'=>'c06','action'=>'created','user'=>'Lt. Perić','timestamp'=>'2026-03-20 09:30','details'=>'Scanned from border control']],'tags'=>['passport','identity']],
            ['id'=>'rec-04','title'=>'Horvat Café Meeting — Photo Series','type'=>'photo','description'=>'12 surveillance photographs at Café Europa with Babić.','fileUrl'=>'/storage/records/horvat_cafe_photos.zip','fileSize'=>'48 MB','mimeType'=>'application/zip','assignedPersons'=>[['id'=>1,'name'=>'Marko Horvat','type'=>'person'],['id'=>12,'name'=>'Ivan Babić','type'=>'person']],'assignedOrgs'=>[],'transcript'=>null,'createdBy'=>'Sgt. Matić','createdAt'=>'2026-03-25 16:30','updatedAt'=>'2026-03-25 17:00','custody'=>[['id'=>'c07','action'=>'created','user'=>'Sgt. Matić','timestamp'=>'2026-03-25 16:30','details'=>'Nikon D850 from position Alpha'],['id'=>'c08','action'=>'modified','user'=>'Sgt. Matić','timestamp'=>'2026-03-25 17:00','details'=>'Added GPS metadata']],'tags'=>['surveillance','cafe','meeting']],
            ['id'=>'rec-05','title'=>'Al-Rashid Phone Extract — Digital Evidence','type'=>'digital','description'=>'Complete phone extraction: SMS, calls, contacts, calendar, location.','fileUrl'=>'/storage/records/alrashid_phone.xlsx','fileSize'=>'3.6 MB','mimeType'=>'application/vnd.openxmlformats','assignedPersons'=>[['id'=>3,'name'=>'Ahmed Al-Rashid','type'=>'person']],'assignedOrgs'=>[],'transcript'=>null,'createdBy'=>'Lt. Perić','createdAt'=>'2026-03-24 14:00','updatedAt'=>'2026-03-25 09:00','custody'=>[['id'=>'c09','action'=>'created','user'=>'Lt. Perić','timestamp'=>'2026-03-24 14:00','details'=>'Cellebrite UFED extraction'],['id'=>'c10','action'=>'accessed','user'=>'Maj. Novak','timestamp'=>'2026-03-25 09:00','details'=>'Cross-referenced contacts']],'tags'=>['phone','extraction','cellebrite']],
            ['id'=>'rec-06','title'=>'Adriatic Maritime — Corporate Registration','type'=>'document','description'=>'Corporate records including shareholders and beneficial ownership.','fileUrl'=>'/storage/records/adriatic_corp.pdf','fileSize'=>'12 MB','mimeType'=>'application/pdf','assignedPersons'=>[['id'=>1,'name'=>'Marko Horvat','type'=>'person']],'assignedOrgs'=>[['id'=>101,'name'=>'Adriatic Maritime Holdings','type'=>'organization']],'transcript'=>null,'createdBy'=>'Maj. Novak','createdAt'=>'2026-03-23 09:00','updatedAt'=>'2026-03-23 09:00','custody'=>[['id'=>'c11','action'=>'created','user'=>'Maj. Novak','timestamp'=>'2026-03-23 09:00','details'=>'National Business Registry']],'tags'=>['corporate','registry']],
            ['id'=>'rec-07','title'=>'Hassan Arabic Intercept — Text Document','type'=>'document','description'=>'Arabic text communications. Pending translation.','fileUrl'=>'/storage/records/hassan_intercept.txt','fileSize'=>'24 KB','mimeType'=>'text/plain','assignedPersons'=>[['id'=>7,'name'=>'Youssef Hassan','type'=>'person']],'assignedOrgs'=>[],'transcript'=>'Arabic text — flagged keywords: shipping, Thursday, port, payment.','createdBy'=>'Lt. Perić','createdAt'=>'2026-03-27 08:10','updatedAt'=>'2026-03-27 08:10','custody'=>[['id'=>'c12','action'=>'created','user'=>'Lt. Perić','timestamp'=>'2026-03-27 08:10','details'=>'Encrypted messaging intercept']],'tags'=>['arabic','intercept','translation-pending']],
            ['id'=>'rec-08','title'=>'Babić Warehouse — Night Surveillance','type'=>'video','description'=>'Night vision surveillance near warehouse. Loitering alert at 03:15.','fileUrl'=>'/storage/records/babic_warehouse.mp4','fileSize'=>'540 MB','mimeType'=>'video/mp4','assignedPersons'=>[['id'=>12,'name'=>'Ivan Babić','type'=>'person']],'assignedOrgs'=>[],'transcript'=>null,'createdBy'=>'CAM-12','createdAt'=>'2026-03-26 03:30','updatedAt'=>'2026-03-26 03:30','custody'=>[['id'=>'c13','action'=>'created','user'=>'System','timestamp'=>'2026-03-26 03:30','details'=>'Loitering detection auto-capture']],'tags'=>['night-vision','warehouse','loitering']],
            ['id'=>'rec-09','title'=>'Seized USB Drive — Physical Evidence','type'=>'physical','description'=>'Kingston 32GB USB from Mendoza vehicle. Awaiting forensic imaging.','fileUrl'=>null,'fileSize'=>null,'mimeType'=>null,'assignedPersons'=>[['id'=>9,'name'=>'Carlos Mendoza','type'=>'person']],'assignedOrgs'=>[['id'=>102,'name'=>'Balkan Transit Group','type'=>'organization']],'transcript'=>null,'createdBy'=>'Cpt. Horvat','createdAt'=>'2026-03-22 18:45','updatedAt'=>'2026-03-24 10:00','custody'=>[['id'=>'c14','action'=>'created','user'=>'Cpt. Horvat','timestamp'=>'2026-03-22 18:45','details'=>'Seized from vehicle ZG-4421-MN'],['id'=>'c15','action'=>'transferred','user'=>'Cpt. Horvat','timestamp'=>'2026-03-23 08:00','details'=>'To Digital Forensics Lab, bag #DF-2026-0342'],['id'=>'c16','action'=>'accessed','user'=>'Digital Forensics','timestamp'=>'2026-03-24 10:00','details'=>'FTK Imager forensic imaging']],'tags'=>['usb','seized','physical','forensics']],
            ['id'=>'rec-10','title'=>'Meridian Financial Transactions','type'=>'digital','description'=>'23 suspicious transactions totaling €847,000 over 90 days.','fileUrl'=>'/storage/records/meridian_transactions.xlsx','fileSize'=>'5.4 MB','mimeType'=>'application/vnd.openxmlformats','assignedPersons'=>[],'assignedOrgs'=>[['id'=>103,'name'=>'Meridian Finance Ltd','type'=>'organization']],'transcript'=>null,'createdBy'=>'Maj. Novak','createdAt'=>'2026-03-21 16:00','updatedAt'=>'2026-03-21 16:30','custody'=>[['id'=>'c17','action'=>'created','user'=>'Maj. Novak','timestamp'=>'2026-03-21 16:00','details'=>'Bank Transaction Monitor (AML)'],['id'=>'c18','action'=>'exported','user'=>'Maj. Novak','timestamp'=>'2026-03-21 16:30','details'=>'Exported to report']],'tags'=>['financial','AML','transactions']],
            ['id'=>'rec-11','title'=>'Mendoza Vehicle Follow — Dashcam','type'=>'video','description'=>'Dashcam from undercover vehicle following Mendoza, 22 min.','fileUrl'=>'/storage/records/mendoza_follow.mp4','fileSize'=>'680 MB','mimeType'=>'video/mp4','assignedPersons'=>[['id'=>9,'name'=>'Carlos Mendoza','type'=>'person']],'assignedOrgs'=>[],'transcript'=>null,'createdBy'=>'Cpt. Horvat','createdAt'=>'2026-03-26 22:15','updatedAt'=>'2026-03-26 22:15','custody'=>[['id'=>'c19','action'=>'created','user'=>'Cpt. Horvat','timestamp'=>'2026-03-26 22:15','details'=>'Dashcam from unit Bravo-3']],'tags'=>['dashcam','follow','undercover']],
            ['id'=>'rec-12','title'=>'Petrova Social Media Export','type'=>'digital','description'=>'Instagram and Telegram posts, 90-day collection.','fileUrl'=>'/storage/records/petrova_social.pdf','fileSize'=>'8.2 MB','mimeType'=>'application/pdf','assignedPersons'=>[['id'=>2,'name'=>'Elena Petrova','type'=>'person']],'assignedOrgs'=>[],'transcript'=>null,'createdBy'=>'System','createdAt'=>'2026-03-20 12:00','updatedAt'=>'2026-03-20 12:00','custody'=>[['id'=>'c20','action'=>'created','user'=>'Social Scraper','timestamp'=>'2026-03-20 12:00','details'=>'Auto-generated from scraper']],'tags'=>['social','scraper']],
        ];
    }

    /** GET /mock-api/records */
    public function index(Request $request): JsonResponse
    {
        $data = self::records();
        $type = $request->query('type', '');
        $search = strtolower($request->query('search', ''));
        $personId = $request->query('person_id', '');
        $orgId = $request->query('org_id', '');

        if ($type) $data = array_values(array_filter($data, fn($r) => $r['type'] === $type));
        if ($personId) $data = array_values(array_filter($data, fn($r) => collect($r['assignedPersons'])->contains('id', (int)$personId)));
        if ($orgId) $data = array_values(array_filter($data, fn($r) => collect($r['assignedOrgs'])->contains('id', (int)$orgId)));
        if ($search) $data = array_values(array_filter($data, fn($r) => str_contains(strtolower($r['title'].' '.$r['description'].' '.implode(' ',$r['tags']).' '.($r['transcript'] ?? '')), $search)));

        usort($data, fn($a, $b) => strcmp($b['createdAt'], $a['createdAt']));

        $typeCounts = [];
        foreach (self::records() as $r) $typeCounts[$r['type']] = ($typeCounts[$r['type']] ?? 0) + 1;

        return response()->json(['data' => $data, 'meta' => ['total' => count($data)], 'type_counts' => $typeCounts]);
    }

    /** GET /mock-api/records/{id} */
    public function show(string $id): JsonResponse
    {
        $record = collect(self::records())->firstWhere('id', $id);
        if (!$record) return response()->json(['message' => 'Record not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $record]);
    }

    /** POST /mock-api/records */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'min:5', 'max:200'],
            'type' => ['required', 'in:document,photo,video,audio,digital,physical'],
            'description' => ['required', 'string', 'min:10', 'max:2000'],
            'person_ids' => ['nullable', 'array'],
            'person_ids.*' => ['integer'],
            'org_ids' => ['nullable', 'array'],
            'org_ids.*' => ['integer'],
        ]);
        Log::info('Records API: created', ['title' => $request->input('title')]);
        usleep(500_000);
        $id = 'rec-' . Str::random(8);
        $now = now()->toDateTimeString();
        return response()->json(['message' => 'Record created.', 'data' => [
            'id' => $id, 'title' => $request->input('title'), 'type' => $request->input('type'),
            'description' => $request->input('description'), 'fileUrl' => null, 'fileSize' => null, 'mimeType' => null,
            'assignedPersons' => [], 'assignedOrgs' => [], 'transcript' => null,
            'createdBy' => 'Current User', 'createdAt' => $now, 'updatedAt' => $now,
            'custody' => [['id' => 'c-' . Str::random(6), 'action' => 'created', 'user' => 'Current User', 'timestamp' => $now, 'details' => 'Record created']],
            'tags' => [],
        ]], 201);
    }

    /** PUT /mock-api/records/{id} */
    public function update(Request $request, string $id): JsonResponse
    {
        $record = collect(self::records())->firstWhere('id', $id);
        if (!$record) return response()->json(['message' => 'Record not found.', 'code' => 'NOT_FOUND'], 404);
        $request->validate([
            'title' => ['sometimes', 'string', 'min:5', 'max:200'],
            'type' => ['sometimes', 'in:document,photo,video,audio,digital,physical'],
            'description' => ['sometimes', 'string', 'min:10', 'max:2000'],
        ]);
        Log::info('Records API: updated', ['id' => $id]);
        usleep(400_000);
        $now = now()->toDateTimeString();
        $updated = array_merge($record, array_filter($request->only(['title', 'type', 'description']), fn($v) => $v !== null));
        $updated['updatedAt'] = $now;
        $updated['custody'][] = ['id' => 'c-' . Str::random(6), 'action' => 'modified', 'user' => 'Current User', 'timestamp' => $now, 'details' => 'Record updated'];
        return response()->json(['message' => 'Record updated.', 'data' => $updated]);
    }

    /** DELETE /mock-api/records/{id} */
    public function destroy(string $id): JsonResponse
    {
        $record = collect(self::records())->firstWhere('id', $id);
        if (!$record) return response()->json(['message' => 'Record not found.', 'code' => 'NOT_FOUND'], 404);
        Log::info('Records API: deleted', ['id' => $id, 'title' => $record['title']]);
        return response()->json(['message' => "Record \"{$record['title']}\" deleted.", 'id' => $id]);
    }

    /** GET /mock-api/records/{id}/custody */
    public function custody(string $id): JsonResponse
    {
        $record = collect(self::records())->firstWhere('id', $id);
        if (!$record) return response()->json(['message' => 'Record not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $record['custody'], 'record_id' => $id, 'record_title' => $record['title']]);
    }

    /** GET /mock-api/records/entities */
    public function entities(): JsonResponse
    {
        return response()->json([
            'persons' => [['id'=>1,'name'=>'Marko Horvat'],['id'=>9,'name'=>'Carlos Mendoza'],['id'=>12,'name'=>'Ivan Babić'],['id'=>7,'name'=>'Youssef Hassan'],['id'=>3,'name'=>'Ahmed Al-Rashid'],['id'=>2,'name'=>'Elena Petrova']],
            'organizations' => [['id'=>101,'name'=>'Adriatic Maritime Holdings'],['id'=>102,'name'=>'Balkan Transit Group'],['id'=>103,'name'=>'Meridian Finance Ltd']],
        ]);
    }
}
