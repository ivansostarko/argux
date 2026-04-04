<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * ARGUX Admin Management Mock REST API.
 * CRUD for admin accounts + status toggle + password reset + session revoke.
 */
class AdminAdminsApiController extends Controller
{
    private static function admins(): array
    {
        return [
            ['id'=>1,'firstName'=>'Dragan','lastName'=>'Tomić','email'=>'tomic@argux.mil','phone'=>'+385 91 100 0001','role'=>'super_admin','status'=>'active','mfa'=>'app','mfaEnrolled'=>true,'department'=>'Command','lastLogin'=>'2026-03-27 09:32','lastIp'=>'10.0.1.10','loginCount'=>847,'createdAt'=>'2024-01-15','createdBy'=>'System','failedAttempts'=>0,'notes'=>'Primary system administrator.','sessions'=>[['id'=>'ss1','device'=>'Chrome 124 / Windows 11','ip'=>'10.0.1.10','location'=>'HQ — Room 201','lastActive'=>'2 min ago','current'=>true]],'permissions'=>['all']],
            ['id'=>2,'firstName'=>'Ivana','lastName'=>'Novak','email'=>'novak@argux.mil','phone'=>'+385 91 100 0002','role'=>'admin','status'=>'active','mfa'=>'app','mfaEnrolled'=>true,'department'=>'Analysis','lastLogin'=>'2026-03-27 08:45','lastIp'=>'10.0.1.15','loginCount'=>623,'createdAt'=>'2024-03-20','createdBy'=>'Dragan Tomić','failedAttempts'=>0,'notes'=>'Analysis division lead.','sessions'=>[['id'=>'ss3','device'=>'Chrome 124 / macOS 15','ip'=>'10.0.1.15','location'=>'HQ — Room 305','lastActive'=>'5 min ago','current'=>true]],'permissions'=>['users.read','users.write','config.read','config.write','audit.read']],
            ['id'=>3,'firstName'=>'Petar','lastName'=>'Matić','email'=>'matic@argux.mil','phone'=>'+385 91 100 0003','role'=>'admin','status'=>'active','mfa'=>'sms','mfaEnrolled'=>true,'department'=>'Field Operations','lastLogin'=>'2026-03-27 07:55','lastIp'=>'10.0.1.22','loginCount'=>412,'createdAt'=>'2024-06-10','createdBy'=>'Dragan Tomić','failedAttempts'=>0,'notes'=>'Field ops lead.','sessions'=>[],'permissions'=>['users.read','users.write','devices.manage']],
            ['id'=>4,'firstName'=>'Marina','lastName'=>'Jurić','email'=>'juric@argux.mil','phone'=>'+385 91 100 0004','role'=>'security_officer','status'=>'active','mfa'=>'app','mfaEnrolled'=>true,'department'=>'Security','lastLogin'=>'2026-03-27 08:10','lastIp'=>'10.0.2.12','loginCount'=>389,'createdAt'=>'2024-08-01','createdBy'=>'Dragan Tomić','failedAttempts'=>0,'notes'=>'Chief security officer.','sessions'=>[],'permissions'=>['audit.read','audit.export','security.manage','sessions.manage']],
            ['id'=>5,'firstName'=>'Luka','lastName'=>'Babić','email'=>'babic.admin@argux.mil','phone'=>'+385 91 100 0005','role'=>'support_agent','status'=>'active','mfa'=>'email','mfaEnrolled'=>true,'department'=>'IT Infrastructure','lastLogin'=>'2026-03-26 16:30','lastIp'=>'10.0.2.5','loginCount'=>178,'createdAt'=>'2025-01-15','createdBy'=>'Ivana Novak','failedAttempts'=>0,'notes'=>'IT support lead.','sessions'=>[],'permissions'=>['support.read','support.write','kb.read','kb.write']],
            ['id'=>6,'firstName'=>'Nikola','lastName'=>'Krajina','email'=>'krajina@argux.mil','phone'=>'+385 91 100 0006','role'=>'audit_reader','status'=>'active','mfa'=>'app','mfaEnrolled'=>true,'department'=>'Command','lastLogin'=>'2026-03-25 14:20','lastIp'=>'10.0.1.30','loginCount'=>92,'createdAt'=>'2025-04-01','createdBy'=>'Dragan Tomić','failedAttempts'=>0,'notes'=>'Compliance officer.','sessions'=>[],'permissions'=>['audit.read','audit.export']],
            ['id'=>7,'firstName'=>'Katarina','lastName'=>'Šimunović','email'=>'simunovic@argux.mil','phone'=>'+385 91 100 0007','role'=>'admin','status'=>'suspended','mfa'=>'app','mfaEnrolled'=>true,'department'=>'Intelligence','lastLogin'=>'2026-03-10 11:45','lastIp'=>'10.0.1.40','loginCount'=>234,'createdAt'=>'2024-11-20','createdBy'=>'Dragan Tomić','failedAttempts'=>0,'notes'=>'Suspended pending review.','sessions'=>[],'permissions'=>['users.read','users.write']],
            ['id'=>8,'firstName'=>'Marko','lastName'=>'Vlahović','email'=>'vlahovic@argux.mil','phone'=>'+385 91 100 0008','role'=>'support_agent','status'=>'pending','mfa'=>'none','mfaEnrolled'=>false,'department'=>'Training','lastLogin'=>'Never','lastIp'=>'—','loginCount'=>0,'createdAt'=>'2026-03-25','createdBy'=>'Ivana Novak','failedAttempts'=>0,'notes'=>'Pending MFA enrollment.','sessions'=>[],'permissions'=>['support.read','support.write']],
            ['id'=>9,'firstName'=>'Ana','lastName'=>'Perić','email'=>'peric.admin@argux.mil','phone'=>'+385 91 100 0009','role'=>'audit_reader','status'=>'pending','mfa'=>'none','mfaEnrolled'=>false,'department'=>'Analysis','lastLogin'=>'Never','lastIp'=>'—','loginCount'=>0,'createdAt'=>'2026-03-26','createdBy'=>'Ivana Novak','failedAttempts'=>0,'notes'=>'Pending approval.','sessions'=>[],'permissions'=>['audit.read']],
            ['id'=>10,'firstName'=>'Damir','lastName'=>'Kožul','email'=>'kozul@argux.mil','phone'=>'+385 91 100 0010','role'=>'admin','status'=>'locked','mfa'=>'sms','mfaEnrolled'=>true,'department'=>'Operations','lastLogin'=>'2026-03-27 03:15','lastIp'=>'192.168.50.12','loginCount'=>301,'createdAt'=>'2024-05-10','createdBy'=>'Dragan Tomić','failedAttempts'=>5,'notes'=>'LOCKED: 5 failed attempts.','sessions'=>[],'permissions'=>['users.read','users.write']],
            ['id'=>11,'firstName'=>'Josip','lastName'=>'Zelić','email'=>'zelic@argux.mil','phone'=>'+385 91 100 0011','role'=>'security_officer','status'=>'active','mfa'=>'app','mfaEnrolled'=>true,'department'=>'Security','lastLogin'=>'2026-03-27 06:00','lastIp'=>'10.0.2.14','loginCount'=>256,'createdAt'=>'2024-09-15','createdBy'=>'Dragan Tomić','failedAttempts'=>0,'notes'=>'Night shift security.','sessions'=>[],'permissions'=>['audit.read','security.manage','sessions.manage']],
            ['id'=>12,'firstName'=>'Helena','lastName'=>'Radić','email'=>'radic@argux.mil','phone'=>'+385 91 100 0012','role'=>'super_admin','status'=>'active','mfa'=>'app','mfaEnrolled'=>true,'department'=>'IT Infrastructure','lastLogin'=>'2026-03-26 22:15','lastIp'=>'10.0.2.5','loginCount'=>534,'createdAt'=>'2024-01-15','createdBy'=>'System','failedAttempts'=>0,'notes'=>'Secondary super admin.','sessions'=>[],'permissions'=>['all']],
        ];
    }

