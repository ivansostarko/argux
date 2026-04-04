<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\TwoFactorRequest;
use App\Support\Mock\AuthMock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX Mock Authentication REST API.
 *
 * Simulates full auth flow: login → 2FA → session management.
 * No database. All state in session. Mock users from AuthMock.
 */
class AuthApiController extends Controller
{
    /**
     * POST /mock-api/auth/login
     * Authenticate with email + password. Returns 2FA challenge if MFA enabled.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $email = strtolower($request->validated('email'));
        $password = $request->validated('password');

        Log::info('Auth API: login attempt', ['email' => $email, 'ip' => $request->ip()]);

        usleep(600_000); // Simulate processing

        $user = AuthMock::findByEmail($email);

        // User not found
        if (!$user) {
            Log::warning('Auth API: unknown email', ['email' => $email]);
            return response()->json([
                'message' => 'Invalid credentials.',
                'errors' => ['email' => ['The provided credentials do not match our records.']],
            ], 422);
        }

        // Account suspended
        if ($user['status'] === 'suspended') {
            Log::warning('Auth API: suspended account', ['email' => $email]);
            return response()->json([
                'message' => 'Account suspended.',
                'errors' => ['email' => ['This account has been suspended. Contact your administrator.']],
                'code' => 'ACCOUNT_SUSPENDED',
            ], 403);
        }

        // Account locked (too many failed attempts)
        if ($user['locked_until'] && now()->lt($user['locked_until'])) {
            $remaining = now()->diffInMinutes($user['locked_until']);
            Log::warning('Auth API: account locked', ['email' => $email, 'minutes_remaining' => $remaining]);
            return response()->json([
                'message' => "Account temporarily locked. Try again in {$remaining} minutes.",
                'errors' => ['email' => ["Too many failed attempts. Locked for {$remaining} more minutes."]],
                'code' => 'ACCOUNT_LOCKED',
                'locked_until' => $user['locked_until'],
            ], 429);
        }

        // Wrong password
        if ($user['password'] !== $password) {
            Log::warning('Auth API: invalid password', ['email' => $email]);
            return response()->json([
                'message' => 'Invalid credentials.',
                'errors' => ['password' => ['The provided credentials do not match our records.']],
                'code' => 'INVALID_CREDENTIALS',
                'remaining_attempts' => max(0, 5 - ($user['failed_attempts'] + 1)),
            ], 422);
        }

        // Success — check if 2FA required
        if ($user['mfa_enabled']) {
            $challengeToken = 'challenge_' . Str::random(32);
            session([
                'auth_challenge' => $challengeToken,
                'auth_user_id' => $user['id'],
                'auth_2fa_method' => $user['mfa_method'],
            ]);

            Log::info('Auth API: 2FA challenge issued', ['email' => $email, 'method' => $user['mfa_method']]);

            return response()->json([
                'message' => 'Credentials verified. Two-factor authentication required.',
                'requires_2fa' => true,
                'challenge_token' => $challengeToken,
                'mfa_method' => $user['mfa_method'],
                'masked_email' => AuthMock::maskEmail($user['email']),
                'masked_phone' => AuthMock::maskPhone($user['phone'] ?? ''),
                'user' => [
                    'first_name' => $user['first_name'],
                    'avatar' => $user['avatar'],
                ],
            ]);
        }

        // No 2FA — issue token directly
        return $this->issueToken($user, $request);
    }

    /**
     * POST /mock-api/auth/2fa/verify
     * Verify 2FA code to complete authentication.
     */
    public function verifyTwoFactor(TwoFactorRequest $request): JsonResponse
    {
        $code = $request->validated('code');
        $challengeToken = $request->input('challenge_token', session('auth_challenge'));
        $userId = session('auth_user_id');

        Log::info('Auth API: 2FA verification', ['user_id' => $userId, 'method' => session('auth_2fa_method')]);

        usleep(400_000);

        if (!$userId || !$challengeToken) {
            return response()->json([
                'message' => 'No pending 2FA challenge. Please login again.',
                'code' => 'NO_CHALLENGE',
            ], 400);
        }

        // Mock: "000000" always fails, "999999" = expired, anything else succeeds
        if ($code === '000000') {
            return response()->json([
                'message' => 'Invalid verification code.',
                'errors' => ['code' => ['The verification code is incorrect. Please try again.']],
                'code' => 'INVALID_CODE',
                'attempts_remaining' => 2,
            ], 422);
        }

        if ($code === '999999') {
            return response()->json([
                'message' => 'Verification code expired.',
                'errors' => ['code' => ['This code has expired. Request a new one.']],
                'code' => 'CODE_EXPIRED',
            ], 410);
        }

        $user = AuthMock::findById($userId);
        if (!$user) {
            return response()->json(['message' => 'User not found.', 'code' => 'USER_NOT_FOUND'], 404);
        }

        // Clear challenge
        session()->forget(['auth_challenge', 'auth_user_id', 'auth_2fa_method']);

        return $this->issueToken($user, $request);
    }

