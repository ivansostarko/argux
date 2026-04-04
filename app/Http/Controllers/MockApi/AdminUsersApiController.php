<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * ARGUX Admin User Management Mock REST API.
 * CRUD for operator accounts + status + password/MFA reset.
 */
class AdminUsersApiController extends Controller
{
    private static function users(): array
    {
        return [
            ['id'=>101,'firstName'=>'Marko','lastName'=>'Horvat','email'=>'horvat.op@argux.mil','phone'=>'+385 91 200 0001','roleId'=>2,'roleName'=>'Senior Operator','status'=>'active','mfa'=>'app','mfaEnrolled'=>true,'department'=>'Operations','unit'=>'Unit Alpha','lastLogin'=>'2026-03-27 08:05','lastIp'=>'10.0.1.30','loginCount'=>534,'createdAt'=>'2024-06-15','createdBy'=>'Col. Tomić','failedAttempts'=>0,'activeSessions'=>1,'notes'=>'Team Alpha lead.'],
            ['id'=>102,'firstName'=>'Ana','lastName'=>'Kovačević','email'=>'kovacevic@argux.mil','phone'=>'+385 91 200 0002','roleId'=>3,'roleName'=>'Intelligence Analyst','status'=>'active','mfa'=>'app','mfaEnrolled'=>true,'department'=>'Intelligence','unit'=>'HQ Staff','lastLogin'=>'2026-03-27 08:45','lastIp'=>'10.0.1.15','loginCount'=>412,'createdAt'=>'2024-08-20','createdBy'=>'Maj. Novak','failedAttempts'=>0,'activeSessions'=>1,'notes'=>'Network analysis specialist.'],
            ['id'=>103,'firstName'=>'Ivan','lastName'=>'Babić','email'=>'babic.op@argux.mil','phone'=>'+385 91 200 0003','roleId'=>2,'roleName'=>'Senior Operator','status'=>'active','mfa'=>'sms','mfaEnrolled'=>true,'department'=>'Field Operations','unit'=>'Mobile Team','lastLogin'=>'2026-03-27 07:30','lastIp'=>'10.0.4.22','loginCount'=>287,'createdAt'=>'2024-09-10','createdBy'=>'Cpt. Horvat','failedAttempts'=>0,'activeSessions'=>2,'notes'=>'Mobile field operator.'],
            ['id'=>104,'firstName'=>'Elena','lastName'=>'Petrova','email'=>'petrova@argux.mil','phone'=>'+385 91 200 0004','roleId'=>4,'roleName'=>'Operator','status'=>'active','mfa'=>'app','mfaEnrolled'=>true,'department'=>'Surveillance','unit'=>'Night Shift','lastLogin'=>'2026-03-27 06:00','lastIp'=>'10.0.2.14','loginCount'=>198,'createdAt'=>'2025-01-10','createdBy'=>'Maj. Novak','failedAttempts'=>0,'activeSessions'=>0,'notes'=>'Night shift camera monitoring.'],
            ['id'=>105,'firstName'=>'Josip','lastName'=>'Zelić','email'=>'zelic.op@argux.mil','phone'=>'+385 91 200 0005','roleId'=>3,'roleName'=>'Intelligence Analyst','status'=>'active','mfa'=>'app','mfaEnrolled'=>true,'department'=>'Analysis','unit'=>'HQ Staff','lastLogin'=>'2026-03-26 17:00','lastIp'=>'10.0.1.18','loginCount'=>345,'createdAt'=>'2024-07-01','createdBy'=>'Col. Tomić','failedAttempts'=>0,'activeSessions'=>0,'notes'=>'Workflow and data source specialist.'],
            ['id'=>106,'firstName'=>'Katarina','lastName'=>'Šimunović','email'=>'simunovic.op@argux.mil','phone'=>'+385 91 200 0006','roleId'=>4,'roleName'=>'Operator','status'=>'suspended','mfa'=>'app','mfaEnrolled'=>true,'department'=>'Intelligence','unit'=>'Unit Bravo','lastLogin'=>'2026-03-10 11:45','lastIp'=>'10.0.1.40','loginCount'=>156,'createdAt'=>'2024-11-20','createdBy'=>'Maj. Novak','failedAttempts'=>0,'activeSessions'=>0,'notes'=>'Suspended: Unauthorized access.'],
            ['id'=>107,'firstName'=>'Damir','lastName'=>'Kožul','email'=>'kozul.op@argux.mil','phone'=>'+385 91 200 0007','roleId'=>2,'roleName'=>'Senior Operator','status'=>'locked','mfa'=>'sms','mfaEnrolled'=>true,'department'=>'Operations','unit'=>'Unit Charlie','lastLogin'=>'2026-03-27 03:15','lastIp'=>'192.168.50.12','loginCount'=>220,'createdAt'=>'2024-05-10','createdBy'=>'Col. Tomić','failedAttempts'=>5,'activeSessions'=>0,'notes'=>'LOCKED: 5 failed attempts.'],
            ['id'=>108,'firstName'=>'Nikola','lastName'=>'Krajina','email'=>'krajina.op@argux.mil','phone'=>'+385 91 200 0008','roleId'=>5,'roleName'=>'Viewer','status'=>'active','mfa'=>'email','mfaEnrolled'=>true,'department'=>'Command','unit'=>'HQ Staff','lastLogin'=>'2026-03-25 14:20','lastIp'=>'10.0.1.30','loginCount'=>67,'createdAt'=>'2025-04-01','createdBy'=>'Col. Tomić','failedAttempts'=>0,'activeSessions'=>0,'notes'=>'Read-only briefing access.'],
            ['id'=>109,'firstName'=>'Luka','lastName'=>'Radić','email'=>'radic.op@argux.mil','phone'=>'+385 91 200 0009','roleId'=>4,'roleName'=>'Operator','status'=>'pending','mfa'=>'none','mfaEnrolled'=>false,'department'=>'Surveillance','unit'=>'Unit Delta','lastLogin'=>'Never','lastIp'=>'—','loginCount'=>0,'createdAt'=>'2026-03-26','createdBy'=>'Maj. Novak','failedAttempts'=>0,'activeSessions'=>0,'notes'=>'New hire. Pending MFA.'],
            ['id'=>110,'firstName'=>'Petra','lastName'=>'Vuković','email'=>'vukovic@argux.mil','phone'=>'+385 91 200 0010','roleId'=>3,'roleName'=>'Intelligence Analyst','status'=>'pending','mfa'=>'none','mfaEnrolled'=>false,'department'=>'Intelligence','unit'=>'Unit Echo','lastLogin'=>'Never','lastIp'=>'—','loginCount'=>0,'createdAt'=>'2026-03-27','createdBy'=>'Cpt. Horvat','failedAttempts'=>0,'activeSessions'=>0,'notes'=>'Transfer. Awaiting clearance.'],
            ['id'=>111,'firstName'=>'Tomislav','lastName'=>'Marić','email'=>'maric@argux.mil','phone'=>'+385 91 200 0011','roleId'=>4,'roleName'=>'Operator','status'=>'active','mfa'=>'app','mfaEnrolled'=>true,'department'=>'Field Operations','unit'=>'Mobile Team','lastLogin'=>'2026-03-27 07:00','lastIp'=>'10.0.4.30','loginCount'=>178,'createdAt'=>'2025-02-15','createdBy'=>'Cpt. Horvat','failedAttempts'=>0,'activeSessions'=>1,'notes'=>'GPS tracking operator.'],
            ['id'=>112,'firstName'=>'Maja','lastName'=>'Perić','email'=>'peric.op@argux.mil','phone'=>'+385 91 200 0012','roleId'=>3,'roleName'=>'Intelligence Analyst','status'=>'active','mfa'=>'app','mfaEnrolled'=>true,'department'=>'Analysis','unit'=>'HQ Staff','lastLogin'=>'2026-03-27 08:30','lastIp'=>'10.0.1.45','loginCount'=>89,'createdAt'=>'2025-11-01','createdBy'=>'Maj. Novak','failedAttempts'=>0,'activeSessions'=>1,'notes'=>'Face recognition specialist.'],
            ['id'=>113,'firstName'=>'Goran','lastName'=>'Tadić','email'=>'tadic@argux.mil','phone'=>'+385 91 200 0013','roleId'=>4,'roleName'=>'Operator','status'=>'archived','mfa'=>'app','mfaEnrolled'=>true,'department'=>'Operations','unit'=>'Unit Alpha','lastLogin'=>'2026-01-15 16:00','lastIp'=>'10.0.1.22','loginCount'=>445,'createdAt'=>'2024-02-01','createdBy'=>'Col. Tomić','failedAttempts'=>0,'activeSessions'=>0,'notes'=>'Archived: Transferred.'],
            ['id'=>114,'firstName'=>'Sandra','lastName'=>'Ilić','email'=>'ilic@argux.mil','phone'=>'+385 91 200 0014','roleId'=>6,'roleName'=>'Trainee','status'=>'active','mfa'=>'email','mfaEnrolled'=>true,'department'=>'Training','unit'=>'HQ Staff','lastLogin'=>'2026-03-26 09:00','lastIp'=>'10.0.1.50','loginCount'=>34,'createdAt'=>'2026-02-01','createdBy'=>'Maj. Novak','failedAttempts'=>0,'activeSessions'=>0,'notes'=>'Training program.'],
            ['id'=>115,'firstName'=>'Filip','lastName'=>'Dragić','email'=>'dragic@argux.mil','phone'=>'+385 91 200 0015','roleId'=>2,'roleName'=>'Senior Operator','status'=>'active','mfa'=>'app','mfaEnrolled'=>true,'department'=>'Operations','unit'=>'Unit Bravo','lastLogin'=>'2026-03-27 07:45','lastIp'=>'10.0.1.35','loginCount'=>312,'createdAt'=>'2024-08-01','createdBy'=>'Col. Tomić','failedAttempts'=>0,'activeSessions'=>1,'notes'=>'Team Bravo lead.'],
        ];
    }

