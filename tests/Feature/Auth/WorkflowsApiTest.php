<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Workflows Mock API Tests
 */
class WorkflowsApiTest extends TestCase
{
    // ═══ LIST ═══

    /** @test */
    public function index_returns_9_workflows(): void
    {
        $this->getJson('/mock-api/workflows')
            ->assertOk()
            ->assertJsonCount(9, 'data')
            ->assertJsonStructure(['meta' => ['total']]);
    }

    /** @test */
    public function index_workflows_have_structure(): void
    {
        $response = $this->getJson('/mock-api/workflows');
        foreach ($response->json('data') as $w) {
            $this->assertArrayHasKey('id', $w);
            $this->assertArrayHasKey('name', $w);
            $this->assertArrayHasKey('status', $w);
            $this->assertArrayHasKey('priority', $w);
            $this->assertArrayHasKey('triggers', $w);
            $this->assertArrayHasKey('actions', $w);
            $this->assertArrayHasKey('execLog', $w);
            $this->assertArrayHasKey('execCount', $w);
        }
    }

    /** @test */
    public function index_filters_by_status(): void
    {
        $response = $this->getJson('/mock-api/workflows?status=Active');
        $response->assertOk();
        foreach ($response->json('data') as $w) {
            $this->assertEquals('Active', $w['status']);
        }
        $this->assertCount(6, $response->json('data'));
    }

    /** @test */
    public function index_filters_by_operation(): void
    {
        $response = $this->getJson('/mock-api/workflows?operation=OP+HAWK');
        $response->assertOk();
        foreach ($response->json('data') as $w) {
            $this->assertEquals('OP HAWK', $w['operationName']);
        }
    }

    /** @test */
    public function index_searches(): void
    {
        $response = $this->getJson('/mock-api/workflows?search=Horvat');
        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    // ═══ SHOW ═══

    /** @test */
    public function show_returns_workflow(): void
    {
        $this->getJson('/mock-api/workflows/wf01')
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'name', 'status', 'triggers', 'actions', 'execLog', 'linkedPersonNames']]);
    }

    /** @test */
    public function show_workflow_has_triggers_and_actions(): void
    {
        $response = $this->getJson('/mock-api/workflows/wf01');
        $this->assertGreaterThan(0, count($response->json('data.triggers')));
        $this->assertGreaterThan(0, count($response->json('data.actions')));
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/workflows/wf999')->assertStatus(404);
    }

    // ═══ CREATE ═══

    /** @test */
    public function store_workflow(): void
    {
        $this->postJson('/mock-api/workflows', [
            'name' => 'Test Workflow',
            'description' => 'A test workflow for unit testing',
            'priority' => 'Medium',
            'status' => 'Draft',
        ])->assertStatus(201)
          ->assertJsonStructure(['message', 'data' => ['id', 'name', 'status']]);
    }

    /** @test */
    public function store_validation(): void
    {
        $this->postJson('/mock-api/workflows', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'description', 'priority', 'status']);
    }

    /** @test */
    public function store_invalid_priority(): void
    {
        $this->postJson('/mock-api/workflows', [
            'name' => 'Test', 'description' => 'Desc here', 'priority' => 'Urgent', 'status' => 'Draft',
        ])->assertStatus(422)->assertJsonValidationErrors(['priority']);
    }

    // ═══ STATUS UPDATE ═══

    /** @test */
    public function update_status(): void
    {
        $this->patchJson('/mock-api/workflows/wf07/status', ['status' => 'Active'])
            ->assertOk()
            ->assertJson(['status' => 'Active']);
    }

    /** @test */
    public function update_archived_to_non_draft_blocked(): void
    {
        $this->patchJson('/mock-api/workflows/wf09/status', ['status' => 'Active'])
            ->assertStatus(409)
            ->assertJson(['code' => 'INVALID_TRANSITION']);
    }

    /** @test */
    public function update_archived_to_draft_allowed(): void
    {
        $this->patchJson('/mock-api/workflows/wf09/status', ['status' => 'Draft'])
            ->assertOk()
            ->assertJson(['status' => 'Draft']);
    }

    /** @test */
    public function update_status_unknown_returns_404(): void
    {
        $this->patchJson('/mock-api/workflows/wf999/status', ['status' => 'Active'])
            ->assertStatus(404);
    }

    // ═══ DELETE ═══

    /** @test */
    public function delete_paused_workflow(): void
    {
        $this->deleteJson('/mock-api/workflows/wf07')
            ->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function delete_active_blocked(): void
    {
        $this->deleteJson('/mock-api/workflows/wf01')
            ->assertStatus(409)
            ->assertJson(['code' => 'WORKFLOW_ACTIVE']);
    }

    /** @test */
    public function delete_unknown_returns_404(): void
    {
        $this->deleteJson('/mock-api/workflows/wf999')->assertStatus(404);
    }

    // ═══ TEMPLATES ═══

    /** @test */
    public function templates_returns_list(): void
    {
        $response = $this->getJson('/mock-api/workflows/templates');
        $response->assertOk()
            ->assertJsonCount(6, 'data');
    }

    /** @test */
    public function templates_have_structure(): void
    {
        $response = $this->getJson('/mock-api/workflows/templates');
        foreach ($response->json('data') as $t) {
            $this->assertArrayHasKey('id', $t);
            $this->assertArrayHasKey('name', $t);
            $this->assertArrayHasKey('category', $t);
            $this->assertArrayHasKey('triggers', $t);
            $this->assertArrayHasKey('actions', $t);
        }
    }
}
