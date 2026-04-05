<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Storage Browser Mock API Tests
 *
 * Entity tree, file list, show, upload, download, delete, stats.
 */
class StorageApiTest extends TestCase
{
    // ═══ TREE ═══

    /** @test */
    public function tree_returns_persons_and_orgs(): void
    {
        $response = $this->getJson('/mock-api/storage/tree');

        $response->assertOk()
            ->assertJsonStructure(['persons', 'organizations', 'subfolders', 'total_entities']);
        $this->assertCount(6, $response->json('persons'));
        $this->assertCount(2, $response->json('organizations'));
    }

    /** @test */
    public function tree_has_subfolders(): void
    {
        $response = $this->getJson('/mock-api/storage/tree');

        $this->assertEquals(['Audio', 'Video', 'Photos', 'Documents'], $response->json('subfolders'));
    }

    // ═══ FILES LIST ═══

    /** @test */
    public function index_returns_16_files(): void
    {
        $response = $this->getJson('/mock-api/storage/files');

        $response->assertOk()
            ->assertJsonCount(16, 'data')
            ->assertJsonStructure(['meta' => ['total', 'total_size', 'total_size_bytes'], 'type_counts']);
    }

    /** @test */
    public function index_filters_by_entity_id(): void
    {
        $response = $this->getJson('/mock-api/storage/files?entity_id=1');

        $response->assertOk();
        foreach ($response->json('data') as $f) {
            $this->assertEquals(1, $f['entityId']);
        }
        $this->assertCount(4, $response->json('data'));
    }

    /** @test */
    public function index_filters_by_entity_type(): void
    {
        $response = $this->getJson('/mock-api/storage/files?entity_type=organization');

        $response->assertOk();
        foreach ($response->json('data') as $f) {
            $this->assertEquals('organization', $f['entityType']);
        }
    }

    /** @test */
    public function index_filters_by_file_type(): void
    {
        $response = $this->getJson('/mock-api/storage/files?file_type=video');

        $response->assertOk();
        foreach ($response->json('data') as $f) {
            $this->assertEquals('video', $f['fileType']);
        }
    }

    /** @test */
    public function index_searches_by_filename(): void
    {
        $response = $this->getJson('/mock-api/storage/files?search=passport');

        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function index_searches_transcript(): void
    {
        $response = $this->getJson('/mock-api/storage/files?search=meeting');

        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function index_type_counts_correct(): void
    {
        $response = $this->getJson('/mock-api/storage/files');

        $counts = $response->json('type_counts');
        $this->assertEquals(2, $counts['audio']);
        $this->assertEquals(6, $counts['video']);
        $this->assertEquals(1, $counts['photo']);
        $this->assertEquals(7, $counts['document']);
    }

    /** @test */
    public function index_combined_entity_and_type_filter(): void
    {
        $response = $this->getJson('/mock-api/storage/files?entity_id=1&file_type=video');

        $response->assertOk();
        foreach ($response->json('data') as $f) {
            $this->assertEquals(1, $f['entityId']);
            $this->assertEquals('video', $f['fileType']);
        }
    }

    // ═══ SHOW ═══

    /** @test */
    public function show_returns_file_detail(): void
    {
        $response = $this->getJson('/mock-api/storage/files/f01');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'name', 'fileType', 'size', 'sizeBytes', 'entityId', 'entityName', 'mimeType', 'uploadedBy', 'uploadedAt', 'metadata']]);
    }

    /** @test */
    public function show_includes_transcript_when_available(): void
    {
        $response = $this->getJson('/mock-api/storage/files/f02');

        $response->assertOk();
        $this->assertArrayHasKey('transcript', $response->json('data'));
        $this->assertNotEmpty($response->json('data.transcript'));
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/storage/files/f999')->assertStatus(404);
    }

    // ═══ UPLOAD ═══

    /** @test */
    public function store_uploads_file(): void
    {
        $response = $this->postJson('/mock-api/storage/files', [
            'name' => 'test_recording.mp4',
            'entity_id' => 1,
            'entity_type' => 'person',
            'file_type' => 'video',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'data' => ['id', 'name', 'fileType', 'entityName', 'uploadedAt']])
            ->assertJsonPath('data.entityName', 'Marko Horvat');
    }

    /** @test */
    public function store_requires_fields(): void
    {
        $this->postJson('/mock-api/storage/files', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'entity_id', 'entity_type', 'file_type']);
    }

    /** @test */
    public function store_validates_file_type(): void
    {
        $this->postJson('/mock-api/storage/files', [
            'name' => 'test.xyz', 'entity_id' => 1, 'entity_type' => 'person', 'file_type' => 'invalid',
        ])->assertStatus(422)->assertJsonValidationErrors(['file_type']);
    }

    /** @test */
    public function store_unknown_entity_returns_404(): void
    {
        $this->postJson('/mock-api/storage/files', [
            'name' => 'test.pdf', 'entity_id' => 999, 'entity_type' => 'person', 'file_type' => 'document',
        ])->assertStatus(404)->assertJson(['code' => 'ENTITY_NOT_FOUND']);
    }

    // ═══ DOWNLOAD ═══

    /** @test */
    public function download_returns_file_info(): void
    {
        $response = $this->getJson('/mock-api/storage/files/f01/download');

        $response->assertOk()
            ->assertJsonStructure(['message', 'file', 'size', 'mime_type']);
    }

    /** @test */
    public function download_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/storage/files/f999/download')->assertStatus(404);
    }

    // ═══ DELETE ═══

    /** @test */
    public function delete_file_succeeds(): void
    {
        $response = $this->deleteJson('/mock-api/storage/files/f04');

        $response->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function delete_unknown_returns_404(): void
    {
        $this->deleteJson('/mock-api/storage/files/f999')->assertStatus(404);
    }

    // ═══ STATS ═══

    /** @test */
    public function stats_returns_storage_overview(): void
    {
        $response = $this->getJson('/mock-api/storage/stats');

        $response->assertOk()
            ->assertJsonStructure(['total_files', 'total_size', 'total_size_bytes', 'by_type', 'entities', 'backend'])
            ->assertJson(['total_files' => 16, 'backend' => 'MinIO', 'entities' => 8]);
    }

    /** @test */
    public function stats_by_type_has_all_types(): void
    {
        $response = $this->getJson('/mock-api/storage/stats');

        $byType = $response->json('by_type');
        foreach (['audio', 'video', 'photo', 'document'] as $t) {
            $this->assertArrayHasKey($t, $byType);
            $this->assertArrayHasKey('count', $byType[$t]);
            $this->assertArrayHasKey('size', $byType[$t]);
        }
    }
}
