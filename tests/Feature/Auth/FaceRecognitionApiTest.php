<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Face Recognition Mock API Tests
 */
class FaceRecognitionApiTest extends TestCase
{
    /** @test */
    public function index_returns_15_captures(): void
    {
        $this->getJson('/mock-api/face-recognition')
            ->assertOk()
            ->assertJsonCount(15, 'data');
    }

    /** @test */
    public function index_captures_have_structure(): void
    {
        $response = $this->getJson('/mock-api/face-recognition');
        foreach ($response->json('data') as $c) {
            $this->assertArrayHasKey('id', $c);
            $this->assertArrayHasKey('confidence', $c);
            $this->assertArrayHasKey('status', $c);
            $this->assertArrayHasKey('cameraName', $c);
            $this->assertArrayHasKey('quality', $c);
            $this->assertArrayHasKey('tags', $c);
        }
    }

    /** @test */
    public function index_filters_by_status(): void
    {
        $response = $this->getJson('/mock-api/face-recognition?status=Confirmed+Match');
        $response->assertOk();
        foreach ($response->json('data') as $c) {
            $this->assertEquals('Confirmed Match', $c['status']);
        }
    }

    /** @test */
    public function index_filters_by_person(): void
    {
        $response = $this->getJson('/mock-api/face-recognition?person_id=1');
        $response->assertOk();
        foreach ($response->json('data') as $c) {
            $this->assertEquals(1, $c['personId']);
        }
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function index_filters_by_min_confidence(): void
    {
        $response = $this->getJson('/mock-api/face-recognition?min_confidence=85');
        $response->assertOk();
        foreach ($response->json('data') as $c) {
            $this->assertGreaterThanOrEqual(85, $c['confidence']);
        }
    }

    /** @test */
    public function index_searches(): void
    {
        $this->getJson('/mock-api/face-recognition?search=warehouse')
            ->assertOk()
            ->assertJsonPath('meta.total', fn ($t) => $t > 0);
    }

    /** @test */
    public function show_capture(): void
    {
        $this->getJson('/mock-api/face-recognition/fc01')
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'personName', 'confidence', 'status', 'location', 'disguise']]);
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/face-recognition/fc999')->assertStatus(404);
    }

    /** @test */
    public function search_by_person(): void
    {
        $response = $this->postJson('/mock-api/face-recognition/search', ['person_id' => 1]);
        $response->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['total', 'model', 'inference_ms']]);
        $this->assertGreaterThan(0, $response->json('meta.total'));
    }

    /** @test */
    public function search_validation(): void
    {
        $this->postJson('/mock-api/face-recognition/search', [])
            ->assertStatus(422);
    }

    /** @test */
    public function update_status(): void
    {
        $this->patchJson('/mock-api/face-recognition/fc08/status', ['status' => 'Confirmed Match'])
            ->assertOk()
            ->assertJson(['status' => 'Confirmed Match']);
    }

    /** @test */
    public function update_status_invalid(): void
    {
        $this->patchJson('/mock-api/face-recognition/fc01/status', ['status' => 'Invalid'])
            ->assertStatus(422);
    }

    /** @test */
    public function update_status_unknown_returns_404(): void
    {
        $this->patchJson('/mock-api/face-recognition/fc999/status', ['status' => 'No Match'])
            ->assertStatus(404);
    }

    /** @test */
    public function cameras_list(): void
    {
        $response = $this->getJson('/mock-api/face-recognition/cameras');
        $response->assertOk()
            ->assertJsonCount(6, 'data');
        foreach ($response->json('data') as $c) {
            $this->assertArrayHasKey('name', $c);
            $this->assertArrayHasKey('status', $c);
        }
    }

    /** @test */
    public function stats(): void
    {
        $response = $this->getJson('/mock-api/face-recognition/stats');
        $response->assertOk()
            ->assertJsonStructure(['total', 'confirmed', 'possible', 'noMatch', 'pending', 'avgConfidence', 'model']);
        $this->assertEquals(15, $response->json('total'));
    }
}
