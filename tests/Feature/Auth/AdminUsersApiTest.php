<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Admin User Management Mock API Tests
 *
 * CRUD + status toggle + password/MFA reset + session kill
 * for operator accounts (distinct from admin accounts).
 */
class AdminUsersApiTest extends TestCase
{
    // ═══ LIST ═══

    /** @test */
    public function index_returns_users_with_pagination(): void
    {
        $response = $this->getJson('/mock-api/admin/users');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['page', 'per_page', 'total', 'total_pages'], 'counts']);
    }

    /** @test */
    public function index_returns_15_users(): void
    {
        $response = $this->getJson('/mock-api/admin/users?per_page=50');

        $response->assertOk()
            ->assertJsonCount(15, 'data');
    }

    /** @test */
    public function index_paginates_correctly(): void
    {
        $response = $this->getJson('/mock-api/admin/users?page=1&per_page=5');

        $response->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.page', 1)
            ->assertJsonPath('meta.per_page', 5);
    }

    /** @test */
    public function index_page_2_returns_remaining(): void
    {
        $response = $this->getJson('/mock-api/admin/users?page=2&per_page=10');

        $response->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.page', 2);
    }

    /** @test */
    public function index_filters_by_status(): void
    {
        $response = $this->getJson('/mock-api/admin/users?status=suspended&per_page=50');

        $response->assertOk();
        foreach ($response->json('data') as $user) {
            $this->assertEquals('suspended', $user['status']);
        }
    }

    /** @test */
    public function index_filters_by_role(): void
    {
        $response = $this->getJson('/mock-api/admin/users?role=Senior+Operator&per_page=50');

        $response->assertOk();
        foreach ($response->json('data') as $user) {
            $this->assertEquals('Senior Operator', $user['roleName']);
        }
    }

    /** @test */
    public function index_filters_by_department(): void
    {
        $response = $this->getJson('/mock-api/admin/users?department=Operations&per_page=50');

        $response->assertOk();
        foreach ($response->json('data') as $user) {
            $this->assertEquals('Operations', $user['department']);
        }
    }

    /** @test */
    public function index_filters_by_unit(): void
    {
        $response = $this->getJson('/mock-api/admin/users?unit=HQ+Staff&per_page=50');

        $response->assertOk();
        foreach ($response->json('data') as $user) {
            $this->assertEquals('HQ Staff', $user['unit']);
        }
    }

    /** @test */
    public function index_filters_by_mfa_enrolled(): void
    {
        $response = $this->getJson('/mock-api/admin/users?mfa=not_enrolled&per_page=50');

        $response->assertOk();
        foreach ($response->json('data') as $user) {
            $this->assertFalse($user['mfaEnrolled']);
        }
    }

    /** @test */
    public function index_searches_by_name(): void
    {
        $response = $this->getJson('/mock-api/admin/users?search=Horvat&per_page=50');

        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
        $this->assertStringContainsString('Horvat', $response->json('data.0.lastName'));
    }

    /** @test */
    public function index_sorts_by_email_asc(): void
    {
        $response = $this->getJson('/mock-api/admin/users?sort=email&dir=asc&per_page=50');

        $response->assertOk();
        $emails = collect($response->json('data'))->pluck('email')->toArray();
        $sorted = $emails;
        sort($sorted, SORT_STRING | SORT_FLAG_CASE);
        $this->assertEquals($sorted, $emails);
    }

    /** @test */
    public function index_returns_5_status_counts(): void
    {
        $response = $this->getJson('/mock-api/admin/users');

        $response->assertOk()
            ->assertJsonStructure(['counts' => ['active', 'suspended', 'pending', 'locked', 'archived']]);
    }

    // ═══ SHOW ═══

    /** @test */
    public function show_returns_user_detail(): void
    {
        $response = $this->getJson('/mock-api/admin/users/101');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'firstName', 'lastName', 'email', 'roleId', 'roleName', 'status', 'department', 'unit']]);
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $response = $this->getJson('/mock-api/admin/users/9999');

        $response->assertStatus(404)
            ->assertJson(['code' => 'NOT_FOUND']);
    }

    // ═══ CREATE ═══

    /** @test */
    public function store_creates_user(): void
    {
        $response = $this->postJson('/mock-api/admin/users', [
            'first_name' => 'Test', 'last_name' => 'Operator',
            'email' => 'test.op@new.mil', 'phone' => '+385 91 999 0001',
            'role_id' => 4, 'department' => 'Operations', 'unit' => 'Unit Alpha',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'data' => ['id', 'firstName', 'lastName', 'email', 'roleId', 'status']])
            ->assertJsonPath('data.status', 'pending');
    }

    /** @test */
    public function store_rejects_existing_email(): void
    {
        $response = $this->postJson('/mock-api/admin/users', [
            'first_name' => 'Dup', 'last_name' => 'User',
            'email' => 'horvat.op@argux.mil', 'role_id' => 4,
            'department' => 'Operations', 'unit' => 'HQ Staff',
        ]);

        $response->assertStatus(422)
            ->assertJson(['code' => 'EMAIL_TAKEN']);
    }

    /** @test */
    public function store_requires_fields(): void
    {
        $response = $this->postJson('/mock-api/admin/users', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'role_id', 'department', 'unit']);
    }

    // ═══ UPDATE ═══

    /** @test */
    public function update_modifies_user(): void
    {
        $response = $this->putJson('/mock-api/admin/users/104', [
            'first_name' => 'Updated', 'last_name' => 'Name',
            'email' => 'updated@argux.mil', 'department' => 'Security',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'data']);
    }

    /** @test */
    public function update_unknown_returns_404(): void
    {
        $response = $this->putJson('/mock-api/admin/users/9999', ['first_name' => 'X']);

        $response->assertStatus(404);
    }

    // ═══ DELETE ═══

    /** @test */
    public function destroy_deletes_user_without_sessions(): void
    {
        // User 104 (Petrova) has activeSessions=0
        $response = $this->deleteJson('/mock-api/admin/users/104');

        $response->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function destroy_blocks_user_with_active_sessions(): void
    {
        // User 101 (Horvat) has activeSessions=1
        $response = $this->deleteJson('/mock-api/admin/users/101');

        $response->assertStatus(409)
            ->assertJson(['code' => 'HAS_SESSIONS']);
    }

    /** @test */
    public function destroy_unknown_returns_404(): void
    {
        $response = $this->deleteJson('/mock-api/admin/users/9999');

        $response->assertStatus(404);
    }

    // ═══ STATUS ═══

    /** @test */
    public function status_toggle_changes_status(): void
    {
        $response = $this->patchJson('/mock-api/admin/users/101/status', ['status' => 'suspended']);

        $response->assertOk()
            ->assertJson(['new_status' => 'suspended', 'old_status' => 'active']);
    }

    /** @test */
    public function status_accepts_archived(): void
    {
        $response = $this->patchJson('/mock-api/admin/users/104/status', ['status' => 'archived']);

        $response->assertOk()
            ->assertJson(['new_status' => 'archived']);
    }

    /** @test */
    public function status_rejects_invalid(): void
    {
        $response = $this->patchJson('/mock-api/admin/users/101/status', ['status' => 'bogus']);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    // ═══ ACTIONS ═══

    /** @test */
    public function reset_password_sends_email(): void
    {
        $response = $this->postJson('/mock-api/admin/users/101/reset-password');

        $response->assertOk()
            ->assertJsonStructure(['message', 'id', 'email']);
    }

    /** @test */
    public function reset_mfa_forces_reenrollment(): void
    {
        $response = $this->postJson('/mock-api/admin/users/104/reset-mfa');

        $response->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function kill_sessions_terminates(): void
    {
        $response = $this->deleteJson('/mock-api/admin/users/101/sessions');

        $response->assertOk()
            ->assertJsonStructure(['message', 'sessions_killed']);
    }

    /** @test */
    public function actions_on_unknown_return_404(): void
    {
        $this->postJson('/mock-api/admin/users/9999/reset-password')->assertStatus(404);
        $this->postJson('/mock-api/admin/users/9999/reset-mfa')->assertStatus(404);
        $this->deleteJson('/mock-api/admin/users/9999/sessions')->assertStatus(404);
    }

    // ═══ COMBINED FILTERS ═══

    /** @test */
    public function combined_filters_narrow_results(): void
    {
        $response = $this->getJson('/mock-api/admin/users?status=active&department=Operations&per_page=50');

        $response->assertOk();
        foreach ($response->json('data') as $user) {
            $this->assertEquals('active', $user['status']);
            $this->assertEquals('Operations', $user['department']);
        }
    }
}
