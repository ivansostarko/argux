<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Admin Management Mock API Tests
 *
 * CRUD + status + password reset + MFA reset + session kill
 */
class AdminAdminsApiTest extends TestCase
{
    // ═══ LIST ═══

    /** @test */
    public function index_returns_admins_with_pagination(): void
    {
        $response = $this->getJson('/mock-api/admin/admins');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['page', 'per_page', 'total', 'total_pages'], 'counts']);
    }

    /** @test */
    public function index_returns_12_admins_by_default(): void
    {
        $response = $this->getJson('/mock-api/admin/admins?per_page=50');

        $response->assertOk()
            ->assertJsonCount(12, 'data');
    }

    /** @test */
    public function index_paginates_correctly(): void
    {
        $response = $this->getJson('/mock-api/admin/admins?page=1&per_page=5');

        $response->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.page', 1)
            ->assertJsonPath('meta.per_page', 5);
    }

    /** @test */
    public function index_filters_by_status(): void
    {
        $response = $this->getJson('/mock-api/admin/admins?status=suspended&per_page=50');

        $response->assertOk();
        foreach ($response->json('data') as $admin) {
            $this->assertEquals('suspended', $admin['status']);
        }
    }

    /** @test */
    public function index_filters_by_role(): void
    {
        $response = $this->getJson('/mock-api/admin/admins?role=super_admin&per_page=50');

        $response->assertOk();
        foreach ($response->json('data') as $admin) {
            $this->assertEquals('super_admin', $admin['role']);
        }
    }

    /** @test */
    public function index_filters_by_department(): void
    {
        $response = $this->getJson('/mock-api/admin/admins?department=Security&per_page=50');

        $response->assertOk();
        foreach ($response->json('data') as $admin) {
            $this->assertEquals('Security', $admin['department']);
        }
    }

    /** @test */
    public function index_filters_by_mfa_enrolled(): void
    {
        $response = $this->getJson('/mock-api/admin/admins?mfa=not_enrolled&per_page=50');

        $response->assertOk();
        foreach ($response->json('data') as $admin) {
            $this->assertFalse($admin['mfaEnrolled']);
        }
    }

    /** @test */
    public function index_searches_by_name(): void
    {
        $response = $this->getJson('/mock-api/admin/admins?search=Tomić&per_page=50');

        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
        $this->assertStringContainsString('Tomić', $response->json('data.0.lastName'));
    }

    /** @test */
    public function index_sorts_by_column(): void
    {
        $response = $this->getJson('/mock-api/admin/admins?sort=email&dir=asc&per_page=50');

        $response->assertOk();
        $emails = collect($response->json('data'))->pluck('email')->toArray();
        $sorted = $emails;
        sort($sorted, SORT_STRING | SORT_FLAG_CASE);
        $this->assertEquals($sorted, $emails);
    }

    /** @test */
    public function index_returns_status_counts(): void
    {
        $response = $this->getJson('/mock-api/admin/admins');

        $response->assertOk()
            ->assertJsonStructure(['counts' => ['active', 'suspended', 'pending', 'locked']]);
    }

    // ═══ SHOW ═══

    /** @test */
    public function show_returns_admin_detail(): void
    {
        $response = $this->getJson('/mock-api/admin/admins/1');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'firstName', 'lastName', 'email', 'role', 'status', 'sessions', 'permissions']]);
    }

    /** @test */
    public function show_unknown_id_returns_404(): void
    {
        $response = $this->getJson('/mock-api/admin/admins/9999');

        $response->assertStatus(404)
            ->assertJson(['code' => 'NOT_FOUND']);
    }

    // ═══ CREATE ═══

    /** @test */
    public function store_creates_admin(): void
    {
        $response = $this->postJson('/mock-api/admin/admins', [
            'first_name' => 'Test', 'last_name' => 'Admin',
            'email' => 'test.admin@new.mil', 'phone' => '+385 91 000 0099',
            'role' => 'support_agent', 'department' => 'Training',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'data' => ['id', 'firstName', 'lastName', 'email', 'role', 'status']])
            ->assertJsonPath('data.status', 'pending');
    }

    /** @test */
    public function store_rejects_existing_email(): void
    {
        $response = $this->postJson('/mock-api/admin/admins', [
            'first_name' => 'Dup', 'last_name' => 'Test',
            'email' => 'tomic@argux.mil', 'role' => 'admin', 'department' => 'IT Infrastructure',
        ]);

        $response->assertStatus(422)
            ->assertJson(['code' => 'EMAIL_TAKEN']);
    }

    /** @test */
    public function store_requires_fields(): void
    {
        $response = $this->postJson('/mock-api/admin/admins', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'role', 'department']);
    }

    /** @test */
    public function store_validates_role(): void
    {
        $response = $this->postJson('/mock-api/admin/admins', [
            'first_name' => 'Test', 'last_name' => 'Admin',
            'email' => 'test@new.mil', 'role' => 'invalid_role', 'department' => 'IT',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }

    // ═══ UPDATE ═══

    /** @test */
    public function update_modifies_admin(): void
    {
        $response = $this->putJson('/mock-api/admin/admins/5', [
            'first_name' => 'Updated', 'last_name' => 'Name',
            'email' => 'updated@argux.mil', 'role' => 'admin', 'department' => 'Security',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'data']);
    }

    /** @test */
    public function update_unknown_id_returns_404(): void
    {
        $response = $this->putJson('/mock-api/admin/admins/9999', [
            'first_name' => 'X', 'last_name' => 'Y', 'email' => 'x@y.com',
        ]);

        $response->assertStatus(404);
    }

    // ═══ DELETE ═══

    /** @test */
    public function destroy_deletes_admin(): void
    {
        $response = $this->deleteJson('/mock-api/admin/admins/5');

        $response->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function destroy_protects_super_admins(): void
    {
        $response = $this->deleteJson('/mock-api/admin/admins/1');

        $response->assertStatus(403)
            ->assertJson(['code' => 'PROTECTED_ROLE']);
    }

    /** @test */
    public function destroy_unknown_id_returns_404(): void
    {
        $response = $this->deleteJson('/mock-api/admin/admins/9999');

        $response->assertStatus(404);
    }

    // ═══ STATUS ═══

    /** @test */
    public function status_toggle_changes_status(): void
    {
        $response = $this->patchJson('/mock-api/admin/admins/2/status', ['status' => 'suspended']);

        $response->assertOk()
            ->assertJson(['new_status' => 'suspended', 'old_status' => 'active']);
    }

    /** @test */
    public function status_requires_valid_status(): void
    {
        $response = $this->patchJson('/mock-api/admin/admins/2/status', ['status' => 'invalid']);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    // ═══ ACTIONS ═══

    /** @test */
    public function reset_password_sends_email(): void
    {
        $response = $this->postJson('/mock-api/admin/admins/2/reset-password');

        $response->assertOk()
            ->assertJsonStructure(['message', 'id', 'email']);
    }

    /** @test */
    public function reset_mfa_forces_reenrollment(): void
    {
        $response = $this->postJson('/mock-api/admin/admins/4/reset-mfa');

        $response->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function kill_sessions_terminates_all(): void
    {
        $response = $this->deleteJson('/mock-api/admin/admins/1/sessions');

        $response->assertOk()
            ->assertJsonStructure(['message', 'sessions_killed']);
    }

    /** @test */
    public function actions_on_unknown_id_return_404(): void
    {
        $this->postJson('/mock-api/admin/admins/9999/reset-password')->assertStatus(404);
        $this->postJson('/mock-api/admin/admins/9999/reset-mfa')->assertStatus(404);
        $this->deleteJson('/mock-api/admin/admins/9999/sessions')->assertStatus(404);
    }
}
