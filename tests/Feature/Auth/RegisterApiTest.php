<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Registration Mock API Tests
 *
 * Tests:
 *   POST /mock-api/auth/register    — full registration
 *   POST /mock-api/auth/check-email — email availability check
 */
class RegisterApiTest extends TestCase
{
    // ═══ REGISTRATION ═══

    /** @test */
    public function register_with_valid_data_returns_success(): void
    {
        $response = $this->postJson('/mock-api/auth/register', [
            'first_name' => 'James',
            'last_name' => 'Mitchell',
            'email' => 'j.mitchell@agency.gov',
            'password' => 'SecurePass2026!@',
            'password_confirmation' => 'SecurePass2026!@',
            'agree_terms' => true,
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'message', 'registration_id', 'status', 'estimated_review',
                'submitted' => ['name', 'email', 'submitted_at'],
            ])
            ->assertJson([
                'status' => 'pending_approval',
                'estimated_review' => '24-48 hours',
            ]);
    }

    /** @test */
    public function register_returns_registration_id(): void
    {
        $response = $this->postJson('/mock-api/auth/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test.user@police.hr',
            'password' => 'MySecure2026!@',
            'password_confirmation' => 'MySecure2026!@',
            'agree_terms' => true,
        ]);

        $response->assertOk();
        $this->assertStringStartsWith('reg_', $response->json('registration_id'));
    }

    /** @test */
    public function register_with_existing_email_returns_422(): void
    {
        $response = $this->postJson('/mock-api/auth/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'operator@argux.mil',
            'password' => 'SecurePass2026!@',
            'password_confirmation' => 'SecurePass2026!@',
            'agree_terms' => true,
        ]);

        $response->assertStatus(422)
            ->assertJson(['code' => 'EMAIL_TAKEN'])
            ->assertJsonPath('errors.email.0', 'An account with this email address already exists.');
    }

    /** @test */
    public function register_with_disposable_email_returns_422(): void
    {
        $response = $this->postJson('/mock-api/auth/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'fake@tempmail.com',
            'password' => 'SecurePass2026!@',
            'password_confirmation' => 'SecurePass2026!@',
            'agree_terms' => true,
        ]);

        $response->assertStatus(422)
            ->assertJson(['code' => 'DISPOSABLE_EMAIL']);
    }

    /** @test */
    public function register_requires_all_fields(): void
    {
        $response = $this->postJson('/mock-api/auth/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'password', 'agree_terms']);
    }

    /** @test */
    public function register_requires_first_name_min_2_chars(): void
    {
        $response = $this->postJson('/mock-api/auth/register', [
            'first_name' => 'A',
            'last_name' => 'User',
            'email' => 'test@agency.gov',
            'password' => 'SecurePass2026!@',
            'password_confirmation' => 'SecurePass2026!@',
            'agree_terms' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['first_name']);
    }

    /** @test */
    public function register_requires_valid_email(): void
    {
        $response = $this->postJson('/mock-api/auth/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'not-an-email',
            'password' => 'SecurePass2026!@',
            'password_confirmation' => 'SecurePass2026!@',
            'agree_terms' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function register_requires_password_min_12_chars(): void
    {
        $response = $this->postJson('/mock-api/auth/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@agency.gov',
            'password' => 'Short1!',
            'password_confirmation' => 'Short1!',
            'agree_terms' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function register_requires_password_mixed_case(): void
    {
        $response = $this->postJson('/mock-api/auth/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@agency.gov',
            'password' => 'alllowercase123!',
            'password_confirmation' => 'alllowercase123!',
            'agree_terms' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function register_requires_password_with_number(): void
    {
        $response = $this->postJson('/mock-api/auth/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@agency.gov',
            'password' => 'NoNumbersHere!!',
            'password_confirmation' => 'NoNumbersHere!!',
            'agree_terms' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function register_requires_password_with_special_char(): void
    {
        $response = $this->postJson('/mock-api/auth/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@agency.gov',
            'password' => 'NoSpecialChar12',
            'password_confirmation' => 'NoSpecialChar12',
            'agree_terms' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function register_requires_password_confirmation_match(): void
    {
        $response = $this->postJson('/mock-api/auth/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@agency.gov',
            'password' => 'SecurePass2026!@',
            'password_confirmation' => 'DifferentPass2026!@',
            'agree_terms' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password_confirmation']);
    }

    /** @test */
    public function register_requires_terms_acceptance(): void
    {
        $response = $this->postJson('/mock-api/auth/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@agency.gov',
            'password' => 'SecurePass2026!@',
            'password_confirmation' => 'SecurePass2026!@',
            'agree_terms' => false,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['agree_terms']);
    }

    /** @test */
    public function register_masks_email_in_response(): void
    {
        $response = $this->postJson('/mock-api/auth/register', [
            'first_name' => 'James',
            'last_name' => 'Mitchell',
            'email' => 'james.mitchell@agency.gov',
            'password' => 'SecurePass2026!@',
            'password_confirmation' => 'SecurePass2026!@',
            'agree_terms' => true,
        ]);

        $response->assertOk();
        $maskedEmail = $response->json('submitted.email');
        $this->assertStringContainsString('•', $maskedEmail);
        $this->assertStringContainsString('@agency.gov', $maskedEmail);
    }

    // ═══ EMAIL CHECK ═══

    /** @test */
    public function check_email_available_returns_true(): void
    {
        $response = $this->postJson('/mock-api/auth/check-email', [
            'email' => 'newuser@agency.gov',
        ]);

        $response->assertOk()
            ->assertJson([
                'available' => true,
                'exists' => false,
                'disposable' => false,
                'approved_domain' => true,
            ]);
    }

    /** @test */
    public function check_email_existing_returns_not_available(): void
    {
        $response = $this->postJson('/mock-api/auth/check-email', [
            'email' => 'operator@argux.mil',
        ]);

        $response->assertOk()
            ->assertJson([
                'available' => false,
                'exists' => true,
            ]);
    }

    /** @test */
    public function check_email_disposable_returns_not_available(): void
    {
        $response = $this->postJson('/mock-api/auth/check-email', [
            'email' => 'user@tempmail.com',
        ]);

        $response->assertOk()
            ->assertJson([
                'available' => false,
                'disposable' => true,
            ]);
    }

    /** @test */
    public function check_email_approved_domain_flagged(): void
    {
        $response = $this->postJson('/mock-api/auth/check-email', [
            'email' => 'newuser@police.hr',
        ]);

        $response->assertOk()
            ->assertJson([
                'available' => true,
                'approved_domain' => true,
            ]);
    }

    /** @test */
    public function check_email_non_approved_domain(): void
    {
        $response = $this->postJson('/mock-api/auth/check-email', [
            'email' => 'user@gmail.com',
        ]);

        $response->assertOk()
            ->assertJson([
                'available' => true,
                'approved_domain' => false,
            ]);
    }

    /** @test */
    public function check_email_requires_valid_email(): void
    {
        $response = $this->postJson('/mock-api/auth/check-email', [
            'email' => 'invalid',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function check_email_requires_email_field(): void
    {
        $response = $this->postJson('/mock-api/auth/check-email', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    // ═══ FULL FLOW ═══

    /** @test */
    public function full_registration_flow_with_email_check(): void
    {
        // Step 1: Check email availability
        $check = $this->postJson('/mock-api/auth/check-email', [
            'email' => 'new.operative@soa.hr',
        ]);
        $check->assertOk()->assertJson(['available' => true, 'approved_domain' => true]);

        // Step 2: Submit registration
        $reg = $this->postJson('/mock-api/auth/register', [
            'first_name' => 'New',
            'last_name' => 'Operative',
            'email' => 'new.operative@soa.hr',
            'password' => 'SecureOperative2026!@',
            'password_confirmation' => 'SecureOperative2026!@',
            'agree_terms' => true,
        ]);
        $reg->assertOk()
            ->assertJson(['status' => 'pending_approval'])
            ->assertJsonStructure(['registration_id', 'submitted']);
    }
}
