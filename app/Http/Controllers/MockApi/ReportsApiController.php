<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX Report Generator Mock REST API.
 * Generate, view, download, delete intelligence reports for persons/organizations.
 */
class ReportsApiController extends Controller
{
    private static function entities(): array
    {
        return [
            'persons' => [
                ['id'=>1,'name'=>'Marko Horvat','risk'=>'Critical'],['id'=>3,'name'=>'Ahmed Al-Rashid','risk'=>'Critical'],
                ['id'=>7,'name'=>'Youssef Hassan','risk'=>'High'],['id'=>9,'name'=>'Carlos Mendoza','risk'=>'Critical'],
                ['id'=>12,'name'=>'Ivan Babić','risk'=>'High'],['id'=>2,'name'=>'Elena Petrova','risk'=>'Medium'],
                ['id'=>4,'name'=>'Viktor Petrenko','risk'=>'Medium'],['id'=>5,'name'=>'Ana Kovačević','risk'=>'Low'],
                ['id'=>6,'name'=>'Marco Rossi','risk'=>'Medium'],['id'=>8,'name'=>'Dragana Simić','risk'=>'Low'],
            ],
            'organizations' => [
                ['id'=>1,'name'=>'Adriatic Maritime Holdings','risk'=>'Critical'],['id'=>2,'name'=>'Balkan Transit Group','risk'=>'High'],
                ['id'=>3,'name'=>'Meridian Finance Ltd','risk'=>'High'],['id'=>4,'name'=>'EuroChem Distribution','risk'=>'Medium'],
                ['id'=>5,'name'=>'Solaris Energy Partners','risk'=>'Low'],
            ],
        ];
    }

    private static function reports(): array
    {
        return [
            ['id'=>'rpt-01','entityType'=>'person','entityId'=>1,'entityName'=>'Marko Horvat','title'=>'Intelligence Report — Marko Horvat (Full)','status'=>'completed','format'=>'pdf','sections'=>14,'pages'=>23,'size'=>'4.2 MB','generatedBy'=>'Maj. Novak','generatedAt'=>'2026-03-27 09:18','dateFrom'=>'2026-01-01','dateTo'=>'2026-03-27','classification'=>'CLASSIFIED // NOFORN','jobId'=>null],
            ['id'=>'rpt-02','entityType'=>'person','entityId'=>9,'entityName'=>'Carlos Mendoza','title'=>'Intelligence Report — Carlos Mendoza','status'=>'completed','format'=>'pdf','sections'=>14,'pages'=>18,'size'=>'3.1 MB','generatedBy'=>'Lt. Perić','generatedAt'=>'2026-03-26 16:30','dateFrom'=>'2026-02-01','dateTo'=>'2026-03-26','classification'=>'CLASSIFIED // NOFORN','jobId'=>null],
            ['id'=>'rpt-03','entityType'=>'organization','entityId'=>1,'entityName'=>'Adriatic Maritime Holdings','title'=>'Organization Report — Adriatic Maritime','status'=>'completed','format'=>'pdf','sections'=>6,'pages'=>12,'size'=>'2.8 MB','generatedBy'=>'Maj. Novak','generatedAt'=>'2026-03-25 11:00','dateFrom'=>'2025-06-01','dateTo'=>'2026-03-25','classification'=>'CLASSIFIED // NOFORN','jobId'=>null],
            ['id'=>'rpt-04','entityType'=>'person','entityId'=>12,'entityName'=>'Ivan Babić','title'=>'Intelligence Report — Ivan Babić','status'=>'completed','format'=>'docx','sections'=>14,'pages'=>15,'size'=>'2.4 MB','generatedBy'=>'Sgt. Matić','generatedAt'=>'2026-03-24 14:20','dateFrom'=>'2026-01-15','dateTo'=>'2026-03-24','classification'=>'CLASSIFIED // NOFORN','jobId'=>null],
            ['id'=>'rpt-05','entityType'=>'person','entityId'=>7,'entityName'=>'Youssef Hassan','title'=>'Intelligence Report — Youssef Hassan','status'=>'completed','format'=>'pdf','sections'=>14,'pages'=>20,'size'=>'3.6 MB','generatedBy'=>'Lt. Perić','generatedAt'=>'2026-03-23 09:45','dateFrom'=>'2025-12-01','dateTo'=>'2026-03-23','classification'=>'CLASSIFIED // NOFORN','jobId'=>null],
            ['id'=>'rpt-06','entityType'=>'person','entityId'=>3,'entityName'=>'Ahmed Al-Rashid','title'=>'Intelligence Report — Ahmed Al-Rashid','status'=>'completed','format'=>'pdf','sections'=>14,'pages'=>22,'size'=>'4.0 MB','generatedBy'=>'Maj. Novak','generatedAt'=>'2026-03-22 10:30','dateFrom'=>'2025-09-01','dateTo'=>'2026-03-22','classification'=>'CLASSIFIED // NOFORN','jobId'=>null],
            ['id'=>'rpt-07','entityType'=>'organization','entityId'=>2,'entityName'=>'Balkan Transit Group','title'=>'Organization Report — Balkan Transit','status'=>'completed','format'=>'pdf','sections'=>6,'pages'=>9,'size'=>'1.9 MB','generatedBy'=>'Cpt. Horvat','generatedAt'=>'2026-03-20 15:00','dateFrom'=>'2026-01-01','dateTo'=>'2026-03-20','classification'=>'CLASSIFIED // NOFORN','jobId'=>null],
            ['id'=>'rpt-08','entityType'=>'person','entityId'=>1,'entityName'=>'Marko Horvat','title'=>'Weekly Summary — Horvat (W13)','status'=>'generating','format'=>'pdf','sections'=>14,'pages'=>0,'size'=>'','generatedBy'=>'Scheduler','generatedAt'=>'2026-03-27 09:30','dateFrom'=>'2026-03-20','dateTo'=>'2026-03-27','classification'=>'CLASSIFIED // NOFORN','jobId'=>'j-rpt-08'],
            ['id'=>'rpt-09','entityType'=>'person','entityId'=>2,'entityName'=>'Elena Petrova','title'=>'Intelligence Report — Elena Petrova','status'=>'failed','format'=>'pdf','sections'=>14,'pages'=>0,'size'=>'','generatedBy'=>'Sgt. Matić','generatedAt'=>'2026-03-26 18:00','dateFrom'=>'2026-01-01','dateTo'=>'2026-03-26','classification'=>'CLASSIFIED // NOFORN','jobId'=>'j-rpt-09'],
        ];
    }

