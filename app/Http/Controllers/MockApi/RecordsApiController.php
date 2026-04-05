<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX Records / AI Processing Center Mock REST API.
 * Matches original records page data shape (AIRecord interface).
 */
class RecordsApiController extends Controller
{
    private static function records(): array
    {
        return [
            ['id'=>'r01','type'=>'video_transcription','status'=>'completed','priority'=>'critical','title'=>'Port Terminal Surveillance — CAM-07','sourceFile'=>'horvat_port_cam07.mp4','sourceSize'=>'128 MB','sourceDuration'=>'45:00','sourceLang'=>'hr','aiModel'=>'Faster-Whisper Large-v3','confidence'=>94,'result'=>'Transcription complete. 3,847 words. 12 keyword matches.','wordCount'=>3847,'createdBy'=>'System','createdAt'=>'2026-03-24 09:48','completedAt'=>'2026-03-24 10:12','processingTime'=>'24 min','entityType'=>'person','entityId'=>1,'entityName'=>'Marko Horvat','operationCode'=>'HAWK','tags'=>['keyword-flagged','port','HAWK']],
            ['id'=>'r02','type'=>'audio_transcription','status'=>'completed','priority'=>'critical','title'=>'Phone Intercept — Horvat Outgoing Call','sourceFile'=>'horvat_phone_20260324.wav','sourceSize'=>'4.2 MB','sourceDuration'=>'4:12','sourceLang'=>'hr','aiModel'=>'Faster-Whisper Large-v3','confidence'=>91,'result'=>'Full transcript: 4-minute call. References to port, Thursday, dock 7.','wordCount'=>612,'createdBy'=>'Sgt. Matić','createdAt'=>'2026-03-24 08:22','completedAt'=>'2026-03-24 08:26','processingTime'=>'4 min','entityType'=>'person','entityId'=>1,'entityName'=>'Marko Horvat','operationCode'=>'HAWK','tags'=>['intercept','keyword-flagged']],
            ['id'=>'r03','type'=>'translation','status'=>'completed','priority'=>'high','title'=>'Hassan Encrypted Comms — Arabic → English','sourceFile'=>'hassan_encrypted_msgs.json','sourceSize'=>'18 KB','sourceLang'=>'ar','targetLang'=>'en','aiModel'=>'Meta NLLB-200','confidence'=>88,'result'=>'14 messages translated. Coordination of logistics. Code words detected.','wordCount'=>890,'createdBy'=>'System','createdAt'=>'2026-03-24 08:30','completedAt'=>'2026-03-24 08:35','processingTime'=>'5 min','entityType'=>'person','entityId'=>7,'entityName'=>'Omar Hassan','operationCode'=>'HAWK','tags'=>['encrypted','arabic','translated']],
            ['id'=>'r04','type'=>'file_summary','status'=>'completed','priority'=>'high','title'=>'Rashid Holdings Financial Analysis Summary','sourceFile'=>'asg_financial_audit_2025.pdf','sourceSize'=>'5.8 MB','aiModel'=>'LLaMA 3.1 70B','confidence'=>86,'result'=>'12 over-invoiced cargo shipments (€2.4M discrepancy). 3 shell companies. Fund flow consistent with trade-based ML.','wordCount'=>2840,'createdBy'=>'Financial Intel','createdAt'=>'2026-03-22 09:00','completedAt'=>'2026-03-22 09:18','processingTime'=>'18 min','entityType'=>'org','entityId'=>2,'entityName'=>'Rashid Holdings','operationCode'=>'GLACIER','tags'=>['financial','shell-companies','AML']],
            ['id'=>'r05','type'=>'photo_ocr','status'=>'completed','priority'=>'medium','title'=>'LPR Capture — Vukovarska Checkpoint','sourceFile'=>'horvat_vukovarska_lpr.jpg','sourceSize'=>'1.8 MB','aiModel'=>'LLaVA Vision','confidence'=>97,'result'=>'License plate: ZG-1847-AB (97%). BMW 5 Series dark blue. Parking permit ZONA-3.','wordCount'=>45,'createdBy'=>'LPR System','createdAt'=>'2026-03-24 09:31','completedAt'=>'2026-03-24 09:31','processingTime'=>'< 1 sec','entityType'=>'person','entityId'=>1,'entityName'=>'Marko Horvat','tags'=>['lpr','ZG-1847-AB']],
            ['id'=>'r06','type'=>'audio_transcription','status'=>'processing','priority'=>'high','title'=>'Mendoza Night Activity — Vehicle Audio','sourceFile'=>'mendoza_vehicle_audio.wav','sourceSize'=>'8.6 MB','sourceDuration'=>'22:00','sourceLang'=>'es','aiModel'=>'Faster-Whisper Large-v3','progress'=>67,'createdBy'=>'System','createdAt'=>'2026-03-24 10:00','entityType'=>'person','entityId'=>9,'entityName'=>'Carlos Mendoza','operationCode'=>'HAWK','tags'=>['spanish','night-activity']],
            ['id'=>'r07','type'=>'translation','status'=>'processing','priority'=>'critical','title'=>'Mendoza Vehicle Audio — Spanish → English','sourceFile'=>'mendoza_vehicle_transcript.txt','sourceSize'=>'—','sourceLang'=>'es','targetLang'=>'en','aiModel'=>'Meta NLLB-200','progress'=>0,'createdBy'=>'System','createdAt'=>'2026-03-24 10:05','entityType'=>'person','entityId'=>9,'entityName'=>'Carlos Mendoza','operationCode'=>'HAWK','tags'=>['spanish','pending-transcription']],
            ['id'=>'r08','type'=>'video_transcription','status'=>'queued','priority'=>'medium','title'=>'Babić Loitering — Camera 12 Footage','sourceFile'=>'babic_loitering_cam12.mp4','sourceSize'=>'67 MB','sourceDuration'=>'22:00','sourceLang'=>'auto','aiModel'=>'Faster-Whisper Large-v3','createdBy'=>'AI Detection','createdAt'=>'2026-03-24 07:55','entityType'=>'person','entityId'=>12,'entityName'=>'Ivan Babić','tags'=>['loitering','ai-flagged']],
            ['id'=>'r09','type'=>'file_summary','status'=>'queued','priority'=>'low','title'=>'CERBERUS Final Report — Executive Summary','sourceFile'=>'cerberus_final_report.pdf','sourceSize'=>'12.4 MB','aiModel'=>'LLaMA 3.1 70B','createdBy'=>'Col. Tomić','createdAt'=>'2026-03-23 14:00','operationCode'=>'CERBERUS','tags'=>['CERBERUS','final-report']],
            ['id'=>'r10','type'=>'photo_ocr','status'=>'completed','priority'=>'medium','title'=>'Diplomatic Quarter — Embassy Signage OCR','sourceFile'=>'babic_diplomatic_photos.zip','sourceSize'=>'22 MB','aiModel'=>'LLaVA Vision','confidence'=>82,'result'=>'Detected: Embassy of Turkey (92%), Consulate of Egypt (88%). Subject at 3 locations.','wordCount'=>78,'createdBy'=>'Field Team Alpha','createdAt'=>'2026-03-23 15:20','completedAt'=>'2026-03-23 15:22','processingTime'=>'2 min','entityType'=>'person','entityId'=>12,'entityName'=>'Ivan Babić','tags'=>['diplomatic','embassy','OCR']],
            ['id'=>'r11','type'=>'audio_transcription','status'=>'failed','priority'=>'medium','title'=>'Hassan Storage Facility — Ambient Audio','sourceFile'=>'hassan_storage_ambient.wav','sourceSize'=>'2.1 MB','sourceDuration'=>'15:00','sourceLang'=>'ar','aiModel'=>'Faster-Whisper Large-v3','confidence'=>12,'result'=>'FAILED: Audio quality below threshold (SNR < 5dB). Recommend DeepFilterNet preprocessing.','createdBy'=>'System','createdAt'=>'2026-03-23 16:45','completedAt'=>'2026-03-23 16:48','processingTime'=>'3 min','entityType'=>'person','entityId'=>7,'entityName'=>'Omar Hassan','tags'=>['failed','low-quality']],
            ['id'=>'r12','type'=>'video_transcription','status'=>'completed','priority'=>'high','title'=>'Co-location Event — Horvat & Mendoza at Savska','sourceFile'=>'colocation_savska_41.mp4','sourceSize'=>'45 MB','sourceDuration'=>'8:00','sourceLang'=>'auto','aiModel'=>'Faster-Whisper Large-v3','confidence'=>89,'result'=>'Two speakers: Horvat (Croatian), Mendoza (Spanish-accented). Key: "the boat arrives Thursday".','wordCount'=>1240,'createdBy'=>'Correlation Engine','createdAt'=>'2026-03-24 09:20','completedAt'=>'2026-03-24 09:32','processingTime'=>'12 min','entityType'=>'person','entityId'=>1,'entityName'=>'Marko Horvat','operationCode'=>'HAWK','tags'=>['co-location','diarization','HAWK']],
            ['id'=>'r13','type'=>'document','status'=>'completed','priority'=>'high','title'=>'Checkpoint Avoidance Route Map — Babić','sourceFile'=>'babic_route_map.pdf','sourceSize'=>'340 KB','aiModel'=>'Manual','createdBy'=>'AI Analysis','createdAt'=>'2026-03-22 10:00','completedAt'=>'2026-03-22 10:00','entityType'=>'person','entityId'=>12,'entityName'=>'Ivan Babić','tags'=>['checkpoint','LPR-avoidance']],
            ['id'=>'r14','type'=>'evidence','status'=>'completed','priority'=>'critical','title'=>'Evidence Package — Horvat Co-location Series','sourceFile'=>'horvat_colocation_evidence_042.zip','sourceSize'=>'18.5 MB','aiModel'=>'Manual','createdBy'=>'Workflow Engine','createdAt'=>'2026-03-24 09:15','completedAt'=>'2026-03-24 09:15','entityType'=>'person','entityId'=>1,'entityName'=>'Marko Horvat','operationCode'=>'HAWK','tags'=>['evidence','chain-of-custody','HAWK']],
            ['id'=>'r15','type'=>'translation','status'=>'completed','priority'=>'medium','title'=>'Cargo Manifest Translation — Chinese → English','sourceFile'=>'dragon_tech_manifests.pdf','sourceSize'=>'1.4 MB','sourceLang'=>'zh','targetLang'=>'en','aiModel'=>'Meta NLLB-200','confidence'=>85,'result'=>'8 manifests. Declared 2,400kg electronics, actual ~4,100kg. Dual-use concealment pattern.','wordCount'=>560,'createdBy'=>'Cpt. Perić','createdAt'=>'2026-03-18 11:00','completedAt'=>'2026-03-18 11:08','processingTime'=>'8 min','entityType'=>'org','entityId'=>4,'entityName'=>'Dragon Tech Solutions','operationCode'=>'PHOENIX','tags'=>['chinese','cargo','PHOENIX']],
        ];
    }

