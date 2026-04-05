<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Devices Mock API Tests
 */
class DevicesApiTest extends TestCase
{
    /** @test */
    public function index_returns_20_devices(): void
    {
        $this->getJson('/mock-api/devices')
            ->assertOk()
            ->assertJsonCount(20, 'data');
    }

    /** @test */
    public function index_devices_have_structure(): void
    {
        $response = $this->getJson('/mock-api/devices');
        foreach ($response->json('data') as $d) {
            $this->assertArrayHasKey('id', $d);
            $this->assertArrayHasKey('name', $d);
            $this->assertArrayHasKey('type', $d);
            $this->assertArrayHasKey('status', $d);
            $this->assertArrayHasKey('signalStrength', $d);
            $this->assertArrayHasKey('locationName', $d);
        }
    }

    /** @test */
    public function index_filters_by_type(): void
    {
        $response = $this->getJson('/mock-api/devices?type=Camera');
        $response->assertOk();
        foreach ($response->json('data') as $d) {
            $this->assertEquals('Camera', $d['type']);
        }
        $this->assertCount(6, $response->json('data'));
    }

    /** @test */
    public function index_filters_by_status(): void
    {
        $response = $this->getJson('/mock-api/devices?status=Online');
        $response->assertOk();
        foreach ($response->json('data') as $d) {
            $this->assertEquals('Online', $d['status']);
        }
    }

    /** @test */
    public function index_filters_by_person(): void
    {
        $response = $this->getJson('/mock-api/devices?person_id=1');
        $response->assertOk();
        foreach ($response->json('data') as $d) {
            $this->assertEquals(1, $d['personId']);
        }
    }

    /** @test */
    public function index_searches(): void
    {
        $this->getJson('/mock-api/devices?search=Horvat')
            ->assertOk()
            ->assertJsonPath('meta.total', fn ($t) => $t > 0);
    }

    /** @test */
    public function index_has_all_7_types(): void
    {
        $response = $this->getJson('/mock-api/devices');
        $types = collect($response->json('data'))->pluck('type')->unique()->sort()->values();
        $this->assertCount(7, $types);
    }

    /** @test */
    public function show_device(): void
    {
        $this->getJson('/mock-api/devices/1')
            ->assertOk()
            ->assertJsonPath('data.name', 'Phone #0291 — Horvat Primary');
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/devices/999')->assertStatus(404);
    }

    /** @test */
    public function delete_device(): void
    {
        $this->deleteJson('/mock-api/devices/1')
            ->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function delete_unknown_returns_404(): void
    {
        $this->deleteJson('/mock-api/devices/999')->assertStatus(404);
    }

    /** @test */
    public function stats(): void
    {
        $response = $this->getJson('/mock-api/devices/stats');
        $response->assertOk()
            ->assertJsonStructure(['total', 'byType', 'byStatus', 'online', 'offline']);
        $this->assertEquals(20, $response->json('total'));
    }

    /** @test */
    public function stats_has_all_types_and_statuses(): void
    {
        $response = $this->getJson('/mock-api/devices/stats');
        $byType = $response->json('byType');
        $this->assertArrayHasKey('Phone', $byType);
        $this->assertArrayHasKey('Camera', $byType);
        $this->assertArrayHasKey('GPS Tracker', $byType);
        $byStatus = $response->json('byStatus');
        $this->assertArrayHasKey('Online', $byStatus);
        $this->assertArrayHasKey('Offline', $byStatus);
    }
}
