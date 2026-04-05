<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Connections Graph Mock API Tests
 */
class ConnectionsApiTest extends TestCase
{
    // ═══ GRAPH ═══

    /** @test */
    public function index_returns_nodes_and_edges(): void
    {
        $response = $this->getJson('/mock-api/connections');
        $response->assertOk()
            ->assertJsonStructure(['nodes', 'edges', 'meta' => ['nodeCount', 'edgeCount']]);
        $this->assertCount(20, $response->json('nodes'));
        $this->assertCount(28, $response->json('edges'));
    }

    /** @test */
    public function nodes_have_structure(): void
    {
        $response = $this->getJson('/mock-api/connections');
        foreach ($response->json('nodes') as $n) {
            $this->assertArrayHasKey('id', $n);
            $this->assertArrayHasKey('type', $n);
            $this->assertArrayHasKey('label', $n);
            $this->assertContains($n['type'], ['person', 'organization']);
        }
    }

    /** @test */
    public function edges_have_structure(): void
    {
        $response = $this->getJson('/mock-api/connections');
        foreach ($response->json('edges') as $e) {
            $this->assertArrayHasKey('id', $e);
            $this->assertArrayHasKey('source', $e);
            $this->assertArrayHasKey('target', $e);
            $this->assertArrayHasKey('type', $e);
            $this->assertArrayHasKey('relationship', $e);
            $this->assertArrayHasKey('strength', $e);
        }
    }

    /** @test */
    public function index_filters_by_entity_id(): void
    {
        $response = $this->getJson('/mock-api/connections?entity_id=p-1');
        $response->assertOk();
        foreach ($response->json('edges') as $e) {
            $this->assertTrue($e['source'] === 'p-1' || $e['target'] === 'p-1');
        }
        $this->assertGreaterThan(0, $response->json('meta.edgeCount'));
    }

    /** @test */
    public function index_searches_nodes(): void
    {
        $response = $this->getJson('/mock-api/connections?search=Horvat');
        $response->assertOk();
        $this->assertGreaterThan(0, $response->json('meta.nodeCount'));
    }

    // ═══ EDGE DETAIL ═══

    /** @test */
    public function show_edge_with_nodes(): void
    {
        $response = $this->getJson('/mock-api/connections/c1');
        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'source', 'target', 'type', 'sourceNode', 'targetNode']]);
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/connections/c999')->assertStatus(404);
    }

    // ═══ CREATE ═══

    /** @test */
    public function store_connection(): void
    {
        $this->postJson('/mock-api/connections', [
            'entityA' => 'p-5', 'entityB' => 'p-6',
            'type' => 'Associate', 'relationship' => 'Unknown', 'strength' => 2,
        ])->assertStatus(201)
          ->assertJsonStructure(['message', 'data' => ['id', 'source', 'target', 'type']]);
    }

    /** @test */
    public function store_validation(): void
    {
        $this->postJson('/mock-api/connections', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['entityA', 'entityB', 'type', 'relationship', 'strength']);
    }

    /** @test */
    public function store_same_entity_blocked(): void
    {
        $this->postJson('/mock-api/connections', [
            'entityA' => 'p-1', 'entityB' => 'p-1',
            'type' => 'Self', 'relationship' => 'Good', 'strength' => 1,
        ])->assertStatus(422)->assertJsonValidationErrors(['entityB']);
    }

    /** @test */
    public function store_duplicate_blocked(): void
    {
        $this->postJson('/mock-api/connections', [
            'entityA' => 'p-1', 'entityB' => 'p-12',
            'type' => 'Test', 'relationship' => 'Good', 'strength' => 3,
        ])->assertStatus(409)->assertJson(['code' => 'DUPLICATE']);
    }

    // ═══ DELETE ═══

    /** @test */
    public function delete_connection(): void
    {
        $this->deleteJson('/mock-api/connections/c28')
            ->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function delete_unknown_returns_404(): void
    {
        $this->deleteJson('/mock-api/connections/c999')->assertStatus(404);
    }

    // ═══ NODE DETAIL ═══

    /** @test */
    public function node_detail_person(): void
    {
        $response = $this->getJson('/mock-api/connections/node/p-1');
        $response->assertOk()
            ->assertJsonStructure(['node' => ['id', 'type', 'label'], 'connections', 'connectedNodes']);
        $this->assertGreaterThan(0, count($response->json('connections')));
    }

    /** @test */
    public function node_detail_org(): void
    {
        $response = $this->getJson('/mock-api/connections/node/o-1');
        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('connections')));
    }

    /** @test */
    public function node_detail_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/connections/node/p-999')->assertStatus(404);
    }

    // ═══ TYPES ═══

    /** @test */
    public function types_returns_usage_counts(): void
    {
        $response = $this->getJson('/mock-api/connections/types');
        $response->assertOk()
            ->assertJsonStructure(['data']);
        $this->assertGreaterThan(5, count($response->json('data')));
    }
}
