<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Authentication Mock API Tests
 *
 * Tests all /mock-api/auth/* endpoints for the login flow.
 * Covers: login, 2FA, logout, refresh, forgot/reset password, sessions, audit.
 */
class LoginApiTest extends TestCase
{
    // ═══ LOGIN ENDPOINT ═══

    /** @test */
    public function login_with_valid_credentials_returns_2fa_challenge(): void
    {
        $response = $this->postJson('/mock-api/auth/login', [
            'email' => 'operator@argux.mil',
            'password' => 'Argux2026!Secure',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'requires_2fa',
                'challenge_token',
                'mfa_method',
                'masked_email',
                'masked_phone',
                'user' => ['first_name', 'avatar'],
            ])
            ->assertJson(['requires_2fa' => true, 'mfa_method' => 'authenticator']);
    }

    /** @test */
    public function login_without_mfa_returns_token_directly(): void
    {
        $response = $this->postJson('/mock-api/auth/login', [
            'email' => 'viewer@argux.mil',
            'password' => 'Argux2026!Viewer',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'message', 'token', 'token_type', 'expires_in',
                'user' => ['id', 'email', 'first_name', 'last_name', 'role'],
                'redirect',
            ])
            ->assertJson(['token_type' => 'Bearer', 'redirect' => '/map']);
    }

