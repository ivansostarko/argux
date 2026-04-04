<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Admin Two-Factor Authentication Mock API Tests
 *
 * Tests all /mock-api/admin/auth/2fa/* endpoints:
 *   POST /mock-api/admin/auth/2fa/verify  — OTP verification
 *   POST /mock-api/admin/auth/2fa/resend  — Resend code
 *   POST /mock-api/admin/auth/2fa/backup  — Backup code verification
 */
class Admin2faApiTest extends TestCase
{
    /** Helper: login admin to get 2FA session */
    private function loginAdmin(string $email = 'admin@argux.mil', string $password = 'AdminArgux2026!'): void
    {
        $this->postJson('/mock-api/admin/auth/login', compact('email', 'password'));
    }

    // ═══ OTP VERIFICATION ═══

    /** @test */
    public function admin_2fa_verify_with_valid_code_returns_token(): void
    {
        $this->loginAdmin();

        $response = $this->postJson('/mock-api/admin/auth/2fa/verify', ['code' => '123456']);

        $response->assertOk()
            ->assertJsonStructure(['token', 'token_type', 'expires_in', 'user', 'redirect'])
            ->assertJson(['redirect' => '/admin/dashboard']);
    }

    /** @test */
    public function admin_2fa_verify_token_has_admin_prefix(): void
    {
        $this->loginAdmin();

        $response = $this->postJson('/mock-api/admin/auth/2fa/verify', ['code' => '482901']);

        $this->assertStringStartsWith('admin_argux_', $response->json('token'));
    }

    /** @test */
    public function admin_2fa_verify_returns_user_profile(): void
    {
        $this->loginAdmin();

        $response = $this->postJson('/mock-api/admin/auth/2fa/verify', ['code' => '123456']);

        $response->assertOk()
            ->assertJsonStructure(['user' => ['id', 'email', 'first_name', 'last_name', 'role']]);
    }

    /** @test */
    public function admin_2fa_verify_with_invalid_code_returns_422(): void
    {
        $this->loginAdmin();

        $response = $this->postJson('/mock-api/admin/auth/2fa/verify', ['code' => '000000']);

        $response->assertStatus(422)
            ->assertJson(['code' => 'INVALID_CODE'])
            ->assertJsonStructure(['attempts_remaining']);
    }

    /** @test */
    public function admin_2fa_verify_with_expired_code_returns_410(): void
    {
        $this->loginAdmin();

        $response = $this->postJson('/mock-api/admin/auth/2fa/verify', ['code' => '999999']);

        $response->assertStatus(410)
            ->assertJson(['code' => 'CODE_EXPIRED']);
    }

    /** @test */
    public function admin_2fa_verify_without_session_returns_400(): void
    {
        $response = $this->postJson('/mock-api/admin/auth/2fa/verify', ['code' => '123456']);

        $response->assertStatus(400)
            ->assertJson(['code' => 'NO_CHALLENGE']);
    }

