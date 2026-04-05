<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Profile Mock API Tests
 *
 * Personal data, password, 2FA, sessions, audit log, settings.
 */
class ProfileApiTest extends TestCase
{
    // ═══ PROFILE ═══

    /** @test */
    public function show_returns_user_profile(): void
    {
        $response = $this->getJson('/mock-api/profile');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'firstName', 'lastName', 'email', 'phone', 'role', 'department']]);
    }

    // ═══ PERSONAL DATA ═══

    /** @test */
    public function update_personal_succeeds(): void
    {
        $response = $this->putJson('/mock-api/profile/personal', [
            'first_name' => 'James', 'last_name' => 'Mitchell',
            'email' => 'j.mitchell@argux.mil', 'phone' => '+385 91 000 0001',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'data' => ['firstName', 'lastName', 'email']]);
    }

    /** @test */
    public function update_personal_requires_fields(): void
    {
        $this->putJson('/mock-api/profile/personal', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['first_name', 'last_name', 'email']);
    }

    // ═══ AVATAR ═══

    /** @test */
    public function upload_avatar_returns_url(): void
    {
        $response = $this->postJson('/mock-api/profile/avatar');

        $response->assertOk()
            ->assertJsonStructure(['message', 'avatar_url']);
    }

    // ═══ PASSWORD ═══

    /** @test */
    public function change_password_succeeds(): void
    {
        $response = $this->putJson('/mock-api/profile/password', [
            'current_password' => 'OldPassword123!',
            'password' => 'NewSecure2026!@',
            'password_confirmation' => 'NewSecure2026!@',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message']);
    }

    /** @test */
    public function change_password_wrong_current(): void
    {
        $response = $this->putJson('/mock-api/profile/password', [
            'current_password' => 'wrong',
            'password' => 'NewSecure2026!@',
            'password_confirmation' => 'NewSecure2026!@',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    }

    /** @test */
    public function change_password_requires_complexity(): void
    {
        $response = $this->putJson('/mock-api/profile/password', [
            'current_password' => 'OldPassword123!',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function change_password_must_match(): void
    {
        $response = $this->putJson('/mock-api/profile/password', [
            'current_password' => 'OldPassword123!',
            'password' => 'NewSecure2026!@',
            'password_confirmation' => 'Different2026!@',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password_confirmation']);
    }

    // ═══ SECURITY ═══

    /** @test */
    public function security_returns_2fa_and_sessions(): void
    {
        $response = $this->getJson('/mock-api/profile/security');

        $response->assertOk()
            ->assertJsonStructure(['mfa_method', 'mfa_phone', 'recovery_phone', 'sessions', 'stats' => ['total_logins', 'failed_attempts', 'active_sessions']]);
    }

    // ═══ 2FA ═══

    /** @test */
    public function update_2fa_succeeds(): void
    {
        $response = $this->putJson('/mock-api/profile/2fa', [
            'method' => 'sms', 'phone' => '+385 91 000 0001',
        ]);

        $response->assertOk()
            ->assertJson(['method' => 'sms']);
    }

    /** @test */
    public function update_2fa_validates_method(): void
    {
        $this->putJson('/mock-api/profile/2fa', ['method' => 'invalid'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['method']);
    }

    // ═══ BACKUP CODES ═══

    /** @test */
    public function generate_backup_codes_returns_8(): void
    {
        $response = $this->postJson('/mock-api/profile/backup-codes');

        $response->assertOk()
            ->assertJsonStructure(['message', 'codes']);
        $this->assertCount(8, $response->json('codes'));
    }

    /** @test */
    public function backup_codes_are_unique(): void
    {
        $response = $this->postJson('/mock-api/profile/backup-codes');

        $codes = $response->json('codes');
        $this->assertCount(8, array_unique($codes));
    }

    // ═══ SESSIONS ═══

    /** @test */
    public function sessions_returns_list(): void
    {
        $response = $this->getJson('/mock-api/profile/sessions');

        $response->assertOk()
            ->assertJsonStructure(['data' => [['id', 'device', 'browser', 'ip', 'location', 'current']]]);
    }

    /** @test */
    public function sessions_has_4_entries(): void
    {
        $this->getJson('/mock-api/profile/sessions')
            ->assertJsonCount(4, 'data');
    }

    /** @test */
    public function revoke_session_succeeds(): void
    {
        $response = $this->deleteJson('/mock-api/profile/sessions/s2');

        $response->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function revoke_current_session_blocked(): void
    {
        $response = $this->deleteJson('/mock-api/profile/sessions/s1');

        $response->assertStatus(403)
            ->assertJson(['code' => 'CURRENT_SESSION']);
    }

    /** @test */
    public function revoke_unknown_session_404(): void
    {
        $this->deleteJson('/mock-api/profile/sessions/s999')->assertStatus(404);
    }

    /** @test */
    public function revoke_all_sessions(): void
    {
        $response = $this->deleteJson('/mock-api/profile/sessions');

        $response->assertOk()
            ->assertJsonStructure(['message', 'revoked']);
        $this->assertEquals(3, $response->json('revoked'));
    }

    // ═══ AUDIT ═══

    /** @test */
    public function audit_returns_entries(): void
    {
        $response = $this->getJson('/mock-api/profile/audit');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['page', 'per_page', 'total', 'total_pages']]);
    }

    /** @test */
    public function audit_has_12_entries(): void
    {
        $r1 = $this->getJson('/mock-api/profile/audit?page=1');
        $r2 = $this->getJson('/mock-api/profile/audit?page=2');

        $this->assertEquals(12, $r1->json('meta.total'));
        $this->assertCount(8, $r1->json('data'));
        $this->assertCount(4, $r2->json('data'));
    }

    /** @test */
    public function audit_searches(): void
    {
        $response = $this->getJson('/mock-api/profile/audit?search=Login');

        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    // ═══ SETTINGS ═══

    /** @test */
    public function update_settings_succeeds(): void
    {
        $response = $this->putJson('/mock-api/profile/settings', [
            'language' => 'hr', 'timezone' => 'Europe/Zagreb',
            'theme' => 'tactical-dark', 'font' => 'geist',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message']);
    }
}
