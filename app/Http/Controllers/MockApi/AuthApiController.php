<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
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

        Log::info('Auth API: password reset requested', ['email' => $email]);
        usleep(800_000);

        $user = AuthMock::findByEmail($email);

        // Always return success to prevent email enumeration
        return response()->json([
            'message' => 'If an account exists with this email, a reset code has been sent.',
            'masked_email' => $user ? AuthMock::maskEmail($email) : AuthMock::maskEmail($email),
            'expires_in' => 600,
        ]);
    }

    /**
     * POST /mock-api/auth/reset-password
     * Reset password with code.
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
