<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Admin Statistics Mock API Tests
 *
 * Tests all /mock-api/admin/statistics/* endpoints.
 * 6 tabs: overview, activity, devices, alerts, media, subjects.
 */
class AdminStatisticsApiTest extends TestCase
{
    // ═══ INDEX ═══

    /** @test */
    public function index_returns_tab_definitions(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics');

        $response->assertOk()
            ->assertJsonStructure(['tabs', 'generated_at'])
            ->assertJsonCount(6, 'tabs');
    }

    /** @test */
    public function index_tabs_have_id_label_icon(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics');

        foreach ($response->json('tabs') as $tab) {
            $this->assertArrayHasKey('id', $tab);
            $this->assertArrayHasKey('label', $tab);
            $this->assertArrayHasKey('icon', $tab);
        }
    }

    // ═══ OVERVIEW TAB ═══

    /** @test */
    public function overview_returns_kpis_and_charts(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/overview');

        $response->assertOk()
            ->assertJsonPath('tab', 'overview')
            ->assertJsonStructure(['data' => ['kpis', 'event_trend', 'entity_growth', 'storage_donut']]);
    }

    /** @test */
    public function overview_has_6_kpis(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/overview');

        $response->assertJsonCount(6, 'data.kpis');
    }

    /** @test */
    public function overview_event_trend_has_6_months(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/overview');

        $response->assertJsonCount(6, 'data.event_trend');
    }

    // ═══ ACTIVITY TAB ═══

    /** @test */
    public function activity_returns_heatmap_and_charts(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/activity');

        $response->assertOk()
            ->assertJsonPath('tab', 'activity')
            ->assertJsonStructure(['data' => ['heatmap', 'heatmap_days', 'top_subjects', 'event_type_breakdown']]);
    }

    /** @test */
    public function activity_heatmap_is_7x24(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/activity');

        $heatmap = $response->json('data.heatmap');
        $this->assertCount(7, $heatmap);
        foreach ($heatmap as $row) {
            $this->assertCount(24, $row);
        }
    }

    /** @test */
    public function activity_has_8_top_subjects(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/activity');

        $response->assertJsonCount(8, 'data.top_subjects');
    }

    // ═══ DEVICES TAB ═══

    /** @test */
    public function devices_returns_type_and_battery_data(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/devices');

        $response->assertOk()
            ->assertJsonPath('tab', 'devices')
            ->assertJsonStructure(['data' => ['by_type', 'battery_distribution', 'sync_rate']]);
    }

    /** @test */
    public function devices_has_7_types(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/devices');

        $response->assertJsonCount(7, 'data.by_type');
    }

    /** @test */
    public function devices_battery_has_5_ranges(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/devices');

        $response->assertJsonCount(5, 'data.battery_distribution');
    }

    // ═══ ALERTS TAB ═══

    /** @test */
    public function alerts_returns_frequency_and_severity(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/alerts');

        $response->assertOk()
            ->assertJsonPath('tab', 'alerts')
            ->assertJsonStructure(['data' => ['frequency', 'severity_donut', 'response_time', 'top_rules']]);
    }

    /** @test */
    public function alerts_frequency_has_7_days(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/alerts');

        $response->assertJsonCount(7, 'data.frequency');
    }

    /** @test */
    public function alerts_has_3_severity_levels(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/alerts');

        $response->assertJsonCount(3, 'data.severity_donut');
    }

    /** @test */
    public function alerts_has_top_rules(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/alerts');

        $this->assertGreaterThan(0, count($response->json('data.top_rules')));
    }

    // ═══ MEDIA TAB ═══

    /** @test */
    public function media_returns_upload_and_ai_data(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/media');

        $response->assertOk()
            ->assertJsonPath('tab', 'media')
            ->assertJsonStructure(['data' => ['upload_volume', 'ai_processing', 'face_match_rate']]);
    }

    /** @test */
    public function media_has_4_ai_models(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/media');

        $response->assertJsonCount(4, 'data.ai_processing');
    }

    /** @test */
    public function media_face_match_rate_has_6_months(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/media');

        $response->assertJsonCount(6, 'data.face_match_rate');
    }

    // ═══ SUBJECTS TAB ═══

    /** @test */
    public function subjects_returns_persons_and_orgs(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/subjects');

        $response->assertOk()
            ->assertJsonPath('tab', 'subjects')
            ->assertJsonStructure(['data' => ['top_persons', 'top_orgs', 'risk_distribution', 'new_entities_trend']]);
    }

    /** @test */
    public function subjects_has_10_top_persons(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/subjects');

        $response->assertJsonCount(10, 'data.top_persons');
    }

    /** @test */
    public function subjects_has_4_risk_levels(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/subjects');

        $response->assertJsonCount(4, 'data.risk_distribution');
    }

    // ═══ INVALID TAB ═══

    /** @test */
    public function invalid_tab_returns_404(): void
    {
        $response = $this->getJson('/mock-api/admin/statistics/bogus');

        $response->assertStatus(404)
            ->assertJson(['code' => 'INVALID_TAB']);
    }

    // ═══ ALL TABS WORK ═══

    /** @test */
    public function all_6_tabs_return_data(): void
    {
        $tabs = ['overview', 'activity', 'devices', 'alerts', 'media', 'subjects'];
        foreach ($tabs as $tab) {
            $response = $this->getJson("/mock-api/admin/statistics/{$tab}");
            $response->assertOk()->assertJsonPath('tab', $tab)->assertJsonStructure(['data']);
        }
    }
}