    /** GET /mock-api/admin/admins — List with search, filter, sort, pagination */
    public function index(Request $request): JsonResponse
    {
        $data = self::admins();
        $search = strtolower($request->query('search', ''));
        $status = $request->query('status', '');
        $role = $request->query('role', '');
        $dept = $request->query('department', '');
        $mfa = $request->query('mfa', '');
        $sortCol = $request->query('sort', 'lastName');
        $sortDir = $request->query('dir', 'asc');
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(50, max(1, (int) $request->query('per_page', 10)));

        if ($status) $data = array_values(array_filter($data, fn($a) => $a['status'] === $status));
        if ($role) $data = array_values(array_filter($data, fn($a) => $a['role'] === $role));
        if ($dept) $data = array_values(array_filter($data, fn($a) => $a['department'] === $dept));
        if ($mfa === 'enrolled') $data = array_values(array_filter($data, fn($a) => $a['mfaEnrolled']));
        if ($mfa === 'not_enrolled') $data = array_values(array_filter($data, fn($a) => !$a['mfaEnrolled']));
        if ($search) $data = array_values(array_filter($data, fn($a) => str_contains(strtolower($a['firstName'].' '.$a['lastName'].' '.$a['email'].' '.$a['department']), $search)));

        usort($data, function ($a, $b) use ($sortCol, $sortDir) {
            $av = $a[$sortCol] ?? ''; $bv = $b[$sortCol] ?? '';
            $cmp = is_string($av) ? strcasecmp($av, $bv) : $av - $bv;
            return $sortDir === 'desc' ? -$cmp : $cmp;
        });

        $total = count($data);
        $paged = array_slice($data, ($page - 1) * $perPage, $perPage);

        $byStatus = ['active'=>0,'suspended'=>0,'pending'=>0,'locked'=>0];
        foreach (self::admins() as $a) $byStatus[$a['status']]++;

        return response()->json([
            'data' => array_values($paged),
            'meta' => ['page' => $page, 'per_page' => $perPage, 'total' => $total, 'total_pages' => (int) ceil($total / $perPage)],
            'filters' => compact('search', 'status', 'role', 'dept', 'mfa'),
            'counts' => $byStatus,
        ]);
    }

