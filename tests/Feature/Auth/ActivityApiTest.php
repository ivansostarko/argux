<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Activity Log Mock API Tests
 */
class ActivityApiTest extends TestCase
{
    /** @test */
    public function index_returns_20_events(): void
    {
        $this->getJson('/mock-api/activity')
            ->assertOk()
            ->assertJsonCount(20, 'data')
            ->assertJsonStructure(['meta' => ['total']]);
    }

    /** @test */
    public function index_events_have_structure(): void
    {
        $response = $this->getJson('/mock-api/activity');
        foreach ($response->json('data') as $e) {
            $this->assertArrayHasKey('id', $e);
            $this->assertArrayHasKey('type', $e);
            $this->assertArrayHasKey('severity', $e);
            $this->assertArrayHasKey('title', $e);
            $this->assertArrayHasKey('timestamp', $e);
            $this->assertArrayHasKey('metadata', $e);
        }
    }

    /** @test */
    public function index_filters_by_type(): void
    {
        $response = $this->getJson('/mock-api/activity?type=alert');
        $response->assertOk();
        foreach ($response->json('data') as $e) {
            $this->assertEquals('alert', $e['type']);
        }
    }

    /** @test */
    public function index_filters_by_severity(): void
    {
        $response = $this->getJson('/mock-api/activity?severity=critical');
        $response->assertOk();
        foreach ($response->json('data') as $e) {
            $this->assertEquals('critical', $e['severity']);
        }
    }

    /** @test */
    public function index_filters_by_person(): void
    {
        $response = $this->getJson('/mock-api/activity?person_id=1');
        $response->assertOk();
        foreach ($response->json('data') as $e) {
            $this->assertEquals(1, $e['personId']);
        }
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function index_searches(): void
    {
        $response = $this->getJson('/mock-api/activity?search=Horvat');
        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function index_has_all_12_event_types(): void
    {
        $response = $this->getJson('/mock-api/activity');
        $types = collect($response->json('data'))->pluck('type')->unique()->sort()->values();
        $expected = ['alert', 'audio', 'camera', 'face', 'gps', 'lpr', 'phone', 'record', 'system', 'video', 'workflow', 'zone'];
        $this->assertEquals($expected, $types->toArray());
    }

    /** @test */
    public function show_returns_event(): void
    {
        $this->getJson('/mock-api/activity/ev01')
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'type', 'severity', 'title', 'description', 'lat', 'lng', 'metadata']]);
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/activity/ev999')->assertStatus(404);
    }
}
