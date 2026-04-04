<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Admin Authentication Mock API Tests
 *
 * Tests all /mock-api/admin/auth/* endpoints.
 * Separate admin user pool, stricter access, admin-specific error codes.
 */
class AdminLoginApiTest extends TestCase
{
    // ═══ ADMIN LOGIN ═══

    /** @test */
    public function admin_login_with_valid_credentials_returns_2fa_challenge(): void
    {
        $response = $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'admin@argux.mil',
            'password' => 'AdminArgux2026!',
        ]);

        $response->assertOk()
            ->assertJson(['requires_2fa' => true, 'mfa_method' => 'authenticator'])
            ->assertJsonStructure(['challenge_token', 'masked_email', 'user' => ['first_name', 'role']]);
    }

    /** @test */
    public function admin_login_returns_user_role(): void
    {
        $response = $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'admin@argux.mil',
            'password' => 'AdminArgux2026!',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.role', 'super_admin');
    }

    /** @test */
    public function admin_login_with_email_2fa(): void
    {
        $response = $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'security@argux.mil',
            'password' => 'SecArgux2026!',
        ]);

        $response->assertOk()
            ->assertJson(['requires_2fa' => true, 'mfa_method' => 'email']);
    }

    /** @test */
    public function admin_login_with_wrong_password_returns_422(): void
    {
        $response = $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'admin@argux.mil',
            'password' => 'wrongpassword123',
        ]);

        $response->assertStatus(422)
            ->assertJson(['code' => 'INVALID_CREDENTIALS'])
            ->assertJsonStructure(['remaining_attempts']);
    }

    /** @test */
    public function admin_login_remaining_attempts_stricter(): void
    {
        $response = $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'admin@argux.mil',
            'password' => 'wrong',
        ]);

        // Admin has max 3 attempts (stricter than operator's 5)
        $this->assertLessThanOrEqual(3, $response->json('remaining_attempts'));
    }

    /** @test */
    public function admin_login_with_unknown_email_returns_422(): void
    {
        $response = $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'nobody@unknown.com',
            'password' => 'somepassword123',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function admin_login_with_operator_email_returns_403(): void
    {
        $response = $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'operator@argux.mil',
            'password' => 'Argux2026!Secure',
        ]);

        $response->assertStatus(403)
            ->assertJson(['code' => 'NOT_ADMIN']);
    }

    /** @test */
    public function admin_login_with_analyst_email_returns_403(): void
    {
        $response = $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'analyst@argux.mil',
            'password' => 'Argux2026!Analyst',
        ]);

        $response->assertStatus(403)
            ->assertJson(['code' => 'NOT_ADMIN']);
    }

    /** @test */
    public function admin_login_with_suspended_admin_returns_403(): void
    {
        $response = $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'suspended-admin@argux.mil',
            'password' => 'SuspAdmin2026!',
        ]);

        $response->assertStatus(403)
            ->assertJson(['code' => 'ADMIN_SUSPENDED']);
    }

    /** @test */
    public function admin_login_validation_requires_fields(): void
    {
        $response = $this->postJson('/mock-api/admin/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    // ═══ ADMIN 2FA ═══

    /** @test */
    public function admin_2fa_with_valid_code_returns_token(): void
    {
        $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'admin@argux.mil',
            'password' => 'AdminArgux2026!',
        ]);

        $response = $this->postJson('/mock-api/admin/auth/2fa/verify', [
            'code' => '123456',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'token_type', 'expires_in', 'user', 'redirect'])
            ->assertJson(['redirect' => '/admin/dashboard']);
    }

    /** @test */
    public function admin_token_has_admin_prefix(): void
    {
        $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'admin@argux.mil',
            'password' => 'AdminArgux2026!',
        ]);

        $response = $this->postJson('/mock-api/admin/auth/2fa/verify', [
            'code' => '123456',
        ]);

        $response->assertOk();
        $this->assertStringStartsWith('admin_argux_', $response->json('token'));
    }

    /** @test */
    public function admin_2fa_with_invalid_code_returns_422(): void
    {
        $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'admin@argux.mil',
            'password' => 'AdminArgux2026!',
        ]);

        $response = $this->postJson('/mock-api/admin/auth/2fa/verify', [
            'code' => '000000',
        ]);

        $response->assertStatus(422)
            ->assertJson(['code' => 'INVALID_CODE']);
    }

    /** @test */
    public function admin_2fa_with_expired_code_returns_410(): void
    {
        $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'admin@argux.mil',
            'password' => 'AdminArgux2026!',
        ]);

        $response = $this->postJson('/mock-api/admin/auth/2fa/verify', [
            'code' => '999999',
        ]);

        $response->assertStatus(410)
            ->assertJson(['code' => 'CODE_EXPIRED']);
    }

    /** @test */
    public function admin_2fa_without_session_returns_400(): void
    {
        $response = $this->postJson('/mock-api/admin/auth/2fa/verify', [
            'code' => '123456',
        ]);

        $response->assertStatus(400)
            ->assertJson(['code' => 'NO_CHALLENGE']);
    }

    /** @test */
    public function admin_2fa_resend_returns_success(): void
    {
        $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'security@argux.mil',
            'password' => 'SecArgux2026!',
        ]);

        $response = $this->postJson('/mock-api/admin/auth/2fa/resend', [
            'method' => 'email',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'method', 'expires_in', 'cooldown']);
    }

    /** @test */
    public function admin_2fa_resend_without_session_returns_400(): void
    {
        $response = $this->postJson('/mock-api/admin/auth/2fa/resend', []);

        $response->assertStatus(400)
            ->assertJson(['code' => 'NO_SESSION']);
    }

    // ═══ ADMIN SESSION ═══

    /** @test */
    public function admin_logout_clears_session(): void
    {
        $response = $this->postJson('/mock-api/admin/auth/logout');

        $response->assertOk()
            ->assertJson(['redirect' => '/admin/login']);
    }

    /** @test */
    public function admin_me_returns_admin_profile(): void
    {
        $response = $this->getJson('/mock-api/admin/auth/me');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'email', 'first_name', 'role']]);
    }

    // ═══ FULL ADMIN LOGIN FLOW ═══

    /** @test */
    public function full_admin_login_flow(): void
    {
        // Step 1: Login
        $login = $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'admin@argux.mil',
            'password' => 'AdminArgux2026!',
        ]);
        $login->assertOk()->assertJson(['requires_2fa' => true]);

        // Step 2: 2FA
        $tfa = $this->postJson('/mock-api/admin/auth/2fa/verify', [
            'code' => '482901',
        ]);
        $tfa->assertOk()
            ->assertJson(['redirect' => '/admin/dashboard'])
            ->assertJsonStructure(['token', 'user']);

        // Step 3: Profile
        $me = $this->getJson('/mock-api/admin/auth/me');
        $me->assertOk();

        // Step 4: Logout
        $logout = $this->postJson('/mock-api/admin/auth/logout');
        $logout->assertOk()->assertJson(['redirect' => '/admin/login']);
    }

    /** @test */
    public function admin_shorter_token_expiry(): void
    {
        $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'admin@argux.mil',
            'password' => 'AdminArgux2026!',
        ]);

        $response = $this->postJson('/mock-api/admin/auth/2fa/verify', [
            'code' => '123456',
        ]);

        // Admin tokens expire in 30min (1800s), operator in 60min (3600s)
        $this->assertEquals(1800, $response->json('expires_in'));
    }
}
