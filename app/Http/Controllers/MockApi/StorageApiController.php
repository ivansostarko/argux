<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX Storage Browser Mock REST API.
 * Split-panel file manager: entity tree, file list, upload, download, delete.
 */
class StorageApiController extends Controller
{
    private static function entities(): array
    {
        return [
            ['id'=>1,'name'=>'Marko Horvat','type'=>'person','fileCount'=>4,'totalSize'=>'1.3 GB'],
            ['id'=>9,'name'=>'Carlos Mendoza','type'=>'person','fileCount'=>3,'totalSize'=>'764 MB'],
            ['id'=>12,'name'=>'Ivan Babić','type'=>'person','fileCount'=>2,'totalSize'=>'568 MB'],
            ['id'=>7,'name'=>'Youssef Hassan','type'=>'person','fileCount'=>2,'totalSize'=>'944 MB'],
            ['id'=>3,'name'=>'Ahmed Al-Rashid','type'=>'person','fileCount'=>1,'totalSize'=>'3.6 MB'],
            ['id'=>2,'name'=>'Elena Petrova','type'=>'person','fileCount'=>1,'totalSize'=>'8.2 MB'],
            ['id'=>101,'name'=>'Adriatic Maritime Holdings','type'=>'organization','fileCount'=>2,'totalSize'=>'2.1 GB'],
            ['id'=>102,'name'=>'Balkan Transit Group','type'=>'organization','fileCount'=>1,'totalSize'=>'5.4 MB'],
        ];
    }