    /**
     * POST /mock-api/auth/2fa/resend
     * Resend 2FA code via selected method.
     */
    public function resendTwoFactor(Request $request): JsonResponse
    {
        $method = $request->input('method', session('auth_2fa_method', 'email'));
        $userId = session('auth_user_id');

        Log::info('Auth API: 2FA code resent', ['user_id' => $userId, 'method' => $method]);

        usleep(500_000);

        if (!$userId) {
            return response()->json(['message' => 'No pending 2FA session.', 'code' => 'NO_SESSION'], 400);
        }

        $user = AuthMock::findById($userId);
        $target = match ($method) {
            'email' => AuthMock::maskEmail($user['email'] ?? ''),
            'sms' => AuthMock::maskPhone($user['phone'] ?? ''),
            default => 'authenticator app',
        };

        return response()->json([
            'message' => "Verification code sent via {$method}.",
            'method' => $method,
            'sent_to' => $target,
            'expires_in' => 300,
            'cooldown' => 30,
        ]);
    }

    /**
     * GET /mock-api/auth/me
     * Get current authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        $userId = session('auth_user_id_active', 1); // Default to operator
        $user = AuthMock::findById($userId);

        if (!$user) {
            return response()->json(['message' => 'Not authenticated.', 'code' => 'UNAUTHENTICATED'], 401);
        }

        return response()->json([
            'data' => AuthMock::safeUser($user),
            'sessions' => count(AuthMock::sessions($userId)),
        ]);
    }

    /**
     * POST /mock-api/auth/logout
     * Invalidate current session.
     */
    public function logout(Request $request): JsonResponse
    {
        Log::info('Auth API: logout', ['user_id' => session('auth_user_id_active')]);

        session()->forget(['auth_token', 'auth_user_id_active', 'auth_challenge', 'auth_user_id', 'auth_2fa_method']);

        return response()->json([
            'message' => 'Successfully logged out.',
            'redirect' => '/login',
        ]);
    }

    /**
     * POST /mock-api/auth/refresh
     * Refresh authentication token.
     */
    public function refresh(Request $request): JsonResponse
    {
        $userId = session('auth_user_id_active');
        if (!$userId) {
            return response()->json(['message' => 'Not authenticated.', 'code' => 'UNAUTHENTICATED'], 401);
        }

        $newToken = AuthMock::generateToken();
        session(['auth_token' => $newToken]);

        return response()->json([
            'token' => $newToken,
            'token_type' => 'Bearer',
            'expires_in' => 3600,
        ]);
    }

