<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Report Generator Mock API Tests
 *
 * Entities, list, show, generate, retry, download, delete.
 */
class ReportsApiTest extends TestCase
{
    // ═══ ENTITIES ═══

    /** @test */
    public function entities_returns_persons_and_orgs(): void
    {
        $response = $this->getJson('/mock-api/reports/entities');

        $response->assertOk()
            ->assertJsonStructure(['persons', 'organizations']);
        $this->assertCount(10, $response->json('persons'));
        $this->assertCount(5, $response->json('organizations'));
    }

    /** @test */
    public function entities_filter_persons_only(): void
    {
        $response = $this->getJson('/mock-api/reports/entities?type=person');

        $response->assertOk()
            ->assertJsonCount(10, 'data');
    }

    /** @test */
    public function entities_filter_orgs_only(): void
    {
        $response = $this->getJson('/mock-api/reports/entities?type=organization');

        $response->assertOk()
            ->assertJsonCount(5, 'data');
    }

    // ═══ LIST ═══

    /** @test */
    public function index_returns_reports_with_counts(): void
    {
        $response = $this->getJson('/mock-api/reports');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['total'], 'counts' => ['completed', 'generating', 'queued', 'failed']]);
    }

    /** @test */
    public function index_returns_9_reports(): void
    {
        $this->getJson('/mock-api/reports')
            ->assertJsonCount(9, 'data');
    }

    /** @test */
    public function index_filters_by_entity_type(): void
    {
        $response = $this->getJson('/mock-api/reports?entity_type=organization');

        $response->assertOk();
        foreach ($response->json('data') as $r) {
            $this->assertEquals('organization', $r['entityType']);
        }
    }

    /** @test */
    public function index_filters_by_status(): void
    {
        $response = $this->getJson('/mock-api/reports?status=completed');

        $response->assertOk();
        foreach ($response->json('data') as $r) {
            $this->assertEquals('completed', $r['status']);
        }
    }

    /** @test */
    public function index_filters_by_format(): void
    {
        $response = $this->getJson('/mock-api/reports?format=docx');

        $response->assertOk();
        foreach ($response->json('data') as $r) {
            $this->assertEquals('docx', $r['format']);
        }
    }

    /** @test */
    public function index_searches_by_name(): void
    {
        $response = $this->getJson('/mock-api/reports?search=Horvat');

        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function index_sorted_by_date_desc(): void
    {
        $response = $this->getJson('/mock-api/reports');

        $dates = collect($response->json('data'))->pluck('generatedAt')->toArray();
        $sorted = $dates;
        rsort($sorted);
        $this->assertEquals($sorted, $dates);
    }

    // ═══ SHOW ═══

    /** @test */
    public function show_returns_report_with_sections(): void
    {
        $response = $this->getJson('/mock-api/reports/rpt-01');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'title', 'entityType', 'entityName', 'status', 'sections', 'sectionList', 'classification']]);
        $this->assertCount(14, $response->json('data.sectionList'));
    }

    /** @test */
    public function show_org_report_has_6_sections(): void
    {
        $response = $this->getJson('/mock-api/reports/rpt-03');

        $this->assertCount(6, $response->json('data.sectionList'));
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/reports/rpt-999')->assertStatus(404);
    }

    // ═══ GENERATE ═══

    /** @test */
    public function store_generates_person_report(): void
    {
        $response = $this->postJson('/mock-api/reports', [
            'entity_type' => 'person', 'entity_id' => 1,
            'format' => 'pdf', 'date_from' => '2026-01-01', 'date_to' => '2026-03-27',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'data' => ['id', 'title', 'status', 'entityName', 'classification', 'jobId']])
            ->assertJsonPath('data.status', 'queued')
            ->assertJsonPath('data.entityName', 'Marko Horvat')
            ->assertJsonPath('data.sections', 14);
    }

    /** @test */
    public function store_generates_org_report(): void
    {
        $response = $this->postJson('/mock-api/reports', [
            'entity_type' => 'organization', 'entity_id' => 1,
            'format' => 'docx', 'date_from' => '2026-01-01', 'date_to' => '2026-03-27',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.sections', 6)
            ->assertJsonPath('data.entityName', 'Adriatic Maritime Holdings');
    }

    /** @test */
    public function store_requires_fields(): void
    {
        $this->postJson('/mock-api/reports', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['entity_type', 'entity_id', 'format', 'date_from', 'date_to']);
    }

    /** @test */
    public function store_validates_entity_type(): void
    {
        $this->postJson('/mock-api/reports', [
            'entity_type' => 'vehicle', 'entity_id' => 1,
            'format' => 'pdf', 'date_from' => '2026-01-01', 'date_to' => '2026-03-27',
        ])->assertStatus(422)->assertJsonValidationErrors(['entity_type']);
    }

    /** @test */
    public function store_validates_format(): void
    {
        $this->postJson('/mock-api/reports', [
            'entity_type' => 'person', 'entity_id' => 1,
            'format' => 'xlsx', 'date_from' => '2026-01-01', 'date_to' => '2026-03-27',
        ])->assertStatus(422)->assertJsonValidationErrors(['format']);
    }

    /** @test */
    public function store_validates_date_order(): void
    {
        $this->postJson('/mock-api/reports', [
            'entity_type' => 'person', 'entity_id' => 1,
            'format' => 'pdf', 'date_from' => '2026-03-27', 'date_to' => '2026-01-01',
        ])->assertStatus(422)->assertJsonValidationErrors(['date_to']);
    }

    /** @test */
    public function store_unknown_entity_returns_404(): void
    {
        $this->postJson('/mock-api/reports', [
            'entity_type' => 'person', 'entity_id' => 999,
            'format' => 'pdf', 'date_from' => '2026-01-01', 'date_to' => '2026-03-27',
        ])->assertStatus(404)->assertJson(['code' => 'ENTITY_NOT_FOUND']);
    }

    // ═══ RETRY ═══

    /** @test */
    public function retry_failed_report(): void
    {
        $response = $this->postJson('/mock-api/reports/rpt-09/retry');

        $response->assertOk()
            ->assertJson(['new_status' => 'queued']);
    }

    /** @test */
    public function retry_completed_report_blocked(): void
    {
        $this->postJson('/mock-api/reports/rpt-01/retry')
            ->assertStatus(409)
            ->assertJson(['code' => 'NOT_FAILED']);
    }

    /** @test */
    public function retry_unknown_returns_404(): void
    {
        $this->postJson('/mock-api/reports/rpt-999/retry')->assertStatus(404);
    }

    // ═══ DOWNLOAD ═══

    /** @test */
    public function download_completed_report(): void
    {
        $response = $this->getJson('/mock-api/reports/rpt-01/download');

        $response->assertOk()
            ->assertJsonStructure(['message', 'file', 'size', 'format'])
            ->assertJson(['format' => 'pdf']);
    }

    /** @test */
    public function download_generating_report_blocked(): void
    {
        $this->getJson('/mock-api/reports/rpt-08/download')
            ->assertStatus(409)
            ->assertJson(['code' => 'NOT_READY']);
    }

    /** @test */
    public function download_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/reports/rpt-999/download')->assertStatus(404);
    }

    // ═══ DELETE ═══

    /** @test */
    public function delete_completed_report(): void
    {
        $this->deleteJson('/mock-api/reports/rpt-01')
            ->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function delete_failed_report(): void
    {
        $this->deleteJson('/mock-api/reports/rpt-09')->assertOk();
    }

    /** @test */
    public function delete_generating_report_blocked(): void
    {
        $this->deleteJson('/mock-api/reports/rpt-08')
            ->assertStatus(409)
            ->assertJson(['code' => 'REPORT_GENERATING']);
    }

    /** @test */
    public function delete_unknown_returns_404(): void
    {
        $this->deleteJson('/mock-api/reports/rpt-999')->assertStatus(404);
    }
}
