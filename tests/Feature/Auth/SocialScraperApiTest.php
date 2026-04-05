<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Social Media Scraper Mock API Tests
 */
class SocialScraperApiTest extends TestCase
{
    // ═══ SCRAPERS ═══

    /** @test */
    public function scrapers_returns_12(): void
    {
        $this->getJson('/mock-api/scraper/scrapers')
            ->assertOk()
            ->assertJsonCount(12, 'data');
    }

    /** @test */
    public function scrapers_have_structure(): void
    {
        $response = $this->getJson('/mock-api/scraper/scrapers');
        foreach ($response->json('data') as $s) {
            $this->assertArrayHasKey('id', $s);
            $this->assertArrayHasKey('platform', $s);
            $this->assertArrayHasKey('profileHandle', $s);
            $this->assertArrayHasKey('status', $s);
            $this->assertArrayHasKey('totalPosts', $s);
            $this->assertArrayHasKey('keywords', $s);
        }
    }

    /** @test */
    public function scrapers_filter_by_platform(): void
    {
        $response = $this->getJson('/mock-api/scraper/scrapers?platform=Facebook');
        $response->assertOk();
        foreach ($response->json('data') as $s) {
            $this->assertEquals('Facebook', $s['platform']);
        }
    }

    /** @test */
    public function scrapers_filter_by_status(): void
    {
        $response = $this->getJson('/mock-api/scraper/scrapers?status=Active');
        $response->assertOk();
        foreach ($response->json('data') as $s) {
            $this->assertEquals('Active', $s['status']);
        }
    }

    /** @test */
    public function scrapers_filter_by_person(): void
    {
        $response = $this->getJson('/mock-api/scraper/scrapers?person_id=1');
        $response->assertOk();
        foreach ($response->json('data') as $s) {
            $this->assertEquals(1, $s['personId']);
        }
    }

    /** @test */
    public function scrapers_search(): void
    {
        $this->getJson('/mock-api/scraper/scrapers?search=horvat')
            ->assertOk()
            ->assertJsonPath('meta.total', fn ($t) => $t > 0);
    }

    // ═══ POSTS ═══

    /** @test */
    public function posts_returns_12(): void
    {
        $this->getJson('/mock-api/scraper/posts')
            ->assertOk()
            ->assertJsonCount(12, 'data');
    }

    /** @test */
    public function posts_have_structure(): void
    {
        $response = $this->getJson('/mock-api/scraper/posts');
        foreach ($response->json('data') as $p) {
            $this->assertArrayHasKey('id', $p);
            $this->assertArrayHasKey('platform', $p);
            $this->assertArrayHasKey('content', $p);
            $this->assertArrayHasKey('sentiment', $p);
            $this->assertArrayHasKey('aiFlagged', $p);
            $this->assertArrayHasKey('likes', $p);
        }
    }

    /** @test */
    public function posts_filter_by_platform(): void
    {
        $response = $this->getJson('/mock-api/scraper/posts?platform=Telegram');
        $response->assertOk();
        foreach ($response->json('data') as $p) {
            $this->assertEquals('Telegram', $p['platform']);
        }
    }

    /** @test */
    public function posts_filter_flagged(): void
    {
        $response = $this->getJson('/mock-api/scraper/posts?flagged=1');
        $response->assertOk();
        foreach ($response->json('data') as $p) {
            $this->assertTrue($p['aiFlagged']);
        }
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function posts_filter_by_sentiment(): void
    {
        $response = $this->getJson('/mock-api/scraper/posts?sentiment=flagged');
        $response->assertOk();
        foreach ($response->json('data') as $p) {
            $this->assertEquals('flagged', $p['sentiment']);
        }
    }

    /** @test */
    public function posts_search(): void
    {
        $this->getJson('/mock-api/scraper/posts?search=Thursday')
            ->assertOk()
            ->assertJsonPath('meta.total', fn ($t) => $t > 0);
    }

    // ═══ POST DETAIL ═══

    /** @test */
    public function show_post(): void
    {
        $this->getJson('/mock-api/scraper/posts/sp01')
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'platform', 'content', 'sentiment', 'aiFlagged']]);
    }

    /** @test */
    public function show_post_unknown_404(): void
    {
        $this->getJson('/mock-api/scraper/posts/sp999')->assertStatus(404);
    }

    // ═══ CREATE ═══

    /** @test */
    public function store_scraper(): void
    {
        $this->postJson('/mock-api/scraper/scrapers', [
            'platform' => 'Instagram',
            'profileUrl' => 'https://instagram.com/test',
            'profileHandle' => '@test_user',
            'interval' => 'Every 30min',
        ])->assertStatus(201)
          ->assertJsonStructure(['message', 'data' => ['id', 'platform', 'status']]);
    }

    /** @test */
    public function store_scraper_validation(): void
    {
        $this->postJson('/mock-api/scraper/scrapers', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['platform', 'profileUrl', 'profileHandle', 'interval']);
    }

    /** @test */
    public function store_scraper_invalid_platform(): void
    {
        $this->postJson('/mock-api/scraper/scrapers', [
            'platform' => 'MySpace', 'profileUrl' => 'x', 'profileHandle' => '@x', 'interval' => 'x',
        ])->assertStatus(422)->assertJsonValidationErrors(['platform']);
    }

    // ═══ RUN ═══

    /** @test */
    public function run_active_scraper(): void
    {
        $this->postJson('/mock-api/scraper/scrapers/sc01/run')
            ->assertOk()
            ->assertJson(['status' => 'running']);
    }

    /** @test */
    public function run_error_scraper_blocked(): void
    {
        $this->postJson('/mock-api/scraper/scrapers/sc10/run')
            ->assertStatus(409)
            ->assertJson(['code' => 'SCRAPER_ERROR']);
    }

    /** @test */
    public function run_unknown_404(): void
    {
        $this->postJson('/mock-api/scraper/scrapers/sc999/run')->assertStatus(404);
    }

    // ═══ STATUS ═══

    /** @test */
    public function update_scraper_status(): void
    {
        $this->patchJson('/mock-api/scraper/scrapers/sc01/status', ['status' => 'Paused'])
            ->assertOk()
            ->assertJson(['status' => 'Paused']);
    }

    // ═══ DELETE ═══

    /** @test */
    public function delete_paused_scraper(): void
    {
        $this->deleteJson('/mock-api/scraper/scrapers/sc06')
            ->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function delete_active_scraper_blocked(): void
    {
        $this->deleteJson('/mock-api/scraper/scrapers/sc01')
            ->assertStatus(409)
            ->assertJson(['code' => 'SCRAPER_ACTIVE']);
    }

    /** @test */
    public function delete_unknown_404(): void
    {
        $this->deleteJson('/mock-api/scraper/scrapers/sc999')->assertStatus(404);
    }
}
