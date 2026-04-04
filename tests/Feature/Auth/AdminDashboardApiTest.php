<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Admin Dashboard Mock API Tests
 *
 * Tests all /mock-api/admin/dashboard/* endpoints:
 *   GET  stats, kpis, services, activity, storage
 *   POST action, service restart
 */
class AdminDashboardApiTest extends TestCase
{
    // ═══ STATS (ALL-IN-ONE) ═══

    /** @test */
    public function stats_returns_all_dashboard_data(): void
    {
        $response = $this->getJson('/mock-api/admin/dashboard/stats');

        $response->assertOk()
            ->assertJsonStructure([
                'kpis',
                'services',
                'activity',
                'storage',
                'system' => ['status', 'uptime_days', 'last_backup', 'version', 'server_time'],
            ]);
    }

    /** @test */
    public function stats_system_is_online(): void
    {
        $response = $this->getJson('/mock-api/admin/dashboard/stats');

        $response->assertOk()
            ->assertJsonPath('system.status', 'online');
    }

    // ═══ KPIs ═══

    /** @test */
    public function kpis_returns_8_cards(): void
    {
        $response = $this->getJson('/mock-api/admin/dashboard/kpis');

        $response->assertOk()
            ->assertJsonCount(8, 'data');
    }

    /** @test */
    public function kpis_have_required_structure(): void
    {
        $response = $this->getJson('/mock-api/admin/dashboard/kpis');

        $first = $response->json('data.0');
        $this->assertArrayHasKey('id', $first);
        $this->assertArrayHasKey('label', $first);
        $this->assertArrayHasKey('value', $first);
        $this->assertArrayHasKey('color', $first);
        $this->assertArrayHasKey('sparkline', $first);
        $this->assertArrayHasKey('trend', $first);
    }

    /** @test */
    public function kpis_include_users_sessions_uptime(): void
    {
        $response = $this->getJson('/mock-api/admin/dashboard/kpis');

        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains('users', $ids);
        $this->assertContains('sessions', $ids);
        $this->assertContains('uptime', $ids);
    }

    // ═══ SERVICES ═══

    /** @test */
    public function services_returns_12_services(): void
    {
        $response = $this->getJson('/mock-api/admin/dashboard/services');

        $response->assertOk()
            ->assertJsonCount(12, 'data');
    }

    /** @test */
    public function services_returns_summary(): void
    {
        $response = $this->getJson('/mock-api/admin/dashboard/services');

        $response->assertOk()
            ->assertJsonStructure(['summary' => ['total', 'healthy', 'degraded', 'down']]);
    }

    /** @test */
    public function services_has_degraded_services(): void
    {
        $response = $this->getJson('/mock-api/admin/dashboard/services');

        $degraded = collect($response->json('data'))->where('status', 'degraded')->count();
        $this->assertGreaterThan(0, $degraded);
    }

    /** @test */
    public function services_have_correct_structure(): void
    {
        $response = $this->getJson('/mock-api/admin/dashboard/services');

        $first = $response->json('data.0');
        $this->assertArrayHasKey('name', $first);
        $this->assertArrayHasKey('status', $first);
        $this->assertArrayHasKey('uptime', $first);
        $this->assertArrayHasKey('latency', $first);
        $this->assertArrayHasKey('cpu', $first);
    }

    // ═══ ACTIVITY ═══

    /** @test */
    public function activity_returns_events(): void
    {
        $response = $this->getJson('/mock-api/admin/dashboard/activity');

        $response->assertOk()
            ->assertJsonStructure(['data' => [['id', 'type', 'title', 'description', 'time', 'timestamp']], 'meta' => ['total']]);
    }

    /** @test */
    public function activity_returns_10_events(): void
    {
        $response = $this->getJson('/mock-api/admin/dashboard/activity');

        $response->assertJsonCount(10, 'data');
    }

    /** @test */
    public function activity_filterable_by_type(): void
    {
        $response = $this->getJson('/mock-api/admin/dashboard/activity?type=login');

        $response->assertOk();
        $types = collect($response->json('data'))->pluck('type')->unique()->toArray();
        $this->assertEquals(['login'], $types);
    }