    /** @test */
    public function admin_2fa_verify_validates_code_format(): void
    {
        $this->loginAdmin();

        $response = $this->postJson('/mock-api/admin/auth/2fa/verify', ['code' => 'abc']);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    /** @test */
    public function admin_2fa_verify_requires_code(): void
    {
        $this->loginAdmin();

        $response = $this->postJson('/mock-api/admin/auth/2fa/verify', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    // ═══ RESEND CODE ═══

    /** @test */
    public function admin_2fa_resend_via_email_returns_success(): void
    {
        $this->loginAdmin('security@argux.mil', 'SecArgux2026!');

        $response = $this->postJson('/mock-api/admin/auth/2fa/resend', ['method' => 'email']);

        $response->assertOk()
            ->assertJsonStructure(['message', 'method', 'sent_to', 'expires_in', 'cooldown'])
            ->assertJson(['method' => 'email']);
    }

    /** @test */
    public function admin_2fa_resend_via_sms_returns_success(): void
    {
        $this->loginAdmin();

        $response = $this->postJson('/mock-api/admin/auth/2fa/resend', ['method' => 'sms']);

        $response->assertOk()
            ->assertJson(['method' => 'sms']);
    }

    /** @test */
    public function admin_2fa_resend_returns_masked_destination(): void
    {
        $this->loginAdmin('security@argux.mil', 'SecArgux2026!');

        $response = $this->postJson('/mock-api/admin/auth/2fa/resend', ['method' => 'email']);

        $response->assertOk();
        $sentTo = $response->json('sent_to');
        $this->assertStringContainsString('•', $sentTo);
        $this->assertStringContainsString('@argux.mil', $sentTo);
    }

    /** @test */
    public function admin_2fa_resend_without_session_returns_400(): void
    {
        $response = $this->postJson('/mock-api/admin/auth/2fa/resend', ['method' => 'email']);

        $response->assertStatus(400)
            ->assertJson(['code' => 'NO_SESSION']);
    }

    /** @test */
    public function admin_2fa_resend_returns_cooldown(): void
    {
        $this->loginAdmin();

        $response = $this->postJson('/mock-api/admin/auth/2fa/resend', ['method' => 'email']);

        $response->assertOk()
            ->assertJsonPath('cooldown', 60)
            ->assertJsonPath('expires_in', 180);
    }

    // ═══ BACKUP CODE ═══

    /** @test */
    public function admin_backup_code_with_valid_code_returns_token(): void
    {
        $this->loginAdmin();

        $response = $this->postJson('/mock-api/admin/auth/2fa/backup', ['code' => 'A7K2M9X4']);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user', 'redirect'])
            ->assertJson(['redirect' => '/admin/dashboard']);
    }

    /** @test */
    public function admin_backup_code_returns_admin_token(): void
    {
        $this->loginAdmin();

        $response = $this->postJson('/mock-api/admin/auth/2fa/backup', ['code' => 'B3N8P5Q1']);

        $this->assertStringStartsWith('admin_argux_', $response->json('token'));
    }

    /** @test */
    public function admin_backup_code_invalid_returns_422(): void
    {
        $this->loginAdmin();

        $response = $this->postJson('/mock-api/admin/auth/2fa/backup', ['code' => 'XXXXXXXX']);

        $response->assertStatus(422)
            ->assertJson(['code' => 'INVALID_BACKUP_CODE']);
    }

    /** @test */
    public function admin_backup_code_without_session_returns_400(): void
    {
        $response = $this->postJson('/mock-api/admin/auth/2fa/backup', ['code' => 'A7K2M9X4']);

        $response->assertStatus(400)
            ->assertJson(['code' => 'NO_CHALLENGE']);
    }

    /** @test */
    public function admin_backup_code_validates_format(): void
    {
        $this->loginAdmin();

        // Too short
        $response = $this->postJson('/mock-api/admin/auth/2fa/backup', ['code' => 'ABC']);
        $response->assertStatus(422)->assertJsonValidationErrors(['code']);
    }

    /** @test */
    public function admin_backup_code_rejects_special_chars(): void
    {
        $this->loginAdmin();

        $response = $this->postJson('/mock-api/admin/auth/2fa/backup', ['code' => 'A7K2-9X4']);
        $response->assertStatus(422)->assertJsonValidationErrors(['code']);
    }

    /** @test */
    public function admin_backup_code_requires_code(): void
    {
        $this->loginAdmin();

        $response = $this->postJson('/mock-api/admin/auth/2fa/backup', []);
        $response->assertStatus(422)->assertJsonValidationErrors(['code']);
    }

    // ═══ METHOD SWITCHING ═══

    /** @test */
    public function admin_can_switch_method_and_verify(): void
    {
        $this->loginAdmin();

        // Switch to email
        $resend = $this->postJson('/mock-api/admin/auth/2fa/resend', ['method' => 'email']);
        $resend->assertOk()->assertJson(['method' => 'email']);

        // Verify with code
        $verify = $this->postJson('/mock-api/admin/auth/2fa/verify', ['code' => '654321']);
        $verify->assertOk()->assertJson(['redirect' => '/admin/dashboard']);
    }

    // ═══ FULL FLOW ═══

    /** @test */
    public function full_admin_2fa_otp_flow(): void
    {
        // Login
        $login = $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'admin@argux.mil', 'password' => 'AdminArgux2026!',
        ]);
        $login->assertOk()->assertJson(['requires_2fa' => true]);

        // Try invalid first
        $bad = $this->postJson('/mock-api/admin/auth/2fa/verify', ['code' => '000000']);
        $bad->assertStatus(422);

        // Resend
        $resend = $this->postJson('/mock-api/admin/auth/2fa/resend', ['method' => 'email']);
        $resend->assertOk();

        // Verify with valid code
        $good = $this->postJson('/mock-api/admin/auth/2fa/verify', ['code' => '482901']);
        $good->assertOk()->assertJson(['redirect' => '/admin/dashboard']);
    }

    /** @test */
    public function full_admin_2fa_backup_flow(): void
    {
        // Login
        $this->postJson('/mock-api/admin/auth/login', [
            'email' => 'admin@argux.mil', 'password' => 'AdminArgux2026!',
        ]);

        // Try invalid backup
        $bad = $this->postJson('/mock-api/admin/auth/2fa/backup', ['code' => 'XXXXXXXX']);
        $bad->assertStatus(422);

        // Valid backup
        $good = $this->postJson('/mock-api/admin/auth/2fa/backup', ['code' => 'R9T4W2K7']);
        $good->assertOk()->assertJsonStructure(['token', 'user']);
    }
}