    private static function files(): array
    {
        return [
            ['id'=>'f01','name'=>'horvat_port_cam07.mp4','fileType'=>'video','size'=>'1.2 GB','sizeBytes'=>1288490188,'entityId'=>1,'entityType'=>'person','entityName'=>'Marko Horvat','mimeType'=>'video/mp4','uploadedBy'=>'CAM-07','uploadedAt'=>'2026-03-27 08:45','metadata'=>['camera'=>'CAM-07','location'=>'Port Terminal East','duration'=>'45:12'],'transcript'=>'No speech — ambient surveillance'],
            ['id'=>'f02','name'=>'horvat_voice_intercept_01.wav','fileType'=>'audio','size'=>'48 MB','sizeBytes'=>50331648,'entityId'=>1,'entityType'=>'person','entityName'=>'Marko Horvat','mimeType'=>'audio/wav','uploadedBy'=>'Sgt. Matić','uploadedAt'=>'2026-03-26 14:20','metadata'=>['source'=>'Phone intercept','duration'=>'12:34'],'transcript'=>'"...meeting at the port, Thursday..."'],
            ['id'=>'f03','name'=>'horvat_cafe_photo_001.jpg','fileType'=>'photo','size'=>'4.2 MB','sizeBytes'=>4404019,'entityId'=>1,'entityType'=>'person','entityName'=>'Marko Horvat','mimeType'=>'image/jpeg','uploadedBy'=>'Sgt. Matić','uploadedAt'=>'2026-03-25 16:30','metadata'=>['camera'=>'Nikon D850','location'=>'Café Europa','resolution'=>'8256x5504']],
            ['id'=>'f04','name'=>'horvat_financial_analysis.pdf','fileType'=>'document','size'=>'2.8 MB','sizeBytes'=>2936012,'entityId'=>1,'entityType'=>'person','entityName'=>'Marko Horvat','mimeType'=>'application/pdf','uploadedBy'=>'Maj. Novak','uploadedAt'=>'2026-03-24 10:00','metadata'=>['pages'=>'18','classification'=>'CLASSIFIED']],
            ['id'=>'f05','name'=>'mendoza_ambient.wav','fileType'=>'audio','size'=>'82 MB','sizeBytes'=>85983436,'entityId'=>9,'entityType'=>'person','entityName'=>'Carlos Mendoza','mimeType'=>'audio/wav','uploadedBy'=>'Sgt. Matić','uploadedAt'=>'2026-03-27 06:00','metadata'=>['source'=>'Ambient mic','duration'=>'28:45']],
            ['id'=>'f06','name'=>'mendoza_vehicle_followup.mp4','fileType'=>'video','size'=>'680 MB','sizeBytes'=>713031680,'entityId'=>9,'entityType'=>'person','entityName'=>'Carlos Mendoza','mimeType'=>'video/mp4','uploadedBy'=>'CAM-12','uploadedAt'=>'2026-03-26 22:15','metadata'=>['camera'=>'CAM-12','duration'=>'22:10']],
            ['id'=>'f07','name'=>'mendoza_passport_scan.pdf','fileType'=>'document','size'=>'1.4 MB','sizeBytes'=>1468006,'entityId'=>9,'entityType'=>'person','entityName'=>'Carlos Mendoza','mimeType'=>'application/pdf','uploadedBy'=>'Lt. Perić','uploadedAt'=>'2026-03-20 09:30','metadata'=>['pages'=>'2','documentType'=>'Passport']],
            ['id'=>'f08','name'=>'hassan_intercept_ar.txt','fileType'=>'document','size'=>'24 KB','sizeBytes'=>24576,'entityId'=>7,'entityType'=>'person','entityName'=>'Youssef Hassan','mimeType'=>'text/plain','uploadedBy'=>'Lt. Perić','uploadedAt'=>'2026-03-27 08:10','metadata'=>['language'=>'Arabic','wordCount'=>'3,847'],'transcript'=>'Arabic text — pending translation'],
            ['id'=>'f09','name'=>'hassan_meeting_cam04.mp4','fileType'=>'video','size'=>'920 MB','sizeBytes'=>964689920,'entityId'=>7,'entityType'=>'person','entityName'=>'Youssef Hassan','mimeType'=>'video/mp4','uploadedBy'=>'CAM-04','uploadedAt'=>'2026-03-25 19:00','metadata'=>['camera'=>'CAM-04','duration'=>'34:20']],
            ['id'=>'f10','name'=>'babic_loitering_cam12.mp4','fileType'=>'video','size'=>'540 MB','sizeBytes'=>566231040,'entityId'=>12,'entityType'=>'person','entityName'=>'Ivan Babić','mimeType'=>'video/mp4','uploadedBy'=>'CAM-12','uploadedAt'=>'2026-03-26 03:30','metadata'=>['camera'=>'CAM-12','duration'=>'18:45','alert'=>'Loitering detected']],
            ['id'=>'f11','name'=>'babic_associates_photos.zip','fileType'=>'document','size'=>'28 MB','sizeBytes'=>29360128,'entityId'=>12,'entityType'=>'person','entityName'=>'Ivan Babić','mimeType'=>'application/zip','uploadedBy'=>'Sgt. Matić','uploadedAt'=>'2026-03-22 11:00','metadata'=>['contents'=>'12 surveillance photos']],
            ['id'=>'f12','name'=>'alrashid_phone_extract.xlsx','fileType'=>'document','size'=>'3.6 MB','sizeBytes'=>3774873,'entityId'=>3,'entityType'=>'person','entityName'=>'Ahmed Al-Rashid','mimeType'=>'application/vnd.openxmlformats','uploadedBy'=>'Lt. Perić','uploadedAt'=>'2026-03-24 14:00','metadata'=>['rows'=>'4,821','sheets'=>'6']],
            ['id'=>'f13','name'=>'adriatic_corporate_records.pdf','fileType'=>'document','size'=>'12 MB','sizeBytes'=>12582912,'entityId'=>101,'entityType'=>'organization','entityName'=>'Adriatic Maritime Holdings','mimeType'=>'application/pdf','uploadedBy'=>'Maj. Novak','uploadedAt'=>'2026-03-23 09:00','metadata'=>['pages'=>'84']],
            ['id'=>'f14','name'=>'adriatic_port_surveillance.mp4','fileType'=>'video','size'=>'2.1 GB','sizeBytes'=>2254857830,'entityId'=>101,'entityType'=>'organization','entityName'=>'Adriatic Maritime Holdings','mimeType'=>'video/mp4','uploadedBy'=>'CAM-07','uploadedAt'=>'2026-03-22 06:00','metadata'=>['duration'=>'1:12:30']],
            ['id'=>'f15','name'=>'balkan_transit_financials.xlsx','fileType'=>'document','size'=>'5.4 MB','sizeBytes'=>5662310,'entityId'=>102,'entityType'=>'organization','entityName'=>'Balkan Transit Group','mimeType'=>'application/vnd.openxmlformats','uploadedBy'=>'Maj. Novak','uploadedAt'=>'2026-03-21 16:00','metadata'=>['rows'=>'12,340']],
            ['id'=>'f16','name'=>'petrova_social_export.pdf','fileType'=>'document','size'=>'8.2 MB','sizeBytes'=>8598323,'entityId'=>2,'entityType'=>'person','entityName'=>'Elena Petrova','mimeType'=>'application/pdf','uploadedBy'=>'System','uploadedAt'=>'2026-03-20 12:00','metadata'=>['pages'=>'42','platforms'=>'Instagram, Telegram']],
        ];
    }

    /** GET /mock-api/storage/tree */
    public function tree(): JsonResponse
    {
        $ents = self::entities();
        $persons = array_values(array_filter($ents, fn($e) => $e['type'] === 'person'));
        $orgs = array_values(array_filter($ents, fn($e) => $e['type'] === 'organization'));
        $subfolders = ['Audio', 'Video', 'Photos', 'Documents'];
        return response()->json(['persons' => $persons, 'organizations' => $orgs, 'subfolders' => $subfolders, 'total_entities' => count($ents)]);
    }