    /** GET /mock-api/reports/entities */
    public function entities(Request $request): JsonResponse
    {
        $type = $request->query('type', '');
        $ents = self::entities();
        if ($type === 'person') return response()->json(['data' => $ents['persons']]);
        if ($type === 'organization') return response()->json(['data' => $ents['organizations']]);
        return response()->json(['persons' => $ents['persons'], 'organizations' => $ents['organizations']]);
    }

    /** GET /mock-api/reports */
    public function index(Request $request): JsonResponse
    {
        $data = self::reports();
        $search = strtolower($request->query('search', ''));
        $entityType = $request->query('entity_type', '');
        $status = $request->query('status', '');
        $format = $request->query('format', '');

        if ($entityType) $data = array_values(array_filter($data, fn($r) => $r['entityType'] === $entityType));
        if ($status) $data = array_values(array_filter($data, fn($r) => $r['status'] === $status));
        if ($format) $data = array_values(array_filter($data, fn($r) => $r['format'] === $format));
        if ($search) $data = array_values(array_filter($data, fn($r) => str_contains(strtolower($r['title'].' '.$r['entityName'].' '.$r['generatedBy']), $search)));

        usort($data, fn($a, $b) => strcmp($b['generatedAt'], $a['generatedAt']));

        $counts = ['completed'=>0,'generating'=>0,'queued'=>0,'failed'=>0];
        foreach (self::reports() as $r) $counts[$r['status']]++;

        return response()->json([
            'data' => $data,
            'meta' => ['total' => count($data)],
            'counts' => $counts,
        ]);
    }