    /** GET /mock-api/admin/users */
    public function index(Request $request): JsonResponse
    {
        $data = self::users();
        $search = strtolower($request->query('search', ''));
        $status = $request->query('status', '');
        $role = $request->query('role', '');
        $dept = $request->query('department', '');
        $unit = $request->query('unit', '');
        $mfa = $request->query('mfa', '');
        $sortCol = $request->query('sort', 'lastName');
        $sortDir = $request->query('dir', 'asc');
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(50, max(1, (int) $request->query('per_page', 10)));

        if ($status) $data = array_values(array_filter($data, fn($u) => $u['status'] === $status));
        if ($role) $data = array_values(array_filter($data, fn($u) => $u['roleName'] === $role));
        if ($dept) $data = array_values(array_filter($data, fn($u) => $u['department'] === $dept));
        if ($unit) $data = array_values(array_filter($data, fn($u) => $u['unit'] === $unit));
        if ($mfa === 'enrolled') $data = array_values(array_filter($data, fn($u) => $u['mfaEnrolled']));
        if ($mfa === 'not_enrolled') $data = array_values(array_filter($data, fn($u) => !$u['mfaEnrolled']));
        if ($search) $data = array_values(array_filter($data, fn($u) => str_contains(strtolower($u['firstName'].' '.$u['lastName'].' '.$u['email'].' '.$u['department'].' '.$u['unit']), $search)));

        usort($data, function ($a, $b) use ($sortCol, $sortDir) {
            $av = $a[$sortCol] ?? ''; $bv = $b[$sortCol] ?? '';
            $cmp = is_string($av) ? strcasecmp($av, $bv) : $av - $bv;
            return $sortDir === 'desc' ? -$cmp : $cmp;
        });

        $total = count($data);
        $paged = array_slice($data, ($page - 1) * $perPage, $perPage);
        $byStatus = ['active'=>0,'suspended'=>0,'pending'=>0,'locked'=>0,'archived'=>0];
        foreach (self::users() as $u) $byStatus[$u['status']]++;

        return response()->json([
            'data' => array_values($paged),
            'meta' => ['page'=>$page,'per_page'=>$perPage,'total'=>$total,'total_pages'=>(int)ceil($total/$perPage)],
            'counts' => $byStatus,
        ]);
    }