    /** GET /mock-api/records */
    public function index(Request $request): JsonResponse
    {
        $data = self::records();
        $type = $request->query('type', '');
        $status = $request->query('status', '');
        $priority = $request->query('priority', '');
        $search = strtolower($request->query('search', ''));

        if ($type && $type !== 'all') $data = array_values(array_filter($data, fn($r) => $r['type'] === $type));
        if ($status && $status !== 'all') $data = array_values(array_filter($data, fn($r) => $r['status'] === $status));
        if ($priority && $priority !== 'all') $data = array_values(array_filter($data, fn($r) => $r['priority'] === $priority));
        if ($search) $data = array_values(array_filter($data, fn($r) => str_contains(strtolower($r['title'].' '.($r['entityName'] ?? '').' '.implode(' ',$r['tags']).' '.($r['sourceFile'] ?? '')), $search)));

        return response()->json(['data' => $data, 'meta' => ['total' => count($data)]]);
    }

    /** GET /mock-api/records/{id} */
    public function show(string $id): JsonResponse
    {
        $record = collect(self::records())->firstWhere('id', $id);
        if (!$record) return response()->json(['message'=>'Record not found.','code'=>'NOT_FOUND'], 404);
        return response()->json(['data' => $record]);
    }

    /** POST /mock-api/records/{id}/retry */
    public function retry(string $id): JsonResponse
    {
        $record = collect(self::records())->firstWhere('id', $id);
        if (!$record) return response()->json(['message'=>'Record not found.','code'=>'NOT_FOUND'], 404);
        if ($record['status'] !== 'failed') return response()->json(['message'=>'Only failed records can be retried.','code'=>'NOT_FAILED'], 409);
        Log::info('Records API: retry', ['id' => $id]);
        return response()->json(['message'=>"Record re-queued: {$record['title']}",'id'=>$id,'new_status'=>'queued']);
    }

    /** DELETE /mock-api/records/{id} */
    public function destroy(string $id): JsonResponse
    {
        $record = collect(self::records())->firstWhere('id', $id);
        if (!$record) return response()->json(['message'=>'Record not found.','code'=>'NOT_FOUND'], 404);
        if (in_array($record['status'], ['processing'])) return response()->json(['message'=>'Cannot delete while processing.','code'=>'RECORD_PROCESSING'], 409);
        Log::info('Records API: deleted', ['id' => $id]);
        return response()->json(['message'=>"Record deleted: {$record['title']}",'id'=>$id]);
    }
}
