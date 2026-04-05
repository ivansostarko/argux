<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

/**
 * ARGUX Profile Mock REST API.
 * Personal data, password, 2FA, sessions, audit log, settings.
 */
class ProfileApiController extends Controller
{
    private static function user(): array
    {
        return [
            'id' => 1, 'firstName' => 'James', 'lastName' => 'Mitchell',
            'email' => 'j.mitchell@argux.mil', 'phone' => '+385 91 234 5847',
            'role' => 'Senior Operator', 'department' => 'Intelligence Analysis',
            'initials' => 'JM', 'avatar' => null,
            'mfa_method' => 'app', 'mfa_phone' => '+385 91 234 5847',
            'recovery_phone' => '+385 98 765 4321',
            'created_at' => '2024-06-15', 'last_login' => '2026-03-27 08:05',
        ];
    }

    private static function sessions(): array
    {
        return [
            ['id'=>'s1','device'=>'MacBook Pro 16"','browser'=>'Chrome 122.0','ip'=>'185.23.45.67','location'=>'Zagreb, HR','lastActive'=>'Now','current'=>true,'trusted'=>true],
            ['id'=>'s2','device'=>'iPhone 15 Pro','browser'=>'Safari 17.3','ip'=>'185.23.45.68','location'=>'Zagreb, HR','lastActive'=>'12m ago','current'=>false,'trusted'=>true],
            ['id'=>'s3','device'=>'Windows Desktop','browser'=>'Firefox 124.0','ip'=>'91.207.12.34','location'=>'Split, HR','lastActive'=>'2h ago','current'=>false,'trusted'=>false],
            ['id'=>'s4','device'=>'iPad Air','browser'=>'Safari 17.2','ip'=>'185.23.45.69','location'=>'Zagreb, HR','lastActive'=>'1d ago','current'=>false,'trusted'=>true],
        ];
    }

    private static function auditLog(): array
    {
        return [
            ['id'=>1,'time'=>'2026-03-27 09:32:14','action'=>'Login','details'=>'Successful auth via 2FA (Authenticator App)','ip'=>'185.23.45.67'],
            ['id'=>2,'time'=>'2026-03-27 09:30:00','action'=>'View','details'=>'Viewed person detail: Marko Horvat (#1)','ip'=>'185.23.45.67'],
            ['id'=>3,'time'=>'2026-03-27 09:25:18','action'=>'Export','details'=>'Exported intelligence report — Horvat (PDF, 23 pages)','ip'=>'185.23.45.67'],
            ['id'=>4,'time'=>'2026-03-26 17:00:00','action'=>'Logout','details'=>'Session ended normally','ip'=>'185.23.45.67'],
            ['id'=>5,'time'=>'2026-03-26 14:58:02','action'=>'Failed Login','details'=>'Invalid password — attempt 1 of 5','ip'=>'91.207.12.34'],
            ['id'=>6,'time'=>'2026-03-26 12:30:00','action'=>'Profile Updated','details'=>'Changed timezone to Europe/Zagreb','ip'=>'185.23.45.67'],
            ['id'=>7,'time'=>'2026-03-25 16:45:00','action'=>'Password Changed','details'=>'Password updated, all other sessions revoked','ip'=>'185.23.45.67'],
            ['id'=>8,'time'=>'2026-03-25 10:15:00','action'=>'2FA Updated','details'=>'Changed 2FA method from SMS to Authenticator App','ip'=>'185.23.45.67'],
            ['id'=>9,'time'=>'2026-03-24 08:00:00','action'=>'Login','details'=>'Successful auth via 2FA (SMS)','ip'=>'185.23.45.68'],
            ['id'=>10,'time'=>'2026-03-23 14:20:00','action'=>'Backup Codes','details'=>'Generated 8 new backup codes','ip'=>'185.23.45.67'],
            ['id'=>11,'time'=>'2026-03-22 09:00:00','action'=>'Login','details'=>'Successful auth via 2FA (Authenticator App)','ip'=>'185.23.45.67'],
            ['id'=>12,'time'=>'2026-03-20 11:30:00','action'=>'Settings Changed','details'=>'Theme changed to Tactical Dark','ip'=>'185.23.45.67'],
        ];
    }

    /** GET /mock-api/profile */
    public function show(): JsonResponse
    {
        return response()->json(['data' => self::user()]);
    }

    /** PUT /mock-api/profile/personal */
    public function updatePersonal(Request $request): JsonResponse
    {
        $request->validate([
            'first_name' => ['required','string','min:2','max:100'],
            'last_name' => ['required','string','min:2','max:100'],
            'email' => ['required','email','max:255'],
            'phone' => ['nullable','string','max:20'],
        ]);
        Log::info('Profile API: personal data updated', ['email' => $request->input('email')]);
        usleep(500_000);
        return response()->json([
            'message' => 'Personal data updated successfully.',
            'data' => array_merge(self::user(), [
                'firstName' => $request->input('first_name'),
                'lastName' => $request->input('last_name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone', ''),
            ]),
        ]);
    }

