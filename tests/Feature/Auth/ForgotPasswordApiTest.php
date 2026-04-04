<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Forgot Password Mock API Tests
 *
 * Tests the 3-step password reset flow:
 *   Step 1: POST /mock-api/auth/forgot-password
 *   Step 2: POST /mock-api/auth/verify-reset-code
 *   Step 3: POST /mock-api/auth/reset-password
 *   Extra:  POST /mock-api/auth/resend-reset-code
 */
class ForgotPasswordApiTest extends TestCase
{
    // ═══ STEP 1: REQUEST RESET CODE ═══

    /** @test */
    public function forgot_password_with_known_email_returns_success(): void
    {
        $response = $this->postJson('/mock-api/auth/forgot-password', [
            'email' => 'operator@argux.mil',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'masked_email', 'expires_in', 'cooldown'])
            ->assertJsonPath('expires_in', 600);
    }

    /** @test */
    public function forgot_password_with_unknown_email_still_returns_success(): void
    {
        // Anti-enumeration: never reveal whether email exists
        $response = $this->postJson('/mock-api/auth/forgot-password', [
            'email' => 'nobody@unknown.com',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'masked_email']);
    }

    /** @test */
    public function forgot_password_masks_email_correctly(): void
    {
        $response = $this->postJson('/mock-api/auth/forgot-password', [
            'email' => 'operator@argux.mil',
        ]);

        $response->assertOk();
        $masked = $response->json('masked_email');
        $this->assertStringContainsString('@argux.mil', $masked);
        $this->assertStringContainsString('•', $masked);
    }

