<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Admin Audit Log Mock API Tests
 *
 * List + detail + export + integrity verification.
 */
class AdminAuditApiTest extends TestCase
{
    // ═══ LIST ═══

    /** @test */
    public function index_returns_entries_with_pagination(): void
    {
        $response = $this->getJson('/mock-api/admin/audit');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['page', 'per_page', 'total', 'total_pages']]);
    }

    /** @test */
    public function index_returns_30_entries_total(): void
    {
        $response = $this->getJson('/mock-api/admin/audit?per_page=50');

        $response->assertOk()
            ->assertJsonCount(30, 'data');
    }

    /** @test */
    public function index_paginates_at_15_per_page(): void
    {
        $response = $this->getJson('/mock-api/admin/audit?page=1&per_page=15');

        $response->assertOk()
            ->assertJsonCount(15, 'data')
            ->assertJsonPath('meta.per_page', 15);
    }

    /** @test */
    public function index_page_2_returns_remaining(): void
    {
        $response = $this->getJson('/mock-api/admin/audit?page=2&per_page=15');

        $response->assertOk()
            ->assertJsonCount(15, 'data')
            ->assertJsonPath('meta.page', 2);
    }

    /** @test */
    public function index_filters_by_action(): void
    {
        $response = $this->getJson('/mock-api/admin/audit?action=login&per_page=50');

        $response->assertOk();
        foreach ($response->json('data') as $entry) {
            $this->assertEquals('login', $entry['action']);
        }
    }

    /** @test */
    public function index_filters_by_severity(): void
    {
        $response = $this->getJson('/mock-api/admin/audit?severity=critical&per_page=50');

        $response->assertOk();
        foreach ($response->json('data') as $entry) {
            $this->assertEquals('critical', $entry['severity']);
        }
    }

    /** @test */
    public function index_filters_by_module(): void
    {
        $response = $this->getJson('/mock-api/admin/audit?module=auth&per_page=50');

        $response->assertOk();
        foreach ($response->json('data') as $entry) {
            $this->assertEquals('auth', $entry['module']);
        }
    }

    /** @test */
    public function index_filters_by_user(): void
    {
        $response = $this->getJson('/mock-api/admin/audit?user=Col.+Tomić&per_page=50');

        $response->assertOk();
        foreach ($response->json('data') as $entry) {
            $this->assertEquals('Col. Tomić', $entry['user']);
        }
    }

    /** @test */
    public function index_filters_by_ip(): void
    {
        $response = $this->getJson('/mock-api/admin/audit?ip=192.168&per_page=50');

        $response->assertOk();
        foreach ($response->json('data') as $entry) {
            $this->assertStringContainsString('192.168', $entry['ip']);
        }
    }

    /** @test */
    public function index_searches_descriptions(): void
    {
        $response = $this->getJson('/mock-api/admin/audit?search=Horvat&per_page=50');

        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function index_sorts_by_timestamp_desc_by_default(): void
    {
        $response = $this->getJson('/mock-api/admin/audit?per_page=50');

        $timestamps = collect($response->json('data'))->pluck('timestamp')->toArray();
        $sorted = $timestamps;
        rsort($sorted);
        $this->assertEquals($sorted, $timestamps);
    }

    /** @test */
    public function index_sorts_by_user_asc(): void
    {
        $response = $this->getJson('/mock-api/admin/audit?sort=user&dir=asc&per_page=50');

        $users = collect($response->json('data'))->pluck('user')->toArray();
        $sorted = $users;
        sort($sorted, SORT_STRING | SORT_FLAG_CASE);
        $this->assertEquals($sorted, $users);
    }

    /** @test */
    public function index_entries_have_integrity_hash(): void
    {
        $response = $this->getJson('/mock-api/admin/audit?per_page=5');

        foreach ($response->json('data') as $entry) {
            $this->assertArrayHasKey('integrityHash', $entry);
            $this->assertArrayHasKey('previousHash', $entry);
            $this->assertEquals(64, strlen($entry['integrityHash']));
        }
    }

    // ═══ SHOW ═══

    /** @test */
    public function show_returns_entry_detail(): void
    {
        $response = $this->getJson('/mock-api/admin/audit/a01');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'timestamp', 'user', 'action', 'severity', 'module', 'target', 'description', 'ip', 'integrityHash']]);
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/admin/audit/a999')->assertStatus(404);
    }

    // ═══ EXPORT ═══

    /** @test */
    public function export_csv_returns_success(): void
    {
        $response = $this->postJson('/mock-api/admin/audit/export', ['format' => 'csv']);

        $response->assertOk()
            ->assertJsonStructure(['message', 'format', 'entries', 'file', 'size', 'generated_at'])
            ->assertJson(['format' => 'csv']);
    }

    /** @test */
    public function export_pdf_returns_success(): void
    {
        $response = $this->postJson('/mock-api/admin/audit/export', ['format' => 'pdf']);

        $response->assertOk()
            ->assertJson(['format' => 'pdf']);
    }

    /** @test */
    public function export_invalid_format_returns_422(): void
    {
        $response = $this->postJson('/mock-api/admin/audit/export', ['format' => 'xlsx']);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['format']);
    }

    /** @test */
    public function export_requires_format(): void
    {
        $this->postJson('/mock-api/admin/audit/export', [])->assertStatus(422);
    }

    // ═══ INTEGRITY VERIFICATION ═══

    /** @test */
    public function verify_returns_valid_for_authentic_entry(): void
    {
        $response = $this->postJson('/mock-api/admin/audit/a01/verify');

        $response->assertOk()
            ->assertJsonStructure(['id', 'valid', 'hash', 'previous_hash', 'chain_position', 'algorithm', 'message', 'verified_at'])
            ->assertJson(['valid' => true, 'algorithm' => 'SHA-256']);
    }

    /** @test */
    public function verify_unknown_entry_returns_404(): void
    {
        $this->postJson('/mock-api/admin/audit/a999/verify')->assertStatus(404);
    }

    /** @test */
    public function verify_hash_is_64_chars(): void
    {
        $response = $this->postJson('/mock-api/admin/audit/a05/verify');

        $response->assertOk();
        $this->assertEquals(64, strlen($response->json('hash')));
    }

    // ═══ COMBINED FILTERS ═══

    /** @test */
    public function combined_action_and_module_filter(): void
    {
        $response = $this->getJson('/mock-api/admin/audit?action=login&module=auth&per_page=50');

        $response->assertOk();
        foreach ($response->json('data') as $entry) {
            $this->assertEquals('login', $entry['action']);
            $this->assertEquals('auth', $entry['module']);
        }
    }
}