    /** GET /mock-api/storage/files */
    public function index(Request $request): JsonResponse
    {
        $data = self::files();
        $entityId = $request->query('entity_id', '');
        $entityType = $request->query('entity_type', '');
        $fileType = $request->query('file_type', '');
        $search = strtolower($request->query('search', ''));
        $sort = $request->query('sort', 'uploadedAt');
        $dir = $request->query('dir', 'desc');

        if ($entityId) $data = array_values(array_filter($data, fn($f) => $f['entityId'] == $entityId));
        if ($entityType) $data = array_values(array_filter($data, fn($f) => $f['entityType'] === $entityType));
        if ($fileType) $data = array_values(array_filter($data, fn($f) => $f['fileType'] === $fileType));
        if ($search) $data = array_values(array_filter($data, fn($f) => str_contains(strtolower($f['name'].' '.$f['entityName'].' '.($f['transcript'] ?? '').' '.implode(' ', $f['metadata'])), $search)));

        usort($data, function ($a, $b) use ($sort, $dir) {
            $av = $a[$sort] ?? ''; $bv = $b[$sort] ?? '';
            if ($sort === 'sizeBytes') { $cmp = $av - $bv; } else { $cmp = strcmp((string)$av, (string)$bv); }
            return $dir === 'desc' ? -$cmp : $cmp;
        });

        $typeCounts = ['audio'=>0,'video'=>0,'photo'=>0,'document'=>0];
        foreach (self::files() as $f) $typeCounts[$f['fileType']]++;
        $totalBytes = array_sum(array_column(self::files(), 'sizeBytes'));

        return response()->json([
            'data' => $data,
            'meta' => ['total' => count($data), 'total_size_bytes' => $totalBytes, 'total_size' => $this->formatBytes($totalBytes)],
            'type_counts' => $typeCounts,
        ]);
    }

    /** GET /mock-api/storage/files/{id} */
    public function show(string $id): JsonResponse
    {
        $file = collect(self::files())->firstWhere('id', $id);
        if (!$file) return response()->json(['message' => 'File not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $file]);
    }

    /** POST /mock-api/storage/files — Upload (mock) */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'entity_id' => ['required', 'integer'],
            'entity_type' => ['required', 'in:person,organization'],
            'file_type' => ['required', 'in:audio,video,photo,document'],
        ]);
        $entity = collect(self::entities())->firstWhere('id', $request->input('entity_id'));
        if (!$entity) return response()->json(['message' => 'Entity not found.', 'code' => 'ENTITY_NOT_FOUND'], 404);
        Log::info('Storage API: file uploaded', ['name' => $request->input('name'), 'entity' => $entity['name']]);
        usleep(600_000);
        return response()->json(['message' => "File uploaded to {$entity['name']}.", 'data' => [
            'id' => 'f-' . Str::random(8), 'name' => $request->input('name'),
            'fileType' => $request->input('file_type'), 'size' => '0 KB', 'sizeBytes' => 0,
            'entityId' => $entity['id'], 'entityType' => $entity['type'], 'entityName' => $entity['name'],
            'mimeType' => 'application/octet-stream', 'uploadedBy' => 'Current User',
            'uploadedAt' => now()->toDateTimeString(), 'metadata' => [],
        ]], 201);
    }

    /** GET /mock-api/storage/files/{id}/download */
    public function download(string $id): JsonResponse
    {
        $file = collect(self::files())->firstWhere('id', $id);
        if (!$file) return response()->json(['message' => 'File not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json([
            'message' => 'Download ready.', 'file' => $file['name'],
            'size' => $file['size'], 'mime_type' => $file['mimeType'],
        ]);
    }

    /** DELETE /mock-api/storage/files/{id} */
    public function destroy(string $id): JsonResponse
    {
        $file = collect(self::files())->firstWhere('id', $id);
        if (!$file) return response()->json(['message' => 'File not found.', 'code' => 'NOT_FOUND'], 404);
        Log::info('Storage API: file deleted', ['id' => $id, 'name' => $file['name']]);
        return response()->json(['message' => "File \"{$file['name']}\" deleted.", 'id' => $id]);
    }

    /** GET /mock-api/storage/stats */
    public function stats(): JsonResponse
    {
        $files = self::files();
        $totalBytes = array_sum(array_column($files, 'sizeBytes'));
        $typeCounts = ['audio'=>0,'video'=>0,'photo'=>0,'document'=>0];
        $typeBytes = ['audio'=>0,'video'=>0,'photo'=>0,'document'=>0];
        foreach ($files as $f) { $typeCounts[$f['fileType']]++; $typeBytes[$f['fileType']] += $f['sizeBytes']; }
        return response()->json([
            'total_files' => count($files), 'total_size' => $this->formatBytes($totalBytes), 'total_size_bytes' => $totalBytes,
            'by_type' => array_map(fn($t) => ['count' => $typeCounts[$t], 'size' => $this->formatBytes($typeBytes[$t])], array_flip(array_keys($typeCounts))),
            'entities' => count(self::entities()), 'backend' => 'MinIO',
        ]);
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1073741824) return round($bytes / 1073741824, 1) . ' GB';
        if ($bytes >= 1048576) return round($bytes / 1048576, 0) . ' MB';
        if ($bytes >= 1024) return round($bytes / 1024, 0) . ' KB';
        return $bytes . ' B';
    }
}
