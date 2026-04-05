<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Admin Knowledge Base Mock API Tests
 *
 * Categories, articles CRUD, search, helpful rating.
 */
class AdminKbApiTest extends TestCase
{
    // ═══ CATEGORIES ═══

    /** @test */
    public function categories_returns_7_categories(): void
    {
        $response = $this->getJson('/mock-api/admin/kb/categories');

        $response->assertOk()
            ->assertJsonCount(7, 'data');
    }

    /** @test */
    public function categories_include_article_counts(): void
    {
        $response = $this->getJson('/mock-api/admin/kb/categories');

        foreach ($response->json('data') as $cat) {
            $this->assertArrayHasKey('articleCount', $cat);
            $this->assertArrayHasKey('totalViews', $cat);
        }
    }

    /** @test */
    public function categories_have_required_fields(): void
    {
        $response = $this->getJson('/mock-api/admin/kb/categories');

        $first = $response->json('data.0');
        $this->assertArrayHasKey('id', $first);
        $this->assertArrayHasKey('name', $first);
        $this->assertArrayHasKey('icon', $first);
        $this->assertArrayHasKey('color', $first);
    }

    // ═══ LIST ARTICLES ═══

    /** @test */
    public function index_returns_19_articles(): void
    {
        $response = $this->getJson('/mock-api/admin/kb/articles');

        $response->assertOk()
            ->assertJsonCount(19, 'data')
            ->assertJsonStructure(['meta' => ['total']]);
    }

    /** @test */
    public function index_excludes_content_field(): void
    {
        $response = $this->getJson('/mock-api/admin/kb/articles');

        foreach ($response->json('data') as $article) {
            $this->assertArrayNotHasKey('content', $article);
        }
    }

    /** @test */
    public function index_filters_by_category(): void
    {
        $response = $this->getJson('/mock-api/admin/kb/articles?category=getting-started');

        $response->assertOk();
        foreach ($response->json('data') as $a) {
            $this->assertEquals('getting-started', $a['categoryId']);
        }
        $this->assertCount(4, $response->json('data'));
    }

    /** @test */
    public function index_searches_by_title(): void
    {
        $response = $this->getJson('/mock-api/admin/kb/articles?search=keyboard');

        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function index_searches_by_tag(): void
    {
        $response = $this->getJson('/mock-api/admin/kb/articles?search=encryption');

        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function index_combined_category_and_search(): void
    {
        $response = $this->getJson('/mock-api/admin/kb/articles?category=map-tracking&search=zone');

        $response->assertOk();
        foreach ($response->json('data') as $a) {
            $this->assertEquals('map-tracking', $a['categoryId']);
        }
    }

    // ═══ SHOW ═══

    /** @test */
    public function show_returns_article_with_content(): void
    {
        $response = $this->getJson('/mock-api/admin/kb/articles/kb-01');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'title', 'summary', 'content', 'author', 'views', 'helpful', 'tags', 'relatedIds'], 'category', 'related']);
    }

    /** @test */
    public function show_includes_category_info(): void
    {
        $response = $this->getJson('/mock-api/admin/kb/articles/kb-01');

        $response->assertOk()
            ->assertJsonStructure(['category' => ['id', 'name', 'icon', 'color']]);
    }

    /** @test */
    public function show_includes_related_articles(): void
    {
        $response = $this->getJson('/mock-api/admin/kb/articles/kb-01');

        $response->assertOk();
        $related = $response->json('related');
        $this->assertGreaterThan(0, count($related));
        foreach ($related as $r) {
            $this->assertArrayHasKey('id', $r);
            $this->assertArrayHasKey('title', $r);
        }
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/admin/kb/articles/kb-999')->assertStatus(404);
    }

    // ═══ CREATE ═══

    /** @test */
    public function store_creates_article(): void
    {
        $response = $this->postJson('/mock-api/admin/kb/articles', [
            'title' => 'Test Article Title Here',
            'summary' => 'This is a test article summary for the knowledge base.',
            'content' => 'This is the full content of the test article with enough characters.',
            'category_id' => 'admin',
            'tags' => ['test', 'documentation'],
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'data' => ['id', 'title', 'categoryId', 'views', 'tags']])
            ->assertJsonPath('data.views', 0)
            ->assertJsonPath('data.categoryId', 'admin');
    }

    /** @test */
    public function store_requires_fields(): void
    {
        $this->postJson('/mock-api/admin/kb/articles', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'summary', 'content', 'category_id']);
    }

    /** @test */
    public function store_validates_category(): void
    {
        $this->postJson('/mock-api/admin/kb/articles', [
            'title' => 'Test Title', 'summary' => 'Test summary here',
            'content' => 'Test content long enough', 'category_id' => 'invalid',
        ])->assertStatus(422)->assertJsonValidationErrors(['category_id']);
    }

    /** @test */
    public function store_validates_title_min_length(): void
    {
        $this->postJson('/mock-api/admin/kb/articles', [
            'title' => 'Hi', 'summary' => 'Summary here enough',
            'content' => 'Content long enough here', 'category_id' => 'admin',
        ])->assertStatus(422)->assertJsonValidationErrors(['title']);
    }

    // ═══ UPDATE ═══

    /** @test */
    public function update_modifies_article(): void
    {
        $response = $this->putJson('/mock-api/admin/kb/articles/kb-04', [
            'title' => 'Updated Theme Guide',
            'tags' => ['themes', 'updated'],
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'data']);
    }

    /** @test */
    public function update_unknown_returns_404(): void
    {
        $this->putJson('/mock-api/admin/kb/articles/kb-999', ['title' => 'X'])
            ->assertStatus(404);
    }

    // ═══ DELETE ═══

    /** @test */
    public function destroy_deletes_article(): void
    {
        $response = $this->deleteJson('/mock-api/admin/kb/articles/kb-04');

        $response->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function destroy_unknown_returns_404(): void
    {
        $this->deleteJson('/mock-api/admin/kb/articles/kb-999')->assertStatus(404);
    }

    // ═══ HELPFUL ═══

    /** @test */
    public function helpful_positive_increments(): void
    {
        $response = $this->postJson('/mock-api/admin/kb/articles/kb-01/helpful', ['helpful' => true]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'helpful', 'helpfulTotal', 'percentage']);
        $this->assertEquals(93, $response->json('helpful'));
        $this->assertEquals(101, $response->json('helpfulTotal'));
    }

    /** @test */
    public function helpful_negative_does_not_increment_helpful(): void
    {
        $response = $this->postJson('/mock-api/admin/kb/articles/kb-01/helpful', ['helpful' => false]);

        $response->assertOk();
        $this->assertEquals(92, $response->json('helpful'));
        $this->assertEquals(101, $response->json('helpfulTotal'));
    }

    /** @test */
    public function helpful_requires_boolean(): void
    {
        $this->postJson('/mock-api/admin/kb/articles/kb-01/helpful', [])
            ->assertStatus(422);
    }

    /** @test */
    public function helpful_unknown_returns_404(): void
    {
        $this->postJson('/mock-api/admin/kb/articles/kb-999/helpful', ['helpful' => true])
            ->assertStatus(404);
    }
}
