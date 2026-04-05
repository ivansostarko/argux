<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Operations Mock API Tests
 */
class OperationsApiTest extends TestCase
{
    // ═══ LIST ═══

    /** @test */
    public function index_returns_5_operations(): void
    {
        $this->getJson('/mock-api/operations')
            ->assertOk()
            ->assertJsonCount(5, 'data');
    }

    /** @test */
    public function index_ops_have_structure(): void
    {
        $response = $this->getJson('/mock-api/operations');
        foreach ($response->json('data') as $o) {
            $this->assertArrayHasKey('id', $o);
            $this->assertArrayHasKey('codename', $o);
            $this->assertArrayHasKey('phase', $o);
            $this->assertArrayHasKey('priority', $o);
            $this->assertArrayHasKey('teams', $o);
            $this->assertArrayHasKey('zones', $o);
            $this->assertArrayHasKey('alertRules', $o);
            $this->assertArrayHasKey('timeline', $o);
            $this->assertArrayHasKey('checklist', $o);
            $this->assertArrayHasKey('stats', $o);
        }
    }

    /** @test */
    public function index_filters_by_phase(): void
    {
        $response = $this->getJson('/mock-api/operations?phase=Active');
        $response->assertOk();
        foreach ($response->json('data') as $o) {
            $this->assertEquals('Active', $o['phase']);
        }
        $this->assertCount(2, $response->json('data'));
    }

    /** @test */
    public function index_searches(): void
    {
        $response = $this->getJson('/mock-api/operations?search=HAWK');
        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    // ═══ SHOW ═══

    /** @test */
    public function show_returns_full_operation(): void
    {
        $response = $this->getJson('/mock-api/operations/op01');
        $response->assertOk();
        $this->assertEquals('HAWK', $response->json('data.codename'));
        $this->assertCount(3, $response->json('data.teams'));
        $this->assertCount(4, $response->json('data.zones'));
        $this->assertCount(4, $response->json('data.alertRules'));
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/operations/op999')->assertStatus(404);
    }

    // ═══ CREATE ═══

    /** @test */
    public function store_operation(): void
    {
        $this->postJson('/mock-api/operations', [
            'codename' => 'STORM',
            'name' => 'Operation STORM — Test',
            'priority' => 'High',
        ])->assertStatus(201)
          ->assertJsonStructure(['message', 'data' => ['id', 'codename', 'phase']]);
    }

    /** @test */
    public function store_validation(): void
    {
        $this->postJson('/mock-api/operations', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['codename', 'name', 'priority']);
    }

    // ═══ UPDATE ═══

    /** @test */
    public function update_operation(): void
    {
        $this->putJson('/mock-api/operations/op01', ['description' => 'Updated description'])
            ->assertOk()
            ->assertJsonStructure(['message', 'data']);
    }

    /** @test */
    public function update_unknown_returns_404(): void
    {
        $this->putJson('/mock-api/operations/op999', ['name' => 'X'])->assertStatus(404);
    }

    // ═══ PHASE ═══

    /** @test */
    public function phase_change(): void
    {
        $this->patchJson('/mock-api/operations/op04/phase', ['phase' => 'Active'])
            ->assertOk()
            ->assertJson(['phase' => 'Active']);
    }

    /** @test */
    public function phase_closed_to_active_blocked(): void
    {
        $this->patchJson('/mock-api/operations/op03/phase', ['phase' => 'Active'])
            ->assertStatus(409)
            ->assertJson(['code' => 'INVALID_TRANSITION']);
    }

    /** @test */
    public function phase_closed_to_planning_allowed(): void
    {
        $this->patchJson('/mock-api/operations/op03/phase', ['phase' => 'Planning'])
            ->assertOk();
    }

    /** @test */
    public function phase_unknown_returns_404(): void
    {
        $this->patchJson('/mock-api/operations/op999/phase', ['phase' => 'Active'])
            ->assertStatus(404);
    }

    // ═══ DELETE ═══

    /** @test */
    public function delete_closed_operation(): void
    {
        $this->deleteJson('/mock-api/operations/op03')
            ->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function delete_active_blocked(): void
    {
        $this->deleteJson('/mock-api/operations/op01')
            ->assertStatus(409)
            ->assertJson(['code' => 'OP_ACTIVE']);
    }

    /** @test */
    public function delete_unknown_returns_404(): void
    {
        $this->deleteJson('/mock-api/operations/op999')->assertStatus(404);
    }

    // ═══ EVENTS ═══

    /** @test */
    public function events_for_hawk(): void
    {
        $response = $this->getJson('/mock-api/operations/op01/events');
        $response->assertOk();
        $this->assertCount(5, $response->json('data'));
    }

    /** @test */
    public function events_filter_by_type(): void
    {
        $response = $this->getJson('/mock-api/operations/op01/events?type=alert');
        $response->assertOk();
        foreach ($response->json('data') as $e) {
            $this->assertEquals('alert', $e['type']);
        }
    }

    /** @test */
    public function events_empty_for_planning(): void
    {
        $this->getJson('/mock-api/operations/op05/events')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }
}