    /** POST /mock-api/profile/avatar */
    public function uploadAvatar(Request $request): JsonResponse
    {
        Log::info('Profile API: avatar uploaded');
        usleep(600_000);
        return response()->json([
            'message' => 'Avatar uploaded successfully.',
            'avatar_url' => '/images/avatars/user-' . Str::random(8) . '.jpg',
        ]);
    }

    /** PUT /mock-api/profile/password */
    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required','string'],
            'password' => ['required','string', Password::min(12)->mixedCase()->numbers()->symbols()],
            'password_confirmation' => ['required','same:password'],
        ]);
        if ($request->input('current_password') === 'wrong') {
            return response()->json([
                'message' => 'Current password is incorrect.',
                'errors' => ['current_password' => ['The current password is incorrect.']],
            ], 422);
        }
        Log::info('Profile API: password changed');
        usleep(800_000);
        return response()->json(['message' => 'Password changed. All other sessions have been revoked.']);
    }

    /** GET /mock-api/profile/security */
    public function security(): JsonResponse
    {
        $user = self::user();
        return response()->json([
            'mfa_method' => $user['mfa_method'],
            'mfa_phone' => $user['mfa_phone'],
            'recovery_phone' => $user['recovery_phone'],
            'sessions' => self::sessions(),
            'stats' => ['total_logins' => 142, 'failed_attempts' => 7, 'active_sessions' => count(self::sessions())],
        ]);
    }

    /** PUT /mock-api/profile/2fa */
    public function update2fa(Request $request): JsonResponse
    {
        $request->validate([
            'method' => ['required','in:app,sms,email'],
            'phone' => ['nullable','string','max:20'],
            'recovery_phone' => ['nullable','string','max:20'],
        ]);
        Log::info('Profile API: 2FA updated', ['method' => $request->input('method')]);
        usleep(400_000);
        return response()->json(['message' => '2FA settings updated.', 'method' => $request->input('method')]);
    }

    /** POST /mock-api/profile/backup-codes */
    public function generateBackupCodes(): JsonResponse
    {
        Log::info('Profile API: backup codes generated');
        usleep(500_000);
        $codes = array_map(fn() => strtoupper(Str::random(4) . '-' . Str::random(4)), range(1, 8));
        return response()->json(['message' => '8 backup codes generated. Store securely.', 'codes' => $codes]);
    }

    /** GET /mock-api/profile/sessions */
    public function sessions(): JsonResponse
    {
        return response()->json(['data' => self::sessions()]);
    }

    /** DELETE /mock-api/profile/sessions/{id} */
    public function revokeSession(string $id): JsonResponse
    {
        $session = collect(self::sessions())->firstWhere('id', $id);
        if (!$session) return response()->json(['message' => 'Session not found.', 'code' => 'NOT_FOUND'], 404);
        if ($session['current']) return response()->json(['message' => 'Cannot revoke current session.', 'code' => 'CURRENT_SESSION'], 403);
        Log::info('Profile API: session revoked', ['session_id' => $id]);
        return response()->json(['message' => "Session on {$session['device']} revoked.", 'id' => $id]);
    }

    /** DELETE /mock-api/profile/sessions */
    public function revokeAllSessions(): JsonResponse
    {
        $count = count(self::sessions()) - 1;
        Log::info('Profile API: all other sessions revoked', ['count' => $count]);
        return response()->json(['message' => "{$count} session(s) revoked. Only current session remains.", 'revoked' => $count]);
    }

    /** GET /mock-api/profile/audit */
    public function audit(Request $request): JsonResponse
    {
        $data = self::auditLog();
        $search = strtolower($request->query('search', ''));
        $page = max(1, (int) $request->query('page', 1));
        $perPage = 8;
        if ($search) $data = array_values(array_filter($data, fn($e) => str_contains(strtolower($e['action'].' '.$e['details'].' '.$e['ip']), $search)));
        $total = count($data);
        $paged = array_slice($data, ($page - 1) * $perPage, $perPage);
        return response()->json(['data' => array_values($paged), 'meta' => ['page' => $page, 'per_page' => $perPage, 'total' => $total, 'total_pages' => (int) ceil($total / $perPage)]]);
    }

    /** PUT /mock-api/profile/settings */
    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'language' => ['sometimes','string','max:10'],
            'timezone' => ['sometimes','string','max:50'],
            'date_format' => ['sometimes','string','max:20'],
            'theme' => ['sometimes','string','max:50'],
            'font' => ['sometimes','string','max:50'],
        ]);
        Log::info('Profile API: settings updated', $request->only(['language','timezone','theme','font']));
        usleep(400_000);
        return response()->json(['message' => 'Settings saved successfully.']);
    }
}
