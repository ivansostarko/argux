<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Records / Evidence Mock API Tests
 *
 * CRUD, chain of custody, entity assignment, search.
 */
class RecordsApiTest extends TestCase
{
    // ═══ LIST ═══

    /** @test */
    public function index_returns_records_with_type_counts(): void
    {
        $response = $this->getJson('/mock-api/records');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['total'], 'type_counts']);
    }

    /** @test */
    public function index_returns_12_records(): void
    {
        $this->getJson('/mock-api/records')
            ->assertJsonCount(12, 'data');
    }

    /** @test */
    public function index_filters_by_type(): void
    {
        $response = $this->getJson('/mock-api/records?type=video');

        $response->assertOk();
        foreach ($response->json('data') as $r) {
            $this->assertEquals('video', $r['type']);
        }
    }

    /** @test */
    public function index_filters_by_person_id(): void
    {
        $response = $this->getJson('/mock-api/records?person_id=1');

        $response->assertOk();
        foreach ($response->json('data') as $r) {
            $personIds = collect($r['assignedPersons'])->pluck('id')->toArray();
            $this->assertContains(1, $personIds);
        }
    }

    /** @test */
    public function index_filters_by_org_id(): void
    {
        $response = $this->getJson('/mock-api/records?org_id=101');

        $response->assertOk();
        foreach ($response->json('data') as $r) {
            $orgIds = collect($r['assignedOrgs'])->pluck('id')->toArray();
            $this->assertContains(101, $orgIds);
        }
    }

    /** @test */
    public function index_searches_title(): void
    {
        $response = $this->getJson('/mock-api/records?search=passport');

        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function index_searches_transcript(): void
    {
        $response = $this->getJson('/mock-api/records?search=port+Thursday');

        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function index_sorted_by_date_desc(): void
    {
        $response = $this->getJson('/mock-api/records');

        $dates = collect($response->json('data'))->pluck('createdAt')->toArray();
        $sorted = $dates;
        rsort($sorted);
        $this->assertEquals($sorted, $dates);
    }

    /** @test */
    public function index_has_all_6_types(): void
    {
        $response = $this->getJson('/mock-api/records');

        $typeCounts = $response->json('type_counts');
        foreach (['document', 'photo', 'video', 'audio', 'digital', 'physical'] as $t) {
            $this->assertArrayHasKey($t, $typeCounts);
        }
    }

    // ═══ SHOW ═══

    /** @test */
    public function show_returns_record_with_custody(): void
    {
        $response = $this->getJson('/mock-api/records/rec-01');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'title', 'type', 'description', 'assignedPersons', 'assignedOrgs', 'custody', 'tags']]);
        $this->assertGreaterThan(0, count($response->json('data.custody')));
    }

    /** @test */
    public function show_record_with_transcript(): void
    {
        $response = $this->getJson('/mock-api/records/rec-02');

        $response->assertOk();
        $this->assertNotEmpty($response->json('data.transcript'));
    }

    /** @test */
    public function show_physical_record_has_no_file(): void
    {
        $response = $this->getJson('/mock-api/records/rec-09');

        $response->assertOk();
        $this->assertNull($response->json('data.fileUrl'));
        $this->assertEquals('physical', $response->json('data.type'));
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/records/rec-999')->assertStatus(404);
    }

    // ═══ CREATE ═══

    /** @test */
    public function store_creates_record(): void
    {
        $response = $this->postJson('/mock-api/records', [
            'title' => 'Test Evidence Record',
            'type' => 'document',
            'description' => 'This is a test evidence record for unit testing purposes.',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'data' => ['id', 'title', 'type', 'custody']])
            ->assertJsonPath('data.type', 'document');
        $this->assertCount(1, $response->json('data.custody'));
        $this->assertEquals('created', $response->json('data.custody.0.action'));
    }

    /** @test */
    public function store_requires_fields(): void
    {
        $this->postJson('/mock-api/records', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'type', 'description']);
    }

    /** @test */
    public function store_validates_type(): void
    {
        $this->postJson('/mock-api/records', [
            'title' => 'Test', 'type' => 'invalid', 'description' => 'Some description here',
        ])->assertStatus(422)->assertJsonValidationErrors(['type']);
    }

    /** @test */
    public function store_validates_title_min(): void
    {
        $this->postJson('/mock-api/records', [
            'title' => 'Hi', 'type' => 'audio', 'description' => 'Description long enough',
        ])->assertStatus(422)->assertJsonValidationErrors(['title']);
    }

    // ═══ UPDATE ═══

    /** @test */
    public function update_modifies_record(): void
    {
        $response = $this->putJson('/mock-api/records/rec-03', [
            'title' => 'Updated Mendoza Passport Record',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'data']);
        $custody = $response->json('data.custody');
        $this->assertEquals('modified', end($custody)['action']);
    }

    /** @test */
    public function update_unknown_returns_404(): void
    {
        $this->putJson('/mock-api/records/rec-999', ['title' => 'X'])
            ->assertStatus(404);
    }

    // ═══ DELETE ═══

    /** @test */
    public function delete_record_succeeds(): void
    {
        $this->deleteJson('/mock-api/records/rec-04')
            ->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function delete_unknown_returns_404(): void
    {
        $this->deleteJson('/mock-api/records/rec-999')->assertStatus(404);
    }

    // ═══ CUSTODY ═══

    /** @test */
    public function custody_returns_chain(): void
    {
        $response = $this->getJson('/mock-api/records/rec-09/custody');

        $response->assertOk()
            ->assertJsonStructure(['data', 'record_id', 'record_title']);
        $this->assertCount(3, $response->json('data'));
        $actions = collect($response->json('data'))->pluck('action')->toArray();
        $this->assertContains('created', $actions);
        $this->assertContains('transferred', $actions);
    }

    /** @test */
    public function custody_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/records/rec-999/custody')->assertStatus(404);
    }

    // ═══ ENTITIES ═══

    /** @test */
    public function entities_returns_persons_and_orgs(): void
    {
        $response = $this->getJson('/mock-api/records/entities');

        $response->assertOk()
            ->assertJsonStructure(['persons', 'organizations']);
        $this->assertCount(6, $response->json('persons'));
        $this->assertCount(3, $response->json('organizations'));
    }
}