    /** GET /mock-api/admin/users/{id} */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = collect(self::users())->firstWhere('id', $id);
        if (!$user) return response()->json(['message'=>'User not found.','code'=>'NOT_FOUND'], 404);
        return response()->json(['data'=>$user]);
    }

    /** POST /mock-api/admin/users */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'first_name'=>['required','string','min:2','max:100'], 'last_name'=>['required','string','min:2','max:100'],
            'email'=>['required','email','max:255'], 'phone'=>['nullable','string','max:20'],
            'role_id'=>['required','integer'], 'department'=>['required','string','max:100'],
            'unit'=>['required','string','max:100'], 'notes'=>['nullable','string','max:2000'],
        ]);
        $email = strtolower($request->input('email'));
        if (collect(self::users())->firstWhere('email', $email)) {
            return response()->json(['message'=>'Email already exists.','errors'=>['email'=>['A user with this email already exists.']],'code'=>'EMAIL_TAKEN'], 422);
        }
        Log::info('Admin Users API: user created', ['email'=>$email]);
        usleep(500_000);
        return response()->json(['message'=>'User account created.','data'=>[
            'id'=>time(),'firstName'=>$request->input('first_name'),'lastName'=>$request->input('last_name'),
            'email'=>$email,'phone'=>$request->input('phone',''),'roleId'=>$request->integer('role_id'),
            'roleName'=>'Operator','status'=>'pending','mfa'=>'none','mfaEnrolled'=>false,
            'department'=>$request->input('department'),'unit'=>$request->input('unit'),
            'lastLogin'=>'Never','lastIp'=>'—','loginCount'=>0,'createdAt'=>now()->toDateString(),
            'createdBy'=>'System Administrator','failedAttempts'=>0,'activeSessions'=>0,'notes'=>$request->input('notes',''),
        ]], 201);
    }

    /** PUT /mock-api/admin/users/{id} */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = collect(self::users())->firstWhere('id', $id);
        if (!$user) return response()->json(['message'=>'User not found.','code'=>'NOT_FOUND'], 404);
        $request->validate([
            'first_name'=>['sometimes','string','min:2','max:100'], 'last_name'=>['sometimes','string','min:2','max:100'],
            'email'=>['sometimes','email','max:255'], 'phone'=>['nullable','string','max:20'],
            'role_id'=>['sometimes','integer'], 'department'=>['sometimes','string','max:100'],
            'unit'=>['sometimes','string','max:100'], 'notes'=>['nullable','string','max:2000'],
        ]);
        Log::info('Admin Users API: user updated', ['id'=>$id]);
        usleep(400_000);
        $updated = array_merge($user, array_filter([
            'firstName'=>$request->input('first_name'),'lastName'=>$request->input('last_name'),
            'email'=>$request->input('email'),'phone'=>$request->input('phone'),
            'roleId'=>$request->input('role_id'),'department'=>$request->input('department'),
            'unit'=>$request->input('unit'),'notes'=>$request->input('notes'),
        ], fn($v)=>$v!==null));
        return response()->json(['message'=>'User updated.','data'=>$updated]);
    }

    /** DELETE /mock-api/admin/users/{id} */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = collect(self::users())->firstWhere('id', $id);
        if (!$user) return response()->json(['message'=>'User not found.','code'=>'NOT_FOUND'], 404);
        if ($user['activeSessions'] > 0) {
            return response()->json(['message'=>'Cannot delete user with active sessions. Kill sessions first.','code'=>'HAS_SESSIONS'], 409);
        }
        Log::info('Admin Users API: user deleted', ['id'=>$id,'email'=>$user['email']]);
        return response()->json(['message'=>"User {$user['firstName']} {$user['lastName']} deleted.",'id'=>$id]);
    }

    /** PATCH /mock-api/admin/users/{id}/status */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status'=>['required','in:active,suspended,pending,locked,archived']]);
        $user = collect(self::users())->firstWhere('id', $id);
        if (!$user) return response()->json(['message'=>'User not found.','code'=>'NOT_FOUND'], 404);
        $ns = $request->input('status');
        Log::info('Admin Users API: status changed', ['id'=>$id,'from'=>$user['status'],'to'=>$ns]);
        return response()->json(['message'=>"Status changed to {$ns}.",'id'=>$id,'old_status'=>$user['status'],'new_status'=>$ns]);
    }

    /** POST /mock-api/admin/users/{id}/reset-password */
    public function resetPassword(Request $request, int $id): JsonResponse
    {
        $user = collect(self::users())->firstWhere('id', $id);
        if (!$user) return response()->json(['message'=>'User not found.','code'=>'NOT_FOUND'], 404);
        Log::info('Admin Users API: password reset', ['id'=>$id]);
        usleep(400_000);
        return response()->json(['message'=>"Password reset email sent to {$user['email']}.",'id'=>$id,'email'=>$user['email']]);
    }

    /** POST /mock-api/admin/users/{id}/reset-mfa */
    public function resetMfa(Request $request, int $id): JsonResponse
    {
        $user = collect(self::users())->firstWhere('id', $id);
        if (!$user) return response()->json(['message'=>'User not found.','code'=>'NOT_FOUND'], 404);
        Log::info('Admin Users API: MFA reset', ['id'=>$id]);
        return response()->json(['message'=>"MFA reset for {$user['firstName']} {$user['lastName']}. Re-enrollment required.",'id'=>$id]);
    }

    /** DELETE /mock-api/admin/users/{id}/sessions */
    public function killSessions(Request $request, int $id): JsonResponse
    {
        $user = collect(self::users())->firstWhere('id', $id);
        if (!$user) return response()->json(['message'=>'User not found.','code'=>'NOT_FOUND'], 404);
        Log::info('Admin Users API: sessions killed', ['id'=>$id,'count'=>$user['activeSessions']]);
        return response()->json(['message'=>"{$user['activeSessions']} session(s) terminated.",'id'=>$id,'sessions_killed'=>$user['activeSessions']]);
    }
}
