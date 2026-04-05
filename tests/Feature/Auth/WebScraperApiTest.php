<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Web Scraper Mock API Tests
 */
class WebScraperApiTest extends TestCase
{
    // ═══ SOURCES ═══

    /** @test */
    public function sources_returns_15(): void
    {
        $this->getJson('/mock-api/web-scraper/sources')
            ->assertOk()
            ->assertJsonCount(15, 'data');
    }

    /** @test */
    public function sources_have_structure(): void
    {
        $response = $this->getJson('/mock-api/web-scraper/sources');
        foreach ($response->json('data') as $s) {
            $this->assertArrayHasKey('id', $s);
            $this->assertArrayHasKey('name', $s);
            $this->assertArrayHasKey('category', $s);
            $this->assertArrayHasKey('status', $s);
            $this->assertArrayHasKey('health', $s);
            $this->assertArrayHasKey('keywords', $s);
        }
    }

    /** @test */
    public function sources_filter_by_category(): void
    {
        $response = $this->getJson('/mock-api/web-scraper/sources?category=News+Portal');
        $response->assertOk();
        foreach ($response->json('data') as $s) {
            $this->assertEquals('News Portal', $s['category']);
        }
    }

    /** @test */
    public function sources_filter_by_status(): void
    {
        $response = $this->getJson('/mock-api/web-scraper/sources?status=Active');
        $response->assertOk();
        foreach ($response->json('data') as $s) {
            $this->assertEquals('Active', $s['status']);
        }
    }

    /** @test */
    public function sources_search(): void
    {
        $response = $this->getJson('/mock-api/web-scraper/sources?search=OCCRP');
        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    // ═══ ARTICLES ═══

    /** @test */
    public function articles_returns_12(): void
    {
        $this->getJson('/mock-api/web-scraper/articles')
            ->assertOk()
            ->assertJsonCount(12, 'data');
    }

    /** @test */
    public function articles_have_structure(): void
    {
        $response = $this->getJson('/mock-api/web-scraper/articles');
        foreach ($response->json('data') as $a) {
            $this->assertArrayHasKey('id', $a);
            $this->assertArrayHasKey('title', $a);
            $this->assertArrayHasKey('relevance', $a);
            $this->assertArrayHasKey('aiFlagged', $a);
            $this->assertArrayHasKey('tags', $a);
        }
    }

    /** @test */
    public function articles_filter_by_relevance(): void
    {
        $response = $this->getJson('/mock-api/web-scraper/articles?relevance=Critical');
        $response->assertOk();
        foreach ($response->json('data') as $a) {
            $this->assertEquals('Critical', $a['relevance']);
        }
    }

    /** @test */
    public function articles_filter_flagged(): void
    {
        $response = $this->getJson('/mock-api/web-scraper/articles?flagged=1');
        $response->assertOk();
        foreach ($response->json('data') as $a) {
            $this->assertTrue($a['aiFlagged']);
        }
    }

    /** @test */
    public function articles_filter_by_person(): void
    {
        $response = $this->getJson('/mock-api/web-scraper/articles?person_id=1');
        $response->assertOk();
        foreach ($response->json('data') as $a) {
            $this->assertContains(1, $a['personIds']);
        }
    }

    /** @test */
    public function articles_search(): void
    {
        $response = $this->getJson('/mock-api/web-scraper/articles?search=sanctions');
        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    // ═══ ARTICLE DETAIL ═══

    /** @test */
    public function show_article(): void
    {
        $this->getJson('/mock-api/web-scraper/articles/wa01')
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'title', 'excerpt', 'relevance', 'personNames', 'orgNames', 'aiFlagged', 'aiReason']]);
    }

    /** @test */
    public function show_article_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/web-scraper/articles/wa999')->assertStatus(404);
    }

    // ═══ CREATE SOURCE ═══

    /** @test */
    public function store_source(): void
    {
        $this->postJson('/mock-api/web-scraper/sources', [
            'name' => 'Test Source',
            'url' => 'https://example.com',
            'category' => 'News Portal',
            'schedule' => 'Every 1h',
        ])->assertStatus(201)
          ->assertJsonStructure(['message', 'data' => ['id', 'name', 'status']]);
    }

    /** @test */
    public function store_source_validation(): void
    {
        $this->postJson('/mock-api/web-scraper/sources', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'url', 'category', 'schedule']);
    }

    // ═══ SYNC ═══

    /** @test */
    public function sync_active_source(): void
    {
        $this->postJson('/mock-api/web-scraper/sources/ws01/sync')
            ->assertOk()
            ->assertJson(['status' => 'syncing']);
    }

    /** @test */
    public function sync_error_source_blocked(): void
    {
        $this->postJson('/mock-api/web-scraper/sources/ws05/sync')
            ->assertStatus(409)
            ->assertJson(['code' => 'SOURCE_ERROR']);
    }

    /** @test */
    public function sync_paused_source_blocked(): void
    {
        $this->postJson('/mock-api/web-scraper/sources/ws09/sync')
            ->assertStatus(409)
            ->assertJson(['code' => 'SOURCE_PAUSED']);
    }

    // ═══ STATUS ═══

    /** @test */
    public function update_source_status(): void
    {
        $this->patchJson('/mock-api/web-scraper/sources/ws01/status', ['status' => 'Paused'])
            ->assertOk()
            ->assertJson(['status' => 'Paused']);
    }

    /** @test */
    public function update_source_status_unknown_404(): void
    {
        $this->patchJson('/mock-api/web-scraper/sources/ws999/status', ['status' => 'Active'])
            ->assertStatus(404);
    }

    // ═══ DELETE ═══

    /** @test */
    public function delete_source(): void
    {
        $this->deleteJson('/mock-api/web-scraper/sources/ws01')
            ->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function delete_source_unknown_404(): void
    {
        $this->deleteJson('/mock-api/web-scraper/sources/ws999')->assertStatus(404);
    }
}