    /** GET /mock-api/admin/admins/{id} — Single admin detail */
    public function show(Request $request, int $id): JsonResponse
    {
        $admin = collect(self::admins())->firstWhere('id', $id);
        if (!$admin) return response()->json(['message' => 'Admin not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $admin]);
    }

    /** POST /mock-api/admin/admins — Create admin */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'first_name' => ['required','string','min:2','max:100'],
            'last_name' => ['required','string','min:2','max:100'],
            'email' => ['required','email','max:255'],
            'phone' => ['nullable','string','max:20'],
            'role' => ['required','in:super_admin,admin,security_officer,audit_reader,support_agent'],
            'department' => ['required','string','max:100'],
            'notes' => ['nullable','string','max:2000'],
        ]);

        $email = strtolower($request->input('email'));
        if (collect(self::admins())->firstWhere('email', $email)) {
            return response()->json(['message' => 'Email already exists.', 'errors' => ['email' => ['An admin with this email already exists.']], 'code' => 'EMAIL_TAKEN'], 422);
        }

        Log::info('Admin API: admin created', ['email' => $email, 'role' => $request->input('role')]);
        usleep(500_000);

        $newId = time();
        return response()->json([
            'message' => 'Administrator account created successfully.',
            'data' => [
                'id' => $newId,
                'firstName' => $request->input('first_name'),
                'lastName' => $request->input('last_name'),
                'email' => $email,
                'phone' => $request->input('phone', ''),
                'role' => $request->input('role'),
                'status' => 'pending',
                'mfa' => 'none',
                'mfaEnrolled' => false,
                'department' => $request->input('department'),
                'lastLogin' => 'Never',
                'lastIp' => '—',
                'loginCount' => 0,
                'createdAt' => now()->toDateString(),
                'createdBy' => 'System Administrator',
                'failedAttempts' => 0,
                'notes' => $request->input('notes', ''),
                'sessions' => [],
                'permissions' => [],
            ],
        ], 201);
    }

    /** PUT /mock-api/admin/admins/{id} — Update admin */
    public function update(Request $request, int $id): JsonResponse
    {
        $admin = collect(self::admins())->firstWhere('id', $id);
        if (!$admin) return response()->json(['message' => 'Admin not found.', 'code' => 'NOT_FOUND'], 404);

        $request->validate([
            'first_name' => ['sometimes','string','min:2','max:100'],
            'last_name' => ['sometimes','string','min:2','max:100'],
            'email' => ['sometimes','email','max:255'],
            'phone' => ['nullable','string','max:20'],
            'role' => ['sometimes','in:super_admin,admin,security_officer,audit_reader,support_agent'],
            'department' => ['sometimes','string','max:100'],
            'notes' => ['nullable','string','max:2000'],
        ]);

        Log::info('Admin API: admin updated', ['id' => $id]);
        usleep(400_000);

        $updated = array_merge($admin, array_filter([
            'firstName' => $request->input('first_name'),
            'lastName' => $request->input('last_name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'role' => $request->input('role'),
            'department' => $request->input('department'),
            'notes' => $request->input('notes'),
        ], fn($v) => $v !== null));

        return response()->json(['message' => 'Administrator updated.', 'data' => $updated]);
    }

    /** DELETE /mock-api/admin/admins/{id} — Delete admin */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $admin = collect(self::admins())->firstWhere('id', $id);
        if (!$admin) return response()->json(['message' => 'Admin not found.', 'code' => 'NOT_FOUND'], 404);
        if ($admin['role'] === 'super_admin') {
            $superCount = collect(self::admins())->where('role', 'super_admin')->count();
            if ($superCount <= 2) {
                return response()->json(['message' => 'Cannot delete. At least 2 super admins must remain.', 'code' => 'PROTECTED_ROLE'], 403);
            }
        }
        Log::info('Admin API: admin deleted', ['id' => $id, 'email' => $admin['email']]);
        return response()->json(['message' => "Administrator {$admin['firstName']} {$admin['lastName']} deleted.", 'id' => $id]);
    }

    /** PATCH /mock-api/admin/admins/{id}/status — Toggle status */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => ['required','in:active,suspended,pending,locked']]);
        $admin = collect(self::admins())->firstWhere('id', $id);
        if (!$admin) return response()->json(['message' => 'Admin not found.', 'code' => 'NOT_FOUND'], 404);

        $newStatus = $request->input('status');
        Log::info('Admin API: status changed', ['id' => $id, 'from' => $admin['status'], 'to' => $newStatus]);

        return response()->json(['message' => "Status changed to {$newStatus}.", 'id' => $id, 'old_status' => $admin['status'], 'new_status' => $newStatus]);
    }

    /** POST /mock-api/admin/admins/{id}/reset-password — Force password reset */
    public function resetPassword(Request $request, int $id): JsonResponse
    {
        $admin = collect(self::admins())->firstWhere('id', $id);
        if (!$admin) return response()->json(['message' => 'Admin not found.', 'code' => 'NOT_FOUND'], 404);

        Log::info('Admin API: password reset forced', ['id' => $id, 'email' => $admin['email']]);
        usleep(400_000);

        return response()->json(['message' => "Password reset email sent to {$admin['email']}.", 'id' => $id, 'email' => $admin['email']]);
    }

    /** POST /mock-api/admin/admins/{id}/reset-mfa — Force MFA re-enrollment */
    public function resetMfa(Request $request, int $id): JsonResponse
    {
        $admin = collect(self::admins())->firstWhere('id', $id);
        if (!$admin) return response()->json(['message' => 'Admin not found.', 'code' => 'NOT_FOUND'], 404);

        Log::info('Admin API: MFA reset forced', ['id' => $id]);
        return response()->json(['message' => "MFA reset for {$admin['firstName']} {$admin['lastName']}. Re-enrollment required on next login.", 'id' => $id]);
    }

    /** DELETE /mock-api/admin/admins/{id}/sessions — Kill all sessions */
    public function killSessions(Request $request, int $id): JsonResponse
    {
        $admin = collect(self::admins())->firstWhere('id', $id);
        if (!$admin) return response()->json(['message' => 'Admin not found.', 'code' => 'NOT_FOUND'], 404);

        $count = count($admin['sessions']);
        Log::info('Admin API: sessions killed', ['id' => $id, 'count' => $count]);
        return response()->json(['message' => "{$count} session(s) terminated for {$admin['firstName']} {$admin['lastName']}.", 'id' => $id, 'sessions_killed' => $count]);
    }
}