    /** @test */
    public function activity_filter_all_returns_everything(): void
    {
        $response = $this->getJson('/mock-api/admin/dashboard/activity?type=all');

        $response->assertOk()
            ->assertJsonCount(10, 'data');
    }

    // ═══ STORAGE ═══

    /** @test */
    public function storage_returns_breakdown(): void
    {
        $response = $this->getJson('/mock-api/admin/dashboard/storage');

        $response->assertOk()
            ->assertJsonStructure(['breakdown', 'total_bytes', 'used_bytes', 'used_percent', 'total_formatted', 'used_formatted']);
    }

    /** @test */
    public function storage_breakdown_has_7_categories(): void
    {
        $response = $this->getJson('/mock-api/admin/dashboard/storage');

        $response->assertJsonCount(7, 'breakdown');
    }

    /** @test */
    public function storage_used_percent_is_reasonable(): void
    {
        $response = $this->getJson('/mock-api/admin/dashboard/storage');

        $pct = $response->json('used_percent');
        $this->assertGreaterThan(0, $pct);
        $this->assertLessThan(100, $pct);
    }

    // ═══ QUICK ACTIONS ═══

    /** @test */
    public function action_clear_cache_returns_success(): void
    {
        $response = $this->postJson('/mock-api/admin/dashboard/action', ['action' => 'clear_cache']);

        $response->assertOk()
            ->assertJsonStructure(['message', 'action', 'executed_at', 'executed_by'])
            ->assertJson(['action' => 'clear_cache']);
    }

    /** @test */
    public function action_restart_workers_returns_success(): void
    {
        $response = $this->postJson('/mock-api/admin/dashboard/action', ['action' => 'restart_workers']);

        $response->assertOk()
            ->assertJson(['action' => 'restart_workers'])
            ->assertJsonStructure(['duration', 'affected']);
    }

    /** @test */
    public function action_force_sync_returns_job_id(): void
    {
        $response = $this->postJson('/mock-api/admin/dashboard/action', ['action' => 'force_sync']);

        $response->assertOk()
            ->assertJsonStructure(['job_id']);
        $this->assertStringStartsWith('job_', $response->json('job_id'));
    }

    /** @test */
    public function action_system_report_returns_report_id(): void
    {
        $response = $this->postJson('/mock-api/admin/dashboard/action', ['action' => 'system_report']);

        $response->assertOk()
            ->assertJsonStructure(['report_id']);
    }

    /** @test */
    public function action_kill_sessions_returns_affected_count(): void
    {
        $response = $this->postJson('/mock-api/admin/dashboard/action', ['action' => 'kill_sessions']);

        $response->assertOk()
            ->assertJsonStructure(['affected']);
    }

    /** @test */
    public function action_requires_valid_action_name(): void
    {
        $response = $this->postJson('/mock-api/admin/dashboard/action', ['action' => 'invalid_action']);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['action']);
    }

    /** @test */
    public function action_requires_action_field(): void
    {
        $response = $this->postJson('/mock-api/admin/dashboard/action', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['action']);
    }

    // ═══ SERVICE RESTART ═══

    /** @test */
    public function restart_service_returns_success(): void
    {
        $response = $this->postJson('/mock-api/admin/dashboard/service/s9/restart');

        $response->assertOk()
            ->assertJsonStructure(['message', 'service_id', 'new_status', 'restart_time'])
            ->assertJson(['service_id' => 's9', 'new_status' => 'healthy']);
    }

    /** @test */
    public function restart_unknown_service_returns_404(): void
    {
        $response = $this->postJson('/mock-api/admin/dashboard/service/s999/restart');

        $response->assertStatus(404)
            ->assertJson(['code' => 'SERVICE_NOT_FOUND']);
    }

    // ═══ ALL 8 ACTIONS ═══

    /** @test */
    public function all_8_actions_work(): void
    {
        $actions = ['clear_cache', 'restart_workers', 'force_sync', 'system_report', 'backup_now', 'rebuild_index', 'purge_logs', 'kill_sessions'];

        foreach ($actions as $action) {
            $response = $this->postJson('/mock-api/admin/dashboard/action', ['action' => $action]);
            $response->assertOk()->assertJson(['action' => $action]);
        }
    }
}
