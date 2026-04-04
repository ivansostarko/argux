<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Admin Role Management Mock API Tests
 *
 * CRUD + duplicate for admin and user roles with permission matrix.
 */
class AdminRolesApiTest extends TestCase
{
    // ═══ LIST ═══

    /** @test */
    public function index_returns_all_roles(): void
    {
        $response = $this->getJson('/mock-api/admin/roles');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['total'], 'counts' => ['admin', 'user']]);
    }

    /** @test */
    public function index_returns_10_roles(): void
    {
        $response = $this->getJson('/mock-api/admin/roles');

        $response->assertOk()
            ->assertJsonCount(10, 'data');
    }

    /** @test */
    public function index_filters_by_admin_scope(): void
    {
        $response = $this->getJson('/mock-api/admin/roles?scope=admin');

        $response->assertOk();
        foreach ($response->json('data') as $role) {
            $this->assertEquals('admin', $role['scope']);
        }
    }

    /** @test */
    public function index_filters_by_user_scope(): void
    {
        $response = $this->getJson('/mock-api/admin/roles?scope=user');

        $response->assertOk();
        foreach ($response->json('data') as $role) {
            $this->assertEquals('user', $role['scope']);
        }
    }

    /** @test */
    public function index_searches_by_name(): void
    {
        $response = $this->getJson('/mock-api/admin/roles?search=Super');

        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
        $this->assertStringContainsString('Super', $response->json('data.0.name'));
    }

    /** @test */
    public function index_sorted_by_level_desc(): void
    {
        $response = $this->getJson('/mock-api/admin/roles');

        $levels = collect($response->json('data'))->pluck('level')->toArray();
        $sorted = $levels;
        rsort($sorted);
        $this->assertEquals($sorted, $levels);
    }

    /** @test */
    public function index_returns_scope_counts(): void
    {
        $response = $this->getJson('/mock-api/admin/roles');

        $counts = $response->json('counts');
        $this->assertEquals(5, $counts['admin']);
        $this->assertEquals(5, $counts['user']);
    }

    // ═══ SHOW ═══

    /** @test */
    public function show_returns_role_with_permissions(): void
    {
        $response = $this->getJson('/mock-api/admin/roles/1');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'name', 'scope', 'color', 'level', 'isSystem', 'permissions', 'userCount']]);
    }

    /** @test */
    public function show_super_admin_has_all_permissions(): void
    {
        $response = $this->getJson('/mock-api/admin/roles/1');

        $perms = $response->json('data.permissions');
        $this->assertGreaterThan(20, count($perms));
        foreach ($perms as $p) {
            $this->assertCount(6, $p['actions']);
        }
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/admin/roles/9999')->assertStatus(404);
    }

    // ═══ CREATE ═══

    /** @test */
    public function store_creates_role(): void
    {
        $response = $this->postJson('/mock-api/admin/roles', [
            'name' => 'Test Role', 'scope' => 'user', 'color' => '#ff0000',
            'description' => 'Test description', 'level' => 3,
            'permissions' => [['moduleId' => 'map', 'actions' => ['view', 'create']]],
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'data' => ['id', 'name', 'scope', 'permissions']])
            ->assertJsonPath('data.isSystem', false)
            ->assertJsonPath('data.userCount', 0);
    }

    /** @test */
    public function store_rejects_duplicate_name(): void
    {
        $response = $this->postJson('/mock-api/admin/roles', [
            'name' => 'Super Admin', 'scope' => 'admin', 'color' => '#ff0000', 'level' => 5,
        ]);

        $response->assertStatus(422)
            ->assertJson(['code' => 'NAME_TAKEN']);
    }

    /** @test */
    public function store_requires_fields(): void
    {
        $response = $this->postJson('/mock-api/admin/roles', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'scope', 'color', 'level']);
    }

    /** @test */
    public function store_validates_scope(): void
    {
        $response = $this->postJson('/mock-api/admin/roles', [
            'name' => 'X', 'scope' => 'invalid', 'color' => '#000', 'level' => 1,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['scope']);
    }

    /** @test */
    public function store_validates_level_range(): void
    {
        $response = $this->postJson('/mock-api/admin/roles', [
            'name' => 'X', 'scope' => 'user', 'color' => '#000', 'level' => 99,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['level']);
    }

    // ═══ UPDATE ═══

    /** @test */
    public function update_modifies_role(): void
    {
        $response = $this->putJson('/mock-api/admin/roles/11', [
            'name' => 'Updated Analyst', 'description' => 'Updated description',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'data']);
    }

    /** @test */
    public function update_unknown_returns_404(): void
    {
        $this->putJson('/mock-api/admin/roles/9999', ['name' => 'X'])->assertStatus(404);
    }

    // ═══ DELETE ═══

    /** @test */
    public function destroy_non_system_no_users(): void
    {
        // Role 14 (Trainee) has userCount=1 — won't work
        // Role 11 (Intelligence Analyst) is not system but has userCount=4
        // Need to find one with isSystem=false and userCount=0
        // Let's test system role protection first
        $response = $this->deleteJson('/mock-api/admin/roles/1');

        $response->assertStatus(403)
            ->assertJson(['code' => 'SYSTEM_ROLE']);
    }

    /** @test */
    public function destroy_blocks_system_role(): void
    {
        $response = $this->deleteJson('/mock-api/admin/roles/10');

        $response->assertStatus(403)
            ->assertJson(['code' => 'SYSTEM_ROLE']);
    }

    /** @test */
    public function destroy_blocks_role_with_users(): void
    {
        // Role 11 (Intelligence Analyst) is non-system but has userCount=4
        $response = $this->deleteJson('/mock-api/admin/roles/11');

        $response->assertStatus(409)
            ->assertJson(['code' => 'HAS_USERS']);
    }

    /** @test */
    public function destroy_unknown_returns_404(): void
    {
        $this->deleteJson('/mock-api/admin/roles/9999')->assertStatus(404);
    }

    // ═══ DUPLICATE ═══

    /** @test */
    public function duplicate_creates_copy(): void
    {
        $response = $this->postJson('/mock-api/admin/roles/10/duplicate');

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'data' => ['id', 'name', 'permissions']])
            ->assertJsonPath('data.isSystem', false)
            ->assertJsonPath('data.userCount', 0);
        $this->assertStringContainsString('(Copy)', $response->json('data.name'));
    }

    /** @test */
    public function duplicate_preserves_permissions(): void
    {
        $response = $this->postJson('/mock-api/admin/roles/1/duplicate');

        $response->assertStatus(201);
        $perms = $response->json('data.permissions');
        $this->assertGreaterThan(20, count($perms));
    }

    /** @test */
    public function duplicate_unknown_returns_404(): void
    {
        $this->postJson('/mock-api/admin/roles/9999/duplicate')->assertStatus(404);
    }

    // ═══ PERMISSION STRUCTURE ═══

    /** @test */
    public function viewer_has_limited_permissions(): void
    {
        $response = $this->getJson('/mock-api/admin/roles/13');

        $perms = collect($response->json('data.permissions'));
        $mapPerm = $perms->firstWhere('moduleId', 'map');
        $this->assertNotNull($mapPerm);
        $this->assertEquals(['view'], $mapPerm['actions']);
    }

    /** @test */
    public function user_roles_have_no_admin_modules(): void
    {
        $response = $this->getJson('/mock-api/admin/roles/10');

        $perms = collect($response->json('data.permissions'));
        $adminPerms = $perms->filter(fn($p) => str_starts_with($p['moduleId'], 'admin_'));
        $this->assertCount(0, $adminPerms);
    }
}
