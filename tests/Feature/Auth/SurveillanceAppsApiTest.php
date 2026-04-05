<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Surveillance Apps Mock API Tests
 */
class SurveillanceAppsApiTest extends TestCase
{
    // ═══ LIST ═══

    /** @test */
    public function index_returns_6_apps(): void
    {
        $this->getJson('/mock-api/surveillance-apps')
            ->assertOk()
            ->assertJsonCount(6, 'data');
    }

    /** @test */
    public function index_apps_have_structure(): void
    {
        $response = $this->getJson('/mock-api/surveillance-apps');
        foreach ($response->json('data') as $a) {
            $this->assertArrayHasKey('id', $a);
            $this->assertArrayHasKey('personName', $a);
            $this->assertArrayHasKey('status', $a);
            $this->assertArrayHasKey('platform', $a);
            $this->assertArrayHasKey('battery', $a);
            $this->assertArrayHasKey('stats', $a);
            $this->assertArrayHasKey('sms', $a);
            $this->assertArrayHasKey('calls', $a);
        }
    }

    /** @test */
    public function index_filters_by_status(): void
    {
        $response = $this->getJson('/mock-api/surveillance-apps?status=Active');
        $response->assertOk();
        foreach ($response->json('data') as $a) {
            $this->assertEquals('Active', $a['status']);
        }
    }

    /** @test */
    public function index_filters_by_platform(): void
    {
        $response = $this->getJson('/mock-api/surveillance-apps?platform=iOS');
        $response->assertOk();
        foreach ($response->json('data') as $a) {
            $this->assertEquals('iOS', $a['platform']);
        }
        $this->assertCount(1, $response->json('data'));
    }

    /** @test */
    public function index_searches(): void
    {
        $response = $this->getJson('/mock-api/surveillance-apps?search=Horvat');
        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    // ═══ SHOW ═══

    /** @test */
    public function show_returns_full_app(): void
    {
        $this->getJson('/mock-api/surveillance-apps/app01')
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'personName', 'sms', 'calls', 'contacts', 'calendar', 'screenshots', 'networkInfo']]);
    }

    /** @test */
    public function show_horvat_has_sms(): void
    {
        $response = $this->getJson('/mock-api/surveillance-apps/app01');
        $this->assertGreaterThan(0, count($response->json('data.sms')));
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/surveillance-apps/app999')->assertStatus(404);
    }

    // ═══ TAB DATA ═══

    /** @test */
    public function tab_data_sms(): void
    {
        $response = $this->getJson('/mock-api/surveillance-apps/app01/data/sms');
        $response->assertOk()
            ->assertJson(['tab' => 'sms', 'appId' => 'app01']);
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function tab_data_calls(): void
    {
        $this->getJson('/mock-api/surveillance-apps/app01/data/calls')
            ->assertOk()
            ->assertJson(['tab' => 'calls']);
    }

    /** @test */
    public function tab_data_network(): void
    {
        $response = $this->getJson('/mock-api/surveillance-apps/app01/data/network');
        $response->assertOk();
        $this->assertArrayHasKey('carrier', $response->json('data'));
    }

    /** @test */
    public function tab_data_location(): void
    {
        $response = $this->getJson('/mock-api/surveillance-apps/app01/data/location');
        $response->assertOk();
        $this->assertArrayHasKey('lat', $response->json('data'));
        $this->assertArrayHasKey('lng', $response->json('data'));
    }

    /** @test */
    public function tab_data_invalid(): void
    {
        $this->getJson('/mock-api/surveillance-apps/app01/data/invalid')
            ->assertStatus(422);
    }

    // ═══ COMMAND ═══

    /** @test */
    public function command_active_agent(): void
    {
        $this->postJson('/mock-api/surveillance-apps/app01/command', ['command' => 'Take Screenshot'])
            ->assertOk()
            ->assertJson(['status' => 'sent', 'command' => 'Take Screenshot']);
    }

    /** @test */
    public function command_paused_blocked(): void
    {
        $this->postJson('/mock-api/surveillance-apps/app05/command', ['command' => 'Take Screenshot'])
            ->assertStatus(409)
            ->assertJson(['code' => 'AGENT_UNAVAILABLE']);
    }

    /** @test */
    public function command_offline_blocked(): void
    {
        $this->postJson('/mock-api/surveillance-apps/app06/command', ['command' => 'Take Screenshot'])
            ->assertStatus(409);
    }

    /** @test */
    public function command_validation(): void
    {
        $this->postJson('/mock-api/surveillance-apps/app01/command', [])
            ->assertStatus(422);
    }

    // ═══ STATUS ═══

    /** @test */
    public function update_status_active_to_paused(): void
    {
        $this->patchJson('/mock-api/surveillance-apps/app01/status', ['status' => 'Paused'])
            ->assertOk()
            ->assertJson(['status' => 'Paused']);
    }

    /** @test */
    public function update_status_offline_blocked(): void
    {
        $this->patchJson('/mock-api/surveillance-apps/app06/status', ['status' => 'Active'])
            ->assertStatus(409)
            ->assertJson(['code' => 'AGENT_OFFLINE']);
    }

    /** @test */
    public function update_status_unknown_returns_404(): void
    {
        $this->patchJson('/mock-api/surveillance-apps/app999/status', ['status' => 'Active'])
            ->assertStatus(404);
    }
}
