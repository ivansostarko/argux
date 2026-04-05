<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Records / AI Processing Mock API Tests
 */
class RecordsApiTest extends TestCase
{
    /** @test */
    public function index_returns_15_records(): void
    {
        $this->getJson('/mock-api/records')
            ->assertOk()
            ->assertJsonCount(15, 'data')
            ->assertJsonStructure(['meta' => ['total']]);
    }

    /** @test */
    public function index_filters_by_type(): void
    {
        $response = $this->getJson('/mock-api/records?type=video_transcription');
        $response->assertOk();
        foreach ($response->json('data') as $r) {
            $this->assertEquals('video_transcription', $r['type']);
        }
    }

    /** @test */
    public function index_filters_by_status(): void
    {
        $response = $this->getJson('/mock-api/records?status=completed');
        $response->assertOk();
        foreach ($response->json('data') as $r) {
            $this->assertEquals('completed', $r['status']);
        }
    }

    /** @test */
    public function index_filters_by_priority(): void
    {
        $response = $this->getJson('/mock-api/records?priority=critical');
        $response->assertOk();
        foreach ($response->json('data') as $r) {
            $this->assertEquals('critical', $r['priority']);
        }
    }

    /** @test */
    public function index_searches(): void
    {
        $response = $this->getJson('/mock-api/records?search=Horvat');
        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function show_returns_record(): void
    {
        $this->getJson('/mock-api/records/r01')
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'type', 'status', 'priority', 'title', 'sourceFile', 'aiModel', 'tags']]);
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/records/r999')->assertStatus(404);
    }

    /** @test */
    public function retry_failed_record(): void
    {
        $this->postJson('/mock-api/records/r11/retry')
            ->assertOk()
            ->assertJson(['new_status' => 'queued']);
    }

    /** @test */
    public function retry_completed_blocked(): void
    {
        $this->postJson('/mock-api/records/r01/retry')
            ->assertStatus(409)
            ->assertJson(['code' => 'NOT_FAILED']);
    }

    /** @test */
    public function retry_unknown_returns_404(): void
    {
        $this->postJson('/mock-api/records/r999/retry')->assertStatus(404);
    }

    /** @test */
    public function delete_completed_record(): void
    {
        $this->deleteJson('/mock-api/records/r01')
            ->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function delete_processing_blocked(): void
    {
        $this->deleteJson('/mock-api/records/r06')
            ->assertStatus(409)
            ->assertJson(['code' => 'RECORD_PROCESSING']);
    }

    /** @test */
    public function delete_unknown_returns_404(): void
    {
        $this->deleteJson('/mock-api/records/r999')->assertStatus(404);
    }
}