    /** @test */
    public function forgot_password_requires_email(): void
    {
        $response = $this->postJson('/mock-api/auth/forgot-password', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function forgot_password_rejects_invalid_email_format(): void
    {
        $response = $this->postJson('/mock-api/auth/forgot-password', [
            'email' => 'not-an-email',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    // ═══ STEP 2: VERIFY RESET CODE ═══

    /** @test */
    public function verify_code_with_valid_code_returns_success(): void
    {
        // Step 1: request code first to set session
        $this->postJson('/mock-api/auth/forgot-password', [
            'email' => 'operator@argux.mil',
        ]);

        // Step 2: verify code
        $response = $this->postJson('/mock-api/auth/verify-reset-code', [
            'code' => '123456',
            'email' => 'operator@argux.mil',
        ]);

        $response->assertOk()
            ->assertJson(['verified' => true])
            ->assertJsonStructure(['message', 'verified', 'email']);
    }

    /** @test */
    public function verify_code_with_invalid_code_returns_422(): void
    {
        $this->postJson('/mock-api/auth/forgot-password', [
            'email' => 'operator@argux.mil',
        ]);

        $response = $this->postJson('/mock-api/auth/verify-reset-code', [
            'code' => '000000',
            'email' => 'operator@argux.mil',
        ]);

        $response->assertStatus(422)
            ->assertJson(['code' => 'INVALID_CODE'])
            ->assertJsonStructure(['attempts_remaining']);
    }

    /** @test */
    public function verify_code_with_expired_code_returns_410(): void
    {
        $this->postJson('/mock-api/auth/forgot-password', [
            'email' => 'operator@argux.mil',
        ]);

        $response = $this->postJson('/mock-api/auth/verify-reset-code', [
            'code' => '999999',
            'email' => 'operator@argux.mil',
        ]);

        $response->assertStatus(410)
            ->assertJson(['code' => 'CODE_EXPIRED']);
    }

    /** @test */
    public function verify_code_without_session_returns_400(): void
    {
        $response = $this->postJson('/mock-api/auth/verify-reset-code', [
            'code' => '123456',
        ]);

        $response->assertStatus(400)
            ->assertJson(['code' => 'NO_RESET_SESSION']);
    }

    /** @test */
    public function verify_code_requires_6_digit_numeric(): void
    {
        $this->postJson('/mock-api/auth/forgot-password', [
            'email' => 'operator@argux.mil',
        ]);

        $response = $this->postJson('/mock-api/auth/verify-reset-code', [
            'code' => 'abc',
            'email' => 'operator@argux.mil',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    /** @test */
    public function verify_code_rejects_non_numeric_code(): void
    {
        $this->postJson('/mock-api/auth/forgot-password', [
            'email' => 'operator@argux.mil',
        ]);

        $response = $this->postJson('/mock-api/auth/verify-reset-code', [
            'code' => 'abcdef',
            'email' => 'operator@argux.mil',
        ]);

        $response->assertStatus(422);
    }

    // ═══ RESEND RESET CODE ═══

    /** @test */
    public function resend_code_with_active_session_returns_success(): void
    {
        $this->postJson('/mock-api/auth/forgot-password', [
            'email' => 'operator@argux.mil',
        ]);

        $response = $this->postJson('/mock-api/auth/resend-reset-code', [
            'email' => 'operator@argux.mil',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'masked_email', 'expires_in', 'cooldown']);
    }

    /** @test */
    public function resend_code_without_session_returns_400(): void
    {
        $response = $this->postJson('/mock-api/auth/resend-reset-code', []);

        $response->assertStatus(400)
            ->assertJson(['code' => 'NO_RESET_SESSION']);
    }

    // ═══ STEP 3: RESET PASSWORD ═══

    /** @test */
    public function reset_password_with_valid_data_returns_success(): void
    {
        $response = $this->postJson('/mock-api/auth/reset-password', [
            'email' => 'operator@argux.mil',
            'code' => '123456',
            'password' => 'NewSecurePass2026!',
            'password_confirmation' => 'NewSecurePass2026!',
        ]);

        $response->assertOk()
            ->assertJson(['redirect' => '/login'])
            ->assertJsonStructure(['message', 'redirect']);
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
    public function reset_password_requires_confirmation_match(): void
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

    /** @test */
    public function reset_password_requires_minimum_12_characters(): void
    {
        $response = $this->postJson('/mock-api/auth/reset-password', [
            'email' => 'operator@argux.mil',
            'code' => '123456',
            'password' => 'Short1!',
            'password_confirmation' => 'Short1!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function reset_password_requires_all_fields(): void
    {
        $response = $this->postJson('/mock-api/auth/reset-password', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'code', 'password']);
    }

    /** @test */
    public function reset_password_requires_valid_email(): void
    {
        $response = $this->postJson('/mock-api/auth/reset-password', [
            'email' => 'invalid',
            'code' => '123456',
            'password' => 'NewSecurePass2026!',
            'password_confirmation' => 'NewSecurePass2026!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function reset_password_requires_6_char_code(): void
    {
        $response = $this->postJson('/mock-api/auth/reset-password', [
            'email' => 'operator@argux.mil',
            'code' => '12',
            'password' => 'NewSecurePass2026!',
            'password_confirmation' => 'NewSecurePass2026!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    // ═══ FULL FLOW INTEGRATION ═══

    /** @test */
    public function full_password_reset_flow(): void
    {
        // Step 1: Request code
        $step1 = $this->postJson('/mock-api/auth/forgot-password', [
            'email' => 'analyst@argux.mil',
        ]);
        $step1->assertOk();

        // Step 2: Verify code
        $step2 = $this->postJson('/mock-api/auth/verify-reset-code', [
            'code' => '482901',
            'email' => 'analyst@argux.mil',
        ]);
        $step2->assertOk()->assertJson(['verified' => true]);

        // Step 3: Reset password
        $step3 = $this->postJson('/mock-api/auth/reset-password', [
            'email' => 'analyst@argux.mil',
            'code' => '482901',
            'password' => 'BrandNewSecure2026!',
            'password_confirmation' => 'BrandNewSecure2026!',
        ]);
        $step3->assertOk()->assertJson(['redirect' => '/login']);
    }

    /** @test */
    public function flow_with_retry_on_invalid_code(): void
    {
        // Step 1
        $this->postJson('/mock-api/auth/forgot-password', [
            'email' => 'operator@argux.mil',
        ])->assertOk();

        // Step 2 — wrong code first
        $bad = $this->postJson('/mock-api/auth/verify-reset-code', [
            'code' => '000000',
            'email' => 'operator@argux.mil',
        ]);
        $bad->assertStatus(422);

        // Resend code
        $resend = $this->postJson('/mock-api/auth/resend-reset-code', [
            'email' => 'operator@argux.mil',
        ]);
        $resend->assertOk();

        // Step 2 — correct code
        $good = $this->postJson('/mock-api/auth/verify-reset-code', [
            'code' => '555555',
            'email' => 'operator@argux.mil',
        ]);
        $good->assertOk()->assertJson(['verified' => true]);
    }
}
