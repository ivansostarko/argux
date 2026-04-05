<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — UAV / Drone Fleet Mock API Tests
 */
class UAVApiTest extends TestCase
{
    // ═══ LIST ═══

    /** @test */
    public function index_returns_9_uavs(): void
    {
        $this->getJson('/mock-api/uav')
            ->assertOk()
            ->assertJsonCount(9, 'data');
    }

    /** @test */
    public function index_uavs_have_structure(): void
    {
        $response = $this->getJson('/mock-api/uav');
        foreach ($response->json('data') as $u) {
            $this->assertArrayHasKey('id', $u);
            $this->assertArrayHasKey('callsign', $u);
            $this->assertArrayHasKey('model', $u);
            $this->assertArrayHasKey('type', $u);
            $this->assertArrayHasKey('status', $u);
            $this->assertArrayHasKey('batteryLevel', $u);
            $this->assertArrayHasKey('sensors', $u);
        }
    }

    /** @test */
    public function index_filters_by_status(): void
    {
        $response = $this->getJson('/mock-api/uav?status=deployed');
        $response->assertOk();
        foreach ($response->json('data') as $u) {
            $this->assertEquals('deployed', $u['status']);
        }
        $this->assertCount(2, $response->json('data'));
    }

    /** @test */
    public function index_filters_by_type(): void
    {
        $response = $this->getJson('/mock-api/uav?type=quadcopter');
        $response->assertOk();
        foreach ($response->json('data') as $u) {
            $this->assertEquals('quadcopter', $u['type']);
        }
    }

    /** @test */
    public function index_filters_by_class(): void
    {
        $response = $this->getJson('/mock-api/uav?class=tactical');
        $response->assertOk();
        foreach ($response->json('data') as $u) {
            $this->assertEquals('tactical', $u['uavClass']);
        }
    }

    /** @test */
    public function index_searches(): void
    {
        $this->getJson('/mock-api/uav?search=HAWK')
            ->assertOk()
            ->assertJsonPath('meta.total', fn ($t) => $t > 0);
    }

    // ═══ SHOW ═══

    /** @test */
    public function show_uav(): void
    {
        $response = $this->getJson('/mock-api/uav/1');
        $response->assertOk()
            ->assertJsonPath('data.callsign', 'HAWK-1')
            ->assertJsonPath('data.status', 'deployed');
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/uav/999')->assertStatus(404);
    }

    // ═══ CREATE ═══

    /** @test */
    public function store_uav(): void
    {
        $this->postJson('/mock-api/uav', [
            'callsign' => 'STORM-1',
            'model' => 'Test Drone',
            'type' => 'quadcopter',
            'uavClass' => 'surveillance',
        ])->assertStatus(201)
          ->assertJsonStructure(['message', 'data' => ['id', 'callsign', 'status']]);
    }

    /** @test */
    public function store_validation(): void
    {
        $this->postJson('/mock-api/uav', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['callsign', 'model', 'type', 'uavClass']);
    }

    /** @test */
    public function store_invalid_type(): void
    {
        $this->postJson('/mock-api/uav', [
            'callsign' => 'X', 'model' => 'X', 'type' => 'helicopter', 'uavClass' => 'tactical',
        ])->assertStatus(422)->assertJsonValidationErrors(['type']);
    }

    // ═══ UPDATE ═══

    /** @test */
    public function update_uav(): void
    {
        $this->putJson('/mock-api/uav/1', ['notes' => 'Updated notes'])
            ->assertOk()
            ->assertJsonStructure(['message', 'data']);
    }

    /** @test */
    public function update_unknown_returns_404(): void
    {
        $this->putJson('/mock-api/uav/999', ['notes' => 'X'])->assertStatus(404);
    }

    // ═══ STATUS ═══

    /** @test */
    public function update_status(): void
    {
        $this->patchJson('/mock-api/uav/3/status', ['status' => 'deployed'])
            ->assertOk()
            ->assertJson(['status' => 'deployed']);
    }

    /** @test */
    public function deploy_low_battery_blocked(): void
    {
        $this->patchJson('/mock-api/uav/4/status', ['status' => 'deployed'])
            ->assertStatus(409)
            ->assertJson(['code' => 'LOW_BATTERY']);
    }

    /** @test */
    public function update_status_unknown_404(): void
    {
        $this->patchJson('/mock-api/uav/999/status', ['status' => 'operational'])
            ->assertStatus(404);
    }

    // ═══ DELETE ═══

    /** @test */
    public function delete_standby_uav(): void
    {
        $this->deleteJson('/mock-api/uav/6')
            ->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function delete_deployed_blocked(): void
    {
        $this->deleteJson('/mock-api/uav/1')
            ->assertStatus(409)
            ->assertJson(['code' => 'UAV_DEPLOYED']);
    }

    /** @test */
    public function delete_unknown_returns_404(): void
    {
        $this->deleteJson('/mock-api/uav/999')->assertStatus(404);
    }

    // ═══ STATS ═══

    /** @test */
    public function stats(): void
    {
        $response = $this->getJson('/mock-api/uav/stats');
        $response->assertOk()
            ->assertJsonStructure(['total', 'byStatus', 'deployed', 'operational', 'totalFlightHours', 'totalFlights', 'avgBattery']);
        $this->assertEquals(9, $response->json('total'));
    }
}