    /**
     * POST /mock-api/auth/forgot-password
     * Request password reset code.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $email = strtolower($request->validated('email'));

        Log::info('Auth API: password reset requested', ['email' => $email, 'ip' => $request->ip()]);
        usleep(800_000);

        $user = AuthMock::findByEmail($email);

        // Store email in session for subsequent steps
        session(['reset_email' => $email, 'reset_code_sent_at' => now()->toDateTimeString()]);

        // Always return success to prevent email enumeration
        return response()->json([
            'message' => 'If an account exists with this email, a reset code has been sent.',
            'masked_email' => AuthMock::maskEmail($email),
            'expires_in' => 600,
            'cooldown' => 60,
        ]);
    }

    /**
     * POST /mock-api/auth/verify-reset-code
     * Verify the 6-digit reset code (step 2 of 3).
     */
    public function verifyResetCode(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6', 'regex:/^[0-9]{6}$/'],
            'email' => ['sometimes', 'email'],
        ]);

        $code = $request->input('code');
        $email = $request->input('email', session('reset_email', ''));

        Log::info('Auth API: reset code verification', ['email' => $email, 'ip' => $request->ip()]);
        usleep(500_000);

        if (!$email) {
            return response()->json([
                'message' => 'No reset request found. Please start over.',
                'code' => 'NO_RESET_SESSION',
            ], 400);
        }

        // Mock: "000000" = invalid, "999999" = expired, anything else = valid
        if ($code === '000000') {
            return response()->json([
                'message' => 'Invalid verification code.',
                'errors' => ['code' => ['The verification code is incorrect.']],
                'code' => 'INVALID_CODE',
                'attempts_remaining' => 2,
            ], 422);
        }

        if ($code === '999999') {
            return response()->json([
                'message' => 'Verification code has expired. Request a new one.',
                'errors' => ['code' => ['This code has expired. Please request a new code.']],
                'code' => 'CODE_EXPIRED',
            ], 410);
        }

        // Success — mark code as verified
        session(['reset_code_verified' => true]);

        return response()->json([
            'message' => 'Code verified successfully. You can now set a new password.',
            'verified' => true,
            'email' => AuthMock::maskEmail($email),
        ]);
    }

    /**
     * POST /mock-api/auth/resend-reset-code
     * Resend the password reset code.
     */
    public function resendResetCode(Request $request): JsonResponse
    {
        $email = $request->input('email', session('reset_email', ''));

        Log::info('Auth API: reset code resent', ['email' => $email, 'ip' => $request->ip()]);
        usleep(600_000);

        if (!$email) {
            return response()->json([
                'message' => 'No reset request found. Please start over.',
                'code' => 'NO_RESET_SESSION',
            ], 400);
        }

        session(['reset_code_sent_at' => now()->toDateTimeString()]);

        return response()->json([
            'message' => 'A new verification code has been sent.',
            'masked_email' => AuthMock::maskEmail($email),
            'expires_in' => 600,
            'cooldown' => 60,
        ]);
    }

    /**
     * POST /mock-api/auth/reset-password
     * Reset password with code (step 3 of 3).
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $email = strtolower($request->validated('email'));
        $code = $request->validated('code');

        Log::info('Auth API: password reset completed', ['email' => $email]);
        usleep(600_000);

        if ($code === '000000') {
            return response()->json([
                'message' => 'Invalid or expired reset code.',
                'errors' => ['code' => ['This reset code is invalid or has expired.']],
                'code' => 'INVALID_RESET_CODE',
            ], 422);
        }

        // Clear reset session
        session()->forget(['reset_email', 'reset_code_sent_at', 'reset_code_verified']);

        return response()->json([
            'message' => 'Password has been reset successfully. You can now log in.',
            'redirect' => '/login',
        ]);
    }

    /**
     * GET /mock-api/auth/sessions
     * List active sessions for current user.
     */
    public function sessions(Request $request): JsonResponse
    {
        $userId = session('auth_user_id_active', 1);
        return response()->json([
            'data' => AuthMock::sessions($userId),
            'count' => count(AuthMock::sessions($userId)),
        ]);
    }

    /**
     * DELETE /mock-api/auth/sessions/{id}
     * Revoke a specific session.
     */
    public function revokeSession(Request $request, string $id): JsonResponse
    {
        Log::info('Auth API: session revoked', ['session_id' => $id]);

        return response()->json([
            'message' => 'Session revoked successfully.',
            'session_id' => $id,
        ]);
    }

    /**
     * GET /mock-api/auth/audit-log
     * Get authentication audit log.
     */
    public function auditLog(Request $request): JsonResponse
    {
        $userId = session('auth_user_id_active', 1);
        return response()->json([
            'data' => AuthMock::auditLog($userId),
            'meta' => ['total' => 5, 'page' => 1, 'per_page' => 25],
        ]);
    }

    // ═══════════════════════════════════════════════════════════════
    // ADMIN AUTHENTICATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * POST /mock-api/admin/auth/login
     * Admin-only login. Validates against admin user pool.
     */
    public function adminLogin(LoginRequest $request): JsonResponse
    {
        $email = strtolower($request->validated('email'));
        $password = $request->validated('password');

        Log::info('Admin Auth API: login attempt', ['email' => $email, 'ip' => $request->ip()]);

        usleep(600_000);

        $user = AuthMock::findAdminByEmail($email);

        if (!$user) {
            // Also check operator pool for non-admin role error
            $opUser = AuthMock::findByEmail($email);
            if ($opUser) {
                Log::warning('Admin Auth API: non-admin tried admin login', ['email' => $email]);
                return response()->json([
                    'message' => 'Access denied. This account does not have administrator privileges.',
                    'errors' => ['email' => ['This account is not authorized for admin access.']],
                    'code' => 'NOT_ADMIN',
                ], 403);
            }

            return response()->json([
                'message' => 'Invalid credentials.',
                'errors' => ['email' => ['The provided credentials do not match our records.']],
            ], 422);
        }

        if ($user['status'] === 'suspended') {
            return response()->json([
                'message' => 'Admin account suspended.',
                'errors' => ['email' => ['This admin account has been suspended by a super administrator.']],
                'code' => 'ADMIN_SUSPENDED',
            ], 403);
        }

        if ($user['locked_until'] && now()->lt($user['locked_until'])) {
            $remaining = now()->diffInMinutes($user['locked_until']);
            return response()->json([
                'message' => "Admin account locked. Try again in {$remaining} minutes.",
                'errors' => ['email' => ["Too many failed attempts. Locked for {$remaining} minutes."]],
                'code' => 'ADMIN_LOCKED',
                'locked_until' => $user['locked_until'],
            ], 429);
        }

        if ($user['password'] !== $password) {
            return response()->json([
                'message' => 'Invalid credentials.',
                'errors' => ['password' => ['The provided credentials do not match our records.']],
                'code' => 'INVALID_CREDENTIALS',
                'remaining_attempts' => max(0, 3 - ($user['failed_attempts'] + 1)),
            ], 422);
        }

        // Admin always requires 2FA
        if ($user['mfa_enabled']) {
            $challengeToken = 'admin_challenge_' . Str::random(32);
            session([
                'admin_challenge' => $challengeToken,
                'admin_user_id' => $user['id'],
                'admin_2fa_method' => $user['mfa_method'],
            ]);

            return response()->json([
                'message' => 'Admin credentials verified. Two-factor authentication required.',
                'requires_2fa' => true,
                'challenge_token' => $challengeToken,
                'mfa_method' => $user['mfa_method'],
                'masked_email' => AuthMock::maskEmail($user['email']),
                'masked_phone' => AuthMock::maskPhone($user['phone'] ?? ''),
                'user' => [
                    'first_name' => $user['first_name'],
                    'role' => $user['role'],
                    'avatar' => $user['avatar'],
                ],
            ]);
        }

        return $this->issueAdminToken($user, $request);
    }

    /**
     * POST /mock-api/admin/auth/2fa/verify
     * Verify admin 2FA code.
     */
    public function adminVerifyTwoFactor(TwoFactorRequest $request): JsonResponse
    {
        $code = $request->validated('code');
        $userId = session('admin_user_id');

        Log::info('Admin Auth API: 2FA verification', ['user_id' => $userId]);

        usleep(400_000);

        if (!$userId) {
            return response()->json([
                'message' => 'No pending admin 2FA challenge. Please login again.',
                'code' => 'NO_CHALLENGE',
            ], 400);
        }

        if ($code === '000000') {
            return response()->json([
                'message' => 'Invalid verification code.',
                'errors' => ['code' => ['The verification code is incorrect.']],
                'code' => 'INVALID_CODE',
                'attempts_remaining' => 1,
            ], 422);
        }

        if ($code === '999999') {
            return response()->json([
                'message' => 'Verification code expired.',
                'errors' => ['code' => ['This code has expired. Request a new one.']],
                'code' => 'CODE_EXPIRED',
            ], 410);
        }

        $user = AuthMock::findAdminByEmail(
            collect(AuthMock::adminUsers())->firstWhere('id', $userId)['email'] ?? ''
        );
        if (!$user) {
            return response()->json(['message' => 'Admin user not found.', 'code' => 'USER_NOT_FOUND'], 404);
        }

        session()->forget(['admin_challenge', 'admin_user_id', 'admin_2fa_method']);

        return $this->issueAdminToken($user, $request);
    }

    /**
     * POST /mock-api/admin/auth/2fa/resend
     * Resend admin 2FA code.
     */
    public function adminResendTwoFactor(Request $request): JsonResponse
    {
        $method = $request->input('method', session('admin_2fa_method', 'email'));
        $userId = session('admin_user_id');

        Log::info('Admin Auth API: 2FA code resent', ['user_id' => $userId, 'method' => $method]);
        usleep(500_000);

        if (!$userId) {
            return response()->json(['message' => 'No pending admin 2FA session.', 'code' => 'NO_SESSION'], 400);
        }

        return response()->json([
            'message' => "Admin verification code sent via {$method}.",
            'method' => $method,
            'expires_in' => 180,
            'cooldown' => 60,
        ]);
    }

    /**
     * POST /mock-api/admin/auth/logout
     * Admin logout.
     */
    public function adminLogout(Request $request): JsonResponse
    {
        Log::info('Admin Auth API: logout', ['user_id' => session('admin_user_id_active')]);

        session()->forget(['admin_token', 'admin_user_id_active', 'admin_challenge', 'admin_user_id', 'admin_2fa_method']);

        return response()->json([
            'message' => 'Admin session terminated.',
            'redirect' => '/admin/login',
        ]);
    }

    /**
     * GET /mock-api/admin/auth/me
     * Get current admin user profile.
     */
    public function adminMe(Request $request): JsonResponse
    {
        $userId = session('admin_user_id_active', 101);
        $user = collect(AuthMock::adminUsers())->firstWhere('id', $userId);

        if (!$user) {
            return response()->json(['message' => 'Not authenticated as admin.', 'code' => 'UNAUTHENTICATED'], 401);
        }

        return response()->json([
            'data' => AuthMock::safeUser($user),
        ]);
    }

    /**
     * Issue admin auth token.
     */
    private function issueAdminToken(array $user, Request $request): JsonResponse
    {
        $token = 'admin_' . AuthMock::generateToken();

        session([
            'admin_token' => $token,
            'admin_user_id_active' => $user['id'],
        ]);

        Log::info('Admin Auth API: token issued', ['user_id' => $user['id'], 'role' => $user['role']]);

        return response()->json([
            'message' => 'Admin authentication successful.',
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => 1800,
            'user' => AuthMock::safeUser($user),
            'redirect' => '/admin/dashboard',
        ]);
    }

    /**
     * POST /mock-api/auth/register
     * Submit registration request for admin approval.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $email = strtolower($data['email']);

        Log::info('Auth API: registration submitted', [
            'email' => $email,
            'name' => $data['first_name'] . ' ' . $data['last_name'],
            'phone' => $data['phone'] ?? null,
            'ip' => $request->ip(),
        ]);

        usleep(1_200_000);

        // Check for duplicate email in mock users
        if (AuthMock::findByEmail($email)) {
            return response()->json([
                'message' => 'This email is already registered.',
                'errors' => ['email' => ['An account with this email address already exists.']],
                'code' => 'EMAIL_TAKEN',
            ], 422);
        }

        // Simulate banned domains
        $domain = substr(strrchr($email, '@'), 1);
        $banned = ['tempmail.com', 'throwaway.email', 'mailinator.com', 'guerrillamail.com'];
        if (in_array($domain, $banned)) {
            return response()->json([
                'message' => 'Disposable email addresses are not permitted.',
                'errors' => ['email' => ['Please use your official organizational email address.']],
                'code' => 'DISPOSABLE_EMAIL',
            ], 422);
        }

        // Mock: generate a pending registration
        $regId = 'reg_' . Str::random(16);

        return response()->json([
            'message' => 'Registration submitted successfully. Awaiting administrator approval.',
            'registration_id' => $regId,
            'status' => 'pending_approval',
            'estimated_review' => '24-48 hours',
            'submitted' => [
                'name' => $data['first_name'] . ' ' . $data['last_name'],
                'email' => AuthMock::maskEmail($email),
                'phone' => !empty($data['phone']) ? AuthMock::maskPhone($data['phone']) : null,
                'submitted_at' => now()->toDateTimeString(),
            ],
            'redirect' => '/login',
        ]);
    }

    /**
     * POST /mock-api/auth/check-email
     * Check email availability for registration (real-time validation).
     */
    public function checkEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $email = strtolower($request->input('email'));

        usleep(200_000);

        $exists = AuthMock::findByEmail($email) !== null;

        // Check banned domains
        $domain = substr(strrchr($email, '@'), 1);
        $banned = ['tempmail.com', 'throwaway.email', 'mailinator.com', 'guerrillamail.com'];
        $disposable = in_array($domain, $banned);

        // Check approved domains (mock organizational domains)
        $approved = ['argux.mil', 'agency.gov', 'police.hr', 'soa.hr', 'mup.hr', 'mvep.hr'];
        $isApproved = in_array($domain, $approved);

        return response()->json([
            'available' => !$exists && !$disposable,
            'exists' => $exists,
            'disposable' => $disposable,
            'approved_domain' => $isApproved,
            'message' => $exists
                ? 'This email is already registered.'
                : ($disposable ? 'Disposable emails are not allowed.' : ($isApproved ? 'Approved organizational domain.' : 'Email is available.')),
        ]);
    }

    /**
     * Issue auth token and create session.
     */
    private function issueToken(array $user, Request $request): JsonResponse
    {
        $token = AuthMock::generateToken();

        session([
            'auth_token' => $token,
            'auth_user_id_active' => $user['id'],
        ]);

        Log::info('Auth API: token issued', ['user_id' => $user['id'], 'email' => $user['email']]);

        return response()->json([
            'message' => 'Authentication successful.',
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => 3600,
            'user' => AuthMock::safeUser($user),
            'redirect' => '/map',
        ]);
    }
}
