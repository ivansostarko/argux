<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Data Sources Mock API Tests
 */
class DataSourcesApiTest extends TestCase
{
    // ═══ LIST ═══

    /** @test */
    public function index_returns_19_sources(): void
    {
        $this->getJson('/mock-api/data-sources')
            ->assertOk()
            ->assertJsonCount(19, 'data')
            ->assertJsonStructure(['meta' => ['total']]);
    }

    /** @test */
    public function index_sources_have_structure(): void
    {
        $response = $this->getJson('/mock-api/data-sources');
        foreach ($response->json('data') as $d) {
            $this->assertArrayHasKey('id', $d);
            $this->assertArrayHasKey('name', $d);
            $this->assertArrayHasKey('category', $d);
            $this->assertArrayHasKey('status', $d);
            $this->assertArrayHasKey('health', $d);
            $this->assertArrayHasKey('protocol', $d);
            $this->assertArrayHasKey('syncLog', $d);
            $this->assertArrayHasKey('tags', $d);
        }
    }

    /** @test */
    public function index_filters_by_category(): void
    {
        $response = $this->getJson('/mock-api/data-sources?category=Government');
        $response->assertOk();
        foreach ($response->json('data') as $d) {
            $this->assertEquals('Government', $d['category']);
        }
        $this->assertCount(6, $response->json('data'));
    }

    /** @test */
    public function index_filters_by_status(): void
    {
        $response = $this->getJson('/mock-api/data-sources?status=Connected');
        $response->assertOk();
        foreach ($response->json('data') as $d) {
            $this->assertEquals('Connected', $d['status']);
        }
    }

    /** @test */
    public function index_filters_by_country(): void
    {
        $response = $this->getJson('/mock-api/data-sources?country=Croatia');
        $response->assertOk();
        foreach ($response->json('data') as $d) {
            $this->assertEquals('Croatia', $d['country']);
        }
    }

    /** @test */
    public function index_searches(): void
    {
        $response = $this->getJson('/mock-api/data-sources?search=INTERPOL');
        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertStringContainsString('INTERPOL', $response->json('data.0.name'));
    }

    /** @test */
    public function index_has_all_6_categories(): void
    {
        $response = $this->getJson('/mock-api/data-sources');
        $cats = collect($response->json('data'))->pluck('category')->unique()->sort()->values();
        $this->assertCount(6, $cats);
    }

    // ═══ SHOW ═══

    /** @test */
    public function show_returns_source(): void
    {
        $this->getJson('/mock-api/data-sources/ds01')
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'name', 'category', 'protocol', 'endpoint', 'syncLog', 'dataFields', 'linkedModules']]);
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/data-sources/ds999')->assertStatus(404);
    }

    // ═══ CREATE ═══

    /** @test */
    public function store_source(): void
    {
        $this->postJson('/mock-api/data-sources', [
            'name' => 'Test Source',
            'provider' => 'Test Provider',
            'category' => 'OSINT',
            'protocol' => 'REST',
            'endpoint' => 'https://test.example.com/api',
        ])->assertStatus(201)
          ->assertJsonStructure(['message', 'data' => ['id', 'name', 'status']]);
    }

    /** @test */
    public function store_validation(): void
    {
        $this->postJson('/mock-api/data-sources', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'provider', 'category', 'protocol', 'endpoint']);
    }

    /** @test */
    public function store_invalid_category(): void
    {
        $this->postJson('/mock-api/data-sources', [
            'name' => 'Test', 'provider' => 'P', 'category' => 'Invalid', 'protocol' => 'REST', 'endpoint' => 'x',
        ])->assertStatus(422)->assertJsonValidationErrors(['category']);
    }

    // ═══ SYNC ═══

    /** @test */
    public function sync_connected_source(): void
    {
        $this->postJson('/mock-api/data-sources/ds01/sync')
            ->assertOk()
            ->assertJson(['status' => 'syncing']);
    }

    /** @test */
    public function sync_paused_blocked(): void
    {
        $this->postJson('/mock-api/data-sources/ds06/sync')
            ->assertStatus(409)
            ->assertJson(['code' => 'SOURCE_PAUSED']);
    }

    /** @test */
    public function sync_error_blocked(): void
    {
        $this->postJson('/mock-api/data-sources/ds18/sync')
            ->assertStatus(409)
            ->assertJson(['code' => 'SOURCE_ERROR']);
    }

    /** @test */
    public function sync_unknown_returns_404(): void
    {
        $this->postJson('/mock-api/data-sources/ds999/sync')->assertStatus(404);
    }

    // ═══ PAUSE/RESUME ═══

    /** @test */
    public function pause_connected_source(): void
    {
        $this->patchJson('/mock-api/data-sources/ds01/pause')
            ->assertOk()
            ->assertJson(['status' => 'Paused']);
    }

    /** @test */
    public function resume_paused_source(): void
    {
        $this->patchJson('/mock-api/data-sources/ds06/pause')
            ->assertOk()
            ->assertJson(['status' => 'Connected']);
    }

    // ═══ DELETE ═══

    /** @test */
    public function delete_source(): void
    {
        $this->deleteJson('/mock-api/data-sources/ds17')
            ->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function delete_classified_blocked(): void
    {
        $this->deleteJson('/mock-api/data-sources/ds07')
            ->assertStatus(403)
            ->assertJson(['code' => 'CLASSIFIED']);
    }

    /** @test */
    public function delete_unknown_returns_404(): void
    {
        $this->deleteJson('/mock-api/data-sources/ds999')->assertStatus(404);
    }

    // ═══ SYNC ALL ═══

    /** @test */
    public function sync_all(): void
    {
        $response = $this->postJson('/mock-api/data-sources/sync-all');
        $response->assertOk()
            ->assertJsonStructure(['message', 'count']);
        $this->assertGreaterThan(0, $response->json('count'));
    }
}
