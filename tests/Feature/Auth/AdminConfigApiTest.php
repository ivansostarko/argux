<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Admin Configuration Mock API Tests
 *
 * 11 tabs of form-based settings: load, save, reset, test notification, trigger backup.
 */
class AdminConfigApiTest extends TestCase
{
    // ═══ INDEX ═══

    /** @test */
    public function index_returns_tab_definitions(): void
    {
        $response = $this->getJson('/mock-api/admin/config');

        $response->assertOk()
            ->assertJsonStructure(['tabs', 'version'])
            ->assertJsonCount(11, 'tabs');
    }

    // ═══ LOAD TABS ═══

    /** @test */
    public function general_tab_returns_settings(): void
    {
        $response = $this->getJson('/mock-api/admin/config/tab/general');

        $response->assertOk()
            ->assertJsonPath('tab', 'general')
            ->assertJsonStructure(['data' => ['language', 'timezone', 'date_format', 'theme', 'font', 'clocks']]);
    }

    /** @test */
    public function security_tab_returns_settings(): void
    {
        $response = $this->getJson('/mock-api/admin/config/tab/security');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['mfa_default', 'session_timeout', 'encryption', 'ip_whitelist', 'password_policies']]);
    }

    /** @test */
    public function notifications_tab_returns_settings(): void
    {
        $response = $this->getJson('/mock-api/admin/config/tab/notifications');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['enabled', 'quiet_start', 'quiet_end', 'types', 'channels']]);
    }

    /** @test */
    public function map_tab_returns_settings(): void
    {
        $response = $this->getJson('/mock-api/admin/config/tab/map');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['center_lat', 'center_lng', 'zoom', 'tile_provider', 'layers']]);
    }

    /** @test */
    public function retention_tab_returns_settings(): void
    {
        $response = $this->getJson('/mock-api/admin/config/tab/retention');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['events', 'logs', 'media', 'audit', 'auto_purge']]);
    }

    /** @test */
    public function backup_tab_returns_history(): void
    {
        $response = $this->getJson('/mock-api/admin/config/tab/backup');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['frequency', 'type', 'encrypt', 'databases', 'history']]);
    }

    /** @test */
    public function ai_tab_returns_functions(): void
    {
        $response = $this->getJson('/mock-api/admin/config/tab/ai');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['functions']]);
        $this->assertCount(5, $response->json('data.functions'));
    }

    /** @test */
    public function licence_tab_returns_key_and_modules(): void
    {
        $response = $this->getJson('/mock-api/admin/config/tab/licence');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['key', 'type', 'status', 'seats', 'seats_used', 'expires', 'modules']]);
    }

    /** @test */
    public function all_11_tabs_load(): void
    {
        $tabs = ['general','security','notifications','dev','map','retention','backup','ai','storage','update','licence'];
        foreach ($tabs as $tab) {
            $this->getJson("/mock-api/admin/config/tab/{$tab}")
                ->assertOk()
                ->assertJsonPath('tab', $tab)
                ->assertJsonStructure(['data']);
        }
    }

    /** @test */
    public function invalid_tab_returns_404(): void
    {
        $this->getJson('/mock-api/admin/config/tab/bogus')->assertStatus(404);
    }

    // ═══ SAVE ═══

    /** @test */
    public function save_general_returns_success(): void
    {
        $response = $this->putJson('/mock-api/admin/config/tab/general', [
            'language' => 'hr', 'timezone' => 'UTC',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'tab', 'saved_at', 'saved_by'])
            ->assertJsonPath('tab', 'general');
    }

    /** @test */
    public function save_security_returns_success(): void
    {
        $response = $this->putJson('/mock-api/admin/config/tab/security', [
            'mfa_default' => 'SMS', 'session_timeout' => '1 hour',
        ]);

        $response->assertOk()
            ->assertJsonPath('tab', 'security');
    }

    /** @test */
    public function save_invalid_tab_returns_404(): void
    {
        $this->putJson('/mock-api/admin/config/tab/bogus', [])->assertStatus(404);
    }

    // ═══ RESET ═══

    /** @test */
    public function reset_returns_defaults(): void
    {
        $response = $this->postJson('/mock-api/admin/config/tab/general/reset');

        $response->assertOk()
            ->assertJsonStructure(['message', 'tab', 'data', 'reset_at'])
            ->assertJsonPath('tab', 'general');
    }

    /** @test */
    public function reset_invalid_tab_returns_404(): void
    {
        $this->postJson('/mock-api/admin/config/tab/bogus/reset')->assertStatus(404);
    }

    // ═══ TEST NOTIFICATION ═══

    /** @test */
    public function test_notification_email(): void
    {
        $response = $this->postJson('/mock-api/admin/config/test-notification', ['channel' => 'email']);

        $response->assertOk()
            ->assertJsonStructure(['message', 'channel', 'delivered', 'sent_at'])
            ->assertJson(['channel' => 'email', 'delivered' => true]);
    }

    /** @test */
    public function test_notification_webhook(): void
    {
        $response = $this->postJson('/mock-api/admin/config/test-notification', ['channel' => 'webhook']);

        $response->assertOk()
            ->assertJson(['channel' => 'webhook']);
    }

    /** @test */
    public function test_notification_invalid_channel(): void
    {
        $this->postJson('/mock-api/admin/config/test-notification', ['channel' => 'invalid'])
            ->assertStatus(422);
    }

    /** @test */
    public function test_notification_requires_channel(): void
    {
        $this->postJson('/mock-api/admin/config/test-notification', [])
            ->assertStatus(422);
    }

    // ═══ TRIGGER BACKUP ═══

    /** @test */
    public function trigger_full_backup(): void
    {
        $response = $this->postJson('/mock-api/admin/config/backup/trigger', ['type' => 'full']);

        $response->assertOk()
            ->assertJsonStructure(['message', 'job_id', 'type', 'estimated_duration', 'started_at'])
            ->assertJson(['type' => 'full']);
    }

    /** @test */
    public function trigger_incremental_backup(): void
    {
        $response = $this->postJson('/mock-api/admin/config/backup/trigger', ['type' => 'incremental']);

        $response->assertOk()
            ->assertJson(['type' => 'incremental']);
    }

    /** @test */
    public function trigger_backup_invalid_type(): void
    {
        $this->postJson('/mock-api/admin/config/backup/trigger', ['type' => 'invalid'])
            ->assertStatus(422);
    }

    /** @test */
    public function trigger_backup_requires_type(): void
    {
        $this->postJson('/mock-api/admin/config/backup/trigger', [])
            ->assertStatus(422);
    }
}