    /** GET /mock-api/reports/{id} */
    public function show(string $id): JsonResponse
    {
        $report = collect(self::reports())->firstWhere('id', $id);
        if (!$report) return response()->json(['message' => 'Report not found.', 'code' => 'NOT_FOUND'], 404);
        $sections = $report['entityType'] === 'person'
            ? ['AI Summary','Profile','Statistics','Vehicles','Known Locations','Connections Graph','Events Timeline','LPR Activity','Records','Face Recognition','Surveillance Apps','Social Media','Risk Assessment','Notes']
            : ['Company Info','Linked Persons','Connections','Data Sources','Financial Links','Risk Assessment'];
        return response()->json(['data' => array_merge($report, ['sectionList' => $sections])]);
    }

    /** POST /mock-api/reports — Generate a new report */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'entity_type' => ['required', 'in:person,organization'],
            'entity_id' => ['required', 'integer', 'min:1'],
            'format' => ['required', 'in:pdf,docx'],
            'date_from' => ['required', 'date'],
            'date_to' => ['required', 'date', 'after_or_equal:date_from'],
        ]);

        $type = $request->input('entity_type');
        $eId = $request->input('entity_id');
        $pool = $type === 'person' ? self::entities()['persons'] : self::entities()['organizations'];
        $entity = collect($pool)->firstWhere('id', $eId);
        if (!$entity) return response()->json(['message' => 'Entity not found.', 'code' => 'ENTITY_NOT_FOUND'], 404);

        $prefix = $type === 'person' ? 'Intelligence Report' : 'Organization Report';
        $sections = $type === 'person' ? 14 : 6;
        $id = 'rpt-' . Str::random(8);
        $jobId = 'j-' . $id;

        Log::info('Reports API: generate', ['entity' => $entity['name'], 'type' => $type, 'format' => $request->input('format')]);
        usleep(600_000);

        return response()->json([
            'message' => "Report generation started for {$entity['name']}.",
            'data' => [
                'id' => $id, 'entityType' => $type, 'entityId' => $eId, 'entityName' => $entity['name'],
                'title' => "{$prefix} — {$entity['name']}", 'status' => 'queued',
                'format' => $request->input('format'), 'sections' => $sections,
                'pages' => 0, 'size' => '', 'generatedBy' => 'Current User',
                'generatedAt' => now()->toDateTimeString(),
                'dateFrom' => $request->input('date_from'), 'dateTo' => $request->input('date_to'),
                'classification' => 'CLASSIFIED // NOFORN', 'jobId' => $jobId,
            ],
        ], 201);
    }

    /** POST /mock-api/reports/{id}/retry */
    public function retry(string $id): JsonResponse
    {
        $report = collect(self::reports())->firstWhere('id', $id);
        if (!$report) return response()->json(['message' => 'Report not found.', 'code' => 'NOT_FOUND'], 404);
        if ($report['status'] !== 'failed') return response()->json(['message' => 'Only failed reports can be retried.', 'code' => 'NOT_FAILED'], 409);
        Log::info('Reports API: retry', ['report_id' => $id]);
        usleep(400_000);
        return response()->json(['message' => "Report re-queued: {$report['title']}.", 'id' => $id, 'new_status' => 'queued']);
    }

    /** GET /mock-api/reports/{id}/download */
    public function download(string $id): JsonResponse
    {
        $report = collect(self::reports())->firstWhere('id', $id);
        if (!$report) return response()->json(['message' => 'Report not found.', 'code' => 'NOT_FOUND'], 404);
        if ($report['status'] !== 'completed') return response()->json(['message' => 'Report not ready for download.', 'code' => 'NOT_READY'], 409);
        $ext = $report['format'] === 'docx' ? 'docx' : 'pdf';
        return response()->json([
            'message' => 'Download ready.',
            'file' => "argux_report_{$report['entityId']}_" . now()->format('Ymd') . ".{$ext}",
            'size' => $report['size'], 'format' => $report['format'],
        ]);
    }

    /** DELETE /mock-api/reports/{id} */
    public function destroy(string $id): JsonResponse
    {
        $report = collect(self::reports())->firstWhere('id', $id);
        if (!$report) return response()->json(['message' => 'Report not found.', 'code' => 'NOT_FOUND'], 404);
        if ($report['status'] === 'generating') return response()->json(['message' => 'Cannot delete while generating.', 'code' => 'REPORT_GENERATING'], 409);
        Log::info('Reports API: deleted', ['report_id' => $id]);
        return response()->json(['message' => "Report deleted: {$report['title']}.", 'id' => $id]);
    }
}
