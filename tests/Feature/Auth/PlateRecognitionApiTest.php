<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Plate Recognition / LPR Mock API Tests
 */
class PlateRecognitionApiTest extends TestCase
{
    // ═══ SCANS ═══

    /** @test */
    public function scans_returns_10(): void
    {
        $this->getJson('/mock-api/plate-recognition/scans')
            ->assertOk()
            ->assertJsonCount(10, 'data');
    }

    /** @test */
    public function scans_have_structure(): void
    {
        $response = $this->getJson('/mock-api/plate-recognition/scans');
        foreach ($response->json('data') as $s) {
            $this->assertArrayHasKey('id', $s);
            $this->assertArrayHasKey('plate', $s);
            $this->assertArrayHasKey('plateConfidence', $s);
            $this->assertArrayHasKey('status', $s);
            $this->assertArrayHasKey('direction', $s);
            $this->assertArrayHasKey('watchlistMatch', $s);
        }
    }

    /** @test */
    public function scans_filter_by_status(): void
    {
        $response = $this->getJson('/mock-api/plate-recognition/scans?status=Watchlist+Hit');
        $response->assertOk();
        foreach ($response->json('data') as $s) {
            $this->assertEquals('Watchlist Hit', $s['status']);
        }
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function scans_filter_by_reader(): void
    {
        $response = $this->getJson('/mock-api/plate-recognition/scans?reader=Vukovarska+East');
        $response->assertOk();
        foreach ($response->json('data') as $s) {
            $this->assertEquals('Vukovarska East', $s['readerName']);
        }
    }

    /** @test */
    public function scans_filter_by_person(): void
    {
        $response = $this->getJson('/mock-api/plate-recognition/scans?person_id=1');
        $response->assertOk();
        foreach ($response->json('data') as $s) {
            $this->assertEquals(1, $s['personId']);
        }
    }

    /** @test */
    public function scans_filter_by_plate(): void
    {
        $response = $this->getJson('/mock-api/plate-recognition/scans?plate=ZG-1847-AB');
        $response->assertOk();
        foreach ($response->json('data') as $s) {
            $this->assertEquals('ZG-1847-AB', $s['plate']);
        }
        $this->assertCount(3, $response->json('data'));
    }

    /** @test */
    public function scans_filter_watchlist(): void
    {
        $response = $this->getJson('/mock-api/plate-recognition/scans?watchlist=1');
        $response->assertOk();
        foreach ($response->json('data') as $s) {
            $this->assertTrue($s['watchlistMatch']);
        }
    }

    /** @test */
    public function scans_search(): void
    {
        $this->getJson('/mock-api/plate-recognition/scans?search=BMW')
            ->assertOk()
            ->assertJsonPath('meta.total', fn ($t) => $t > 0);
    }

    // ═══ SCAN DETAIL ═══

    /** @test */
    public function show_scan(): void
    {
        $this->getJson('/mock-api/plate-recognition/scans/ls01')
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'plate', 'plateConfidence', 'status', 'vehicleMake', 'direction', 'speed']]);
    }

    /** @test */
    public function show_scan_unknown_404(): void
    {
        $this->getJson('/mock-api/plate-recognition/scans/ls999')->assertStatus(404);
    }

    // ═══ READERS ═══

    /** @test */
    public function readers_returns_9(): void
    {
        $response = $this->getJson('/mock-api/plate-recognition/readers');
        $response->assertOk()
            ->assertJsonCount(9, 'data');
        foreach ($response->json('data') as $r) {
            $this->assertArrayHasKey('name', $r);
            $this->assertArrayHasKey('status', $r);
            $this->assertArrayHasKey('captureCount', $r);
        }
    }

    // ═══ WATCHLIST ═══

    /** @test */
    public function watchlist_returns_plates(): void
    {
        $response = $this->getJson('/mock-api/plate-recognition/watchlist');
        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
        foreach ($response->json('data') as $w) {
            $this->assertArrayHasKey('plate', $w);
            $this->assertArrayHasKey('scans', $w);
            $this->assertArrayHasKey('lastSeen', $w);
        }
    }

    /** @test */
    public function watchlist_has_correct_plates(): void
    {
        $response = $this->getJson('/mock-api/plate-recognition/watchlist');
        $plates = collect($response->json('data'))->pluck('plate')->toArray();
        $this->assertContains('ZG-1847-AB', $plates);
        $this->assertContains('ZG-4421-MN', $plates);
    }

    // ═══ STATS ═══

    /** @test */
    public function stats(): void
    {
        $response = $this->getJson('/mock-api/plate-recognition/stats');
        $response->assertOk()
            ->assertJsonStructure(['totalScans', 'watchlistHits', 'matched', 'unknown', 'readersOnline', 'avgConfidence', 'model']);
        $this->assertEquals(10, $response->json('totalScans'));
    }

    // ═══ SEARCH ═══

    /** @test */
    public function search_by_plate(): void
    {
        $response = $this->postJson('/mock-api/plate-recognition/search', ['plate' => 'ZG-1847']);
        $response->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['total', 'query']]);
        $this->assertGreaterThan(0, $response->json('meta.total'));
    }

    /** @test */
    public function search_validation(): void
    {
        $this->postJson('/mock-api/plate-recognition/search', [])
            ->assertStatus(422);
    }

    /** @test */
    public function search_no_results(): void
    {
        $response = $this->postJson('/mock-api/plate-recognition/search', ['plate' => 'XX-9999-ZZ']);
        $response->assertOk()
            ->assertJson(['meta' => ['total' => 0]]);
    }
}
