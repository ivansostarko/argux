<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Admin Support Tickets Mock API Tests
 *
 * CRUD + status/priority/assignee changes + reply + delete protection.
 */
class AdminSupportApiTest extends TestCase
{
    // ═══ LIST ═══

    /** @test */
    public function index_returns_tickets_with_counts(): void
    {
        $response = $this->getJson('/mock-api/admin/support/tickets');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['total'], 'counts' => ['all', 'open', 'in_progress', 'waiting', 'resolved', 'closed']]);
    }

    /** @test */
    public function index_returns_12_tickets(): void
    {
        $response = $this->getJson('/mock-api/admin/support/tickets');

        $response->assertOk()
            ->assertJsonCount(12, 'data');
    }

    /** @test */
    public function index_filters_by_status(): void
    {
        $response = $this->getJson('/mock-api/admin/support/tickets?status=open');

        $response->assertOk();
        foreach ($response->json('data') as $t) {
            $this->assertEquals('open', $t['status']);
        }
    }

    /** @test */
    public function index_filters_by_priority(): void
    {
        $response = $this->getJson('/mock-api/admin/support/tickets?priority=critical');

        $response->assertOk();
        foreach ($response->json('data') as $t) {
            $this->assertEquals('critical', $t['priority']);
        }
    }

    /** @test */
    public function index_filters_by_category(): void
    {
        $response = $this->getJson('/mock-api/admin/support/tickets?category=bug');

        $response->assertOk();
        foreach ($response->json('data') as $t) {
            $this->assertEquals('bug', $t['category']);
        }
    }

    /** @test */
    public function index_filters_by_assignee(): void
    {
        $response = $this->getJson('/mock-api/admin/support/tickets?assignee=AI+Team');

        $response->assertOk();
        foreach ($response->json('data') as $t) {
            $this->assertEquals('AI Team', $t['assignee']);
        }
    }

    /** @test */
    public function index_searches_by_subject(): void
    {
        $response = $this->getJson('/mock-api/admin/support/tickets?search=Whisper');

        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function index_searches_by_ticket_number(): void
    {
        $response = $this->getJson('/mock-api/admin/support/tickets?search=TKT-003');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('TKT-003', $response->json('data.0.number'));
    }

    /** @test */
    public function index_sorted_by_updated_desc(): void
    {
        $response = $this->getJson('/mock-api/admin/support/tickets');

        $dates = collect($response->json('data'))->pluck('updatedAt')->toArray();
        $sorted = $dates;
        rsort($sorted);
        $this->assertEquals($sorted, $dates);
    }

    /** @test */
    public function index_status_all_returns_everything(): void
    {
        $response = $this->getJson('/mock-api/admin/support/tickets?status=all');

        $response->assertOk()
            ->assertJsonCount(12, 'data');
    }

    // ═══ SHOW ═══

    /** @test */
    public function show_returns_ticket_with_messages(): void
    {
        $response = $this->getJson('/mock-api/admin/support/tickets/t01');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'number', 'subject', 'status', 'priority', 'category', 'reporter', 'assignee', 'messages']]);
        $this->assertGreaterThan(0, count($response->json('data.messages')));
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/admin/support/tickets/t999')->assertStatus(404);
    }

    // ═══ CREATE ═══

    /** @test */
    public function store_creates_ticket(): void
    {
        $response = $this->postJson('/mock-api/admin/support/tickets', [
            'subject' => 'Test ticket from API',
            'description' => 'This is a test ticket created via the mock API.',
            'category' => 'bug',
            'priority' => 'high',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'data' => ['id', 'number', 'subject', 'status', 'messages']])
            ->assertJsonPath('data.status', 'open')
            ->assertJsonPath('data.priority', 'high');
    }

    /** @test */
    public function store_includes_system_message(): void
    {
        $response = $this->postJson('/mock-api/admin/support/tickets', [
            'subject' => 'Test with messages',
            'description' => 'Check that system message is included.',
            'category' => 'feature',
            'priority' => 'low',
        ]);

        $response->assertStatus(201);
        $messages = $response->json('data.messages');
        $this->assertCount(2, $messages);
        $types = collect($messages)->pluck('type')->toArray();
        $this->assertContains('user', $types);
        $this->assertContains('system', $types);
    }

    /** @test */
    public function store_requires_fields(): void
    {
        $response = $this->postJson('/mock-api/admin/support/tickets', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['subject', 'description', 'category', 'priority']);
    }

    /** @test */
    public function store_validates_category(): void
    {
        $response = $this->postJson('/mock-api/admin/support/tickets', [
            'subject' => 'Test', 'description' => 'Test description here',
            'category' => 'invalid', 'priority' => 'low',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['category']);
    }

    /** @test */
    public function store_validates_subject_min_length(): void
    {
        $response = $this->postJson('/mock-api/admin/support/tickets', [
            'subject' => 'Hi', 'description' => 'Short subject test',
            'category' => 'bug', 'priority' => 'low',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['subject']);
    }

    // ═══ STATUS ═══

    /** @test */
    public function status_change_returns_system_message(): void
    {
        $response = $this->patchJson('/mock-api/admin/support/tickets/t01/status', ['status' => 'in_progress']);

        $response->assertOk()
            ->assertJson(['old_status' => 'open', 'new_status' => 'in_progress'])
            ->assertJsonStructure(['system_message' => ['id', 'type', 'author', 'content', 'timestamp']]);
    }

    /** @test */
    public function status_validates_value(): void
    {
        $this->patchJson('/mock-api/admin/support/tickets/t01/status', ['status' => 'invalid'])
            ->assertStatus(422);
    }

    /** @test */
    public function status_unknown_ticket_returns_404(): void
    {
        $this->patchJson('/mock-api/admin/support/tickets/t999/status', ['status' => 'closed'])
            ->assertStatus(404);
    }

    // ═══ PRIORITY ═══

    /** @test */
    public function priority_change_succeeds(): void
    {
        $response = $this->patchJson('/mock-api/admin/support/tickets/t02/priority', ['priority' => 'high']);

        $response->assertOk()
            ->assertJson(['old_priority' => 'medium', 'new_priority' => 'high']);
    }

    /** @test */
    public function priority_validates_value(): void
    {
        $this->patchJson('/mock-api/admin/support/tickets/t01/priority', ['priority' => 'invalid'])
            ->assertStatus(422);
    }

    // ═══ ASSIGNEE ═══

    /** @test */
    public function assignee_change_succeeds(): void
    {
        $response = $this->patchJson('/mock-api/admin/support/tickets/t02/assignee', ['assignee' => 'IT Support']);

        $response->assertOk()
            ->assertJson(['old_assignee' => 'Unassigned', 'new_assignee' => 'IT Support']);
    }

    /** @test */
    public function assignee_requires_value(): void
    {
        $this->patchJson('/mock-api/admin/support/tickets/t01/assignee', [])
            ->assertStatus(422);
    }

    // ═══ REPLY ═══

    /** @test */
    public function reply_adds_message(): void
    {
        $response = $this->postJson('/mock-api/admin/support/tickets/t01/reply', [
            'content' => 'This is an admin reply to the ticket.',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'data' => ['id', 'type', 'author', 'content', 'timestamp']])
            ->assertJsonPath('data.type', 'admin');
    }

    /** @test */
    public function reply_requires_content(): void
    {
        $this->postJson('/mock-api/admin/support/tickets/t01/reply', [])
            ->assertStatus(422);
    }

    /** @test */
    public function reply_unknown_ticket_returns_404(): void
    {
        $this->postJson('/mock-api/admin/support/tickets/t999/reply', ['content' => 'Test'])
            ->assertStatus(404);
    }

    // ═══ DELETE ═══

    /** @test */
    public function delete_resolved_ticket_succeeds(): void
    {
        $response = $this->deleteJson('/mock-api/admin/support/tickets/t07');

        $response->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function delete_closed_ticket_succeeds(): void
    {
        $response = $this->deleteJson('/mock-api/admin/support/tickets/t09');

        $response->assertOk();
    }

    /** @test */
    public function delete_open_ticket_blocked(): void
    {
        $response = $this->deleteJson('/mock-api/admin/support/tickets/t01');

        $response->assertStatus(409)
            ->assertJson(['code' => 'TICKET_ACTIVE']);
    }

    /** @test */
    public function delete_in_progress_ticket_blocked(): void
    {
        $response = $this->deleteJson('/mock-api/admin/support/tickets/t03');

        $response->assertStatus(409)
            ->assertJson(['code' => 'TICKET_ACTIVE']);
    }

    /** @test */
    public function delete_unknown_returns_404(): void
    {
        $this->deleteJson('/mock-api/admin/support/tickets/t999')->assertStatus(404);
    }

    // ═══ COMBINED ═══

    /** @test */
    public function combined_status_and_category_filter(): void
    {
        $response = $this->getJson('/mock-api/admin/support/tickets?status=open&category=bug');

        $response->assertOk();
        foreach ($response->json('data') as $t) {
            $this->assertEquals('open', $t['status']);
            $this->assertEquals('bug', $t['category']);
        }
    }
}