    /** @test */
    public function login_with_wrong_password_returns_422(): void
    {
        $response = $this->postJson('/mock-api/auth/login', [
            'email' => 'operator@argux.mil',
            'password' => 'wrongpassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure(['message', 'errors' => ['password'], 'code', 'remaining_attempts'])
            ->assertJson(['code' => 'INVALID_CREDENTIALS']);
    }

    /** @test */
    public function login_with_unknown_email_returns_422(): void
    {
        $response = $this->postJson('/mock-api/auth/login', [
            'email' => 'nobody@unknown.com',
            'password' => 'somepassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'The provided credentials do not match our records.');
    }

    /** @test */
    public function login_with_suspended_account_returns_403(): void
    {
        $response = $this->postJson('/mock-api/auth/login', [
            'email' => 'suspended@argux.mil',
            'password' => 'Argux2026!Suspended',
        ]);

        $response->assertStatus(403)
            ->assertJson(['code' => 'ACCOUNT_SUSPENDED']);
    }

    /** @test */
    public function login_with_locked_account_returns_429(): void
    {
        $response = $this->postJson('/mock-api/auth/login', [
            'email' => 'locked@argux.mil',
            'password' => 'Argux2026!Locked',
        ]);

        $response->assertStatus(429)
            ->assertJson(['code' => 'ACCOUNT_LOCKED'])
            ->assertJsonStructure(['locked_until']);
    }

    /** @test */
    public function login_validation_requires_email_and_password(): void
    {
        $response = $this->postJson('/mock-api/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    /** @test */
    public function login_validation_rejects_invalid_email_format(): void
    {
        $response = $this->postJson('/mock-api/auth/login', [
            'email' => 'not-an-email',
            'password' => 'somepassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function login_validation_rejects_short_password(): void
    {
        $response = $this->postJson('/mock-api/auth/login', [
            'email' => 'operator@argux.mil',
            'password' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    // ═══ TWO-FACTOR AUTHENTICATION ═══

    /** @test */
    public function twofa_verify_with_valid_code_returns_token(): void
    {
        // First login to get challenge
        $this->postJson('/mock-api/auth/login', [
            'email' => 'operator@argux.mil',
            'password' => 'Argux2026!Secure',
        ]);

        $response = $this->postJson('/mock-api/auth/2fa/verify', [
            'code' => '123456',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'token', 'token_type', 'expires_in', 'user', 'redirect'])
            ->assertJson(['redirect' => '/map']);
    }

    /** @test */
    public function twofa_verify_with_invalid_code_returns_422(): void
    {
        $this->postJson('/mock-api/auth/login', [
            'email' => 'operator@argux.mil',
            'password' => 'Argux2026!Secure',
        ]);

        $response = $this->postJson('/mock-api/auth/2fa/verify', [
            'code' => '000000',
        ]);

        $response->assertStatus(422)
            ->assertJson(['code' => 'INVALID_CODE'])
            ->assertJsonStructure(['attempts_remaining']);
    }

    /** @test */
    public function twofa_verify_with_expired_code_returns_410(): void
    {
        $this->postJson('/mock-api/auth/login', [
            'email' => 'operator@argux.mil',
            'password' => 'Argux2026!Secure',
        ]);

        $response = $this->postJson('/mock-api/auth/2fa/verify', [
            'code' => '999999',
        ]);

        $response->assertStatus(410)
            ->assertJson(['code' => 'CODE_EXPIRED']);
    }

    /** @test */
    public function twofa_verify_without_session_returns_400(): void
    {
        $response = $this->postJson('/mock-api/auth/2fa/verify', [
            'code' => '123456',
        ]);

        $response->assertStatus(400)
            ->assertJson(['code' => 'NO_CHALLENGE']);
    }

    /** @test */
    public function twofa_resend_returns_success(): void
    {
        $this->postJson('/mock-api/auth/login', [
            'email' => 'analyst@argux.mil',
            'password' => 'Argux2026!Analyst',
        ]);

        $response = $this->postJson('/mock-api/auth/2fa/resend', [
            'method' => 'email',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'method', 'sent_to', 'expires_in', 'cooldown']);
    }

    /** @test */
    public function twofa_code_validation_requires_6_digit_numeric(): void
    {
        $this->postJson('/mock-api/auth/login', [
            'email' => 'operator@argux.mil',
            'password' => 'Argux2026!Secure',
        ]);

        $response = $this->postJson('/mock-api/auth/2fa/verify', [
            'code' => 'abc',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    // ═══ SESSION MANAGEMENT ═══

    /** @test */
    public function logout_clears_session_and_returns_redirect(): void
    {
        $response = $this->postJson('/mock-api/auth/logout');

        $response->assertOk()
            ->assertJson(['message' => 'Successfully logged out.', 'redirect' => '/login']);
    }

    /** @test */
    public function refresh_returns_new_token(): void
    {
        // Login first
        $this->postJson('/mock-api/auth/login', [
            'email' => 'viewer@argux.mil',
            'password' => 'Argux2026!Viewer',
        ]);

        $response = $this->postJson('/mock-api/auth/refresh');

        $response->assertOk()
            ->assertJsonStructure(['token', 'token_type', 'expires_in']);
    }

    /** @test */
    public function me_returns_current_user(): void
    {
        $response = $this->getJson('/mock-api/auth/me');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'email', 'first_name', 'last_name', 'role']]);
    }

    /** @test */
    public function sessions_returns_active_sessions_list(): void
    {
        $response = $this->getJson('/mock-api/auth/sessions');

        $response->assertOk()
            ->assertJsonStructure(['data' => [['id', 'ip', 'device', 'location', 'is_current']], 'count']);
    }

    /** @test */
    public function revoke_session_returns_success(): void
    {
        $response = $this->deleteJson('/mock-api/auth/sessions/sess_abc123');

        $response->assertOk()
            ->assertJson(['message' => 'Session revoked successfully.']);
    }

    /** @test */
    public function audit_log_returns_auth_history(): void
    {
        $response = $this->getJson('/mock-api/auth/audit-log');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'action', 'ip', 'status', 'timestamp']],
                'meta' => ['total', 'page', 'per_page'],
            ]);
    }

    // ═══ PASSWORD RESET ═══

    /** @test */
    public function forgot_password_always_returns_success(): void
    {
        $response = $this->postJson('/mock-api/auth/forgot-password', [
            'email' => 'operator@argux.mil',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'masked_email', 'expires_in']);
    }

    /** @test */
    public function forgot_password_with_unknown_email_still_returns_success(): void
    {
        // Prevents email enumeration
        $response = $this->postJson('/mock-api/auth/forgot-password', [
            'email' => 'nobody@unknown.com',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message']);
    }

    /** @test */
    public function reset_password_with_valid_code_returns_success(): void
    {
        $response = $this->postJson('/mock-api/auth/reset-password', [
            'email' => 'operator@argux.mil',
            'code' => '123456',
            'password' => 'NewSecurePass2026!',
            'password_confirmation' => 'NewSecurePass2026!',
        ]);

        $response->assertOk()
            ->assertJson(['redirect' => '/login']);
    }

    /** @test */
    public function reset_password_with_invalid_code_returns_422(): void
    {
        $response = $this->postJson('/mock-api/auth/reset-password', [
            'email' => 'operator@argux.mil',
            'code' => '000000',
            'password' => 'NewSecurePass2026!',
            'password_confirmation' => 'NewSecurePass2026!',
        ]);

        $response->assertStatus(422)
            ->assertJson(['code' => 'INVALID_RESET_CODE']);
    }

    /** @test */
    public function reset_password_validation_requires_confirmation(): void
    {
        $response = $this->postJson('/mock-api/auth/reset-password', [
            'email' => 'operator@argux.mil',
            'code' => '123456',
            'password' => 'NewSecurePass2026!',
            'password_confirmation' => 'DifferentPassword!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    // ═══ FULL FLOW INTEGRATION ═══

    /** @test */
    public function full_login_flow_with_2fa(): void
    {
        // Step 1: Login
        $loginResponse = $this->postJson('/mock-api/auth/login', [
            'email' => 'operator@argux.mil',
            'password' => 'Argux2026!Secure',
        ]);
        $loginResponse->assertOk()->assertJson(['requires_2fa' => true]);

        // Step 2: Verify 2FA
        $tfaResponse = $this->postJson('/mock-api/auth/2fa/verify', [
            'code' => '123456',
            'challenge_token' => $loginResponse->json('challenge_token'),
        ]);
        $tfaResponse->assertOk()->assertJsonStructure(['token', 'user']);
        $token = $tfaResponse->json('token');

        // Step 3: Check profile
        $meResponse = $this->getJson('/mock-api/auth/me');
        $meResponse->assertOk();

        // Step 4: Refresh token
        $refreshResponse = $this->postJson('/mock-api/auth/refresh');
        $refreshResponse->assertOk()->assertJsonStructure(['token']);

        // Step 5: Logout
        $logoutResponse = $this->postJson('/mock-api/auth/logout');
        $logoutResponse->assertOk()->assertJson(['redirect' => '/login']);
    }
}
