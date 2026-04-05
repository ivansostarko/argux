<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Alert Rules & Events Mock API Tests
 */
class AlertsApiTest extends TestCase
{
    // ═══ RULES LIST ═══

    /** @test */
    public function rules_returns_13_entries(): void
    {
        $this->getJson('/mock-api/alerts/rules')
            ->assertOk()
            ->assertJsonCount(13, 'data')
            ->assertJsonStructure(['meta' => ['total']]);
    }

    /** @test */
    public function rules_have_required_structure(): void
    {
        $response = $this->getJson('/mock-api/alerts/rules');
        foreach ($response->json('data') as $r) {
            $this->assertArrayHasKey('id', $r);
            $this->assertArrayHasKey('name', $r);
            $this->assertArrayHasKey('triggerType', $r);
            $this->assertArrayHasKey('severity', $r);
            $this->assertArrayHasKey('enabled', $r);
            $this->assertArrayHasKey('channels', $r);
            $this->assertArrayHasKey('firedCount', $r);
            $this->assertArrayHasKey('config', $r);
        }
    }

    /** @test */
    public function rules_filter_by_trigger_type(): void
    {
        $response = $this->getJson('/mock-api/alerts/rules?type=zone_entry');
        $response->assertOk();
        foreach ($response->json('data') as $r) {
            $this->assertEquals('zone_entry', $r['triggerType']);
        }
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function rules_filter_by_severity(): void
    {
        $response = $this->getJson('/mock-api/alerts/rules?severity=Critical');
        $response->assertOk();
        foreach ($response->json('data') as $r) {
            $this->assertEquals('Critical', $r['severity']);
        }
    }

    /** @test */
    public function rules_filter_enabled_only(): void
    {
        $response = $this->getJson('/mock-api/alerts/rules?enabled=enabled');
        $response->assertOk();
        foreach ($response->json('data') as $r) {
            $this->assertTrue($r['enabled']);
        }
    }

    /** @test */
    public function rules_filter_disabled_only(): void
    {
        $response = $this->getJson('/mock-api/alerts/rules?enabled=disabled');
        $response->assertOk();
        foreach ($response->json('data') as $r) {
            $this->assertFalse($r['enabled']);
        }
        $this->assertCount(2, $response->json('data'));
    }

    /** @test */
    public function rules_search(): void
    {
        $response = $this->getJson('/mock-api/alerts/rules?search=Horvat');
        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    // ═══ RULE DETAIL ═══

    /** @test */
    public function show_rule(): void
    {
        $this->getJson('/mock-api/alerts/rules/ar01')
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'name', 'triggerType', 'severity', 'config', 'targetPersonNames']]);
    }

    /** @test */
    public function show_rule_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/alerts/rules/ar999')->assertStatus(404);
    }

    // ═══ CREATE RULE ═══

    /** @test */
    public function store_rule(): void
    {
        $response = $this->postJson('/mock-api/alerts/rules', [
            'name' => 'Test Zone Alert',
            'triggerType' => 'zone_entry',
            'severity' => 'Warning',
            'channels' => ['In-App'],
            'cooldown' => 30,
        ]);
        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'data' => ['id', 'name', 'triggerType', 'enabled']]);
        $this->assertTrue($response->json('data.enabled'));
        $this->assertEquals(0, $response->json('data.firedCount'));
    }

    /** @test */
    public function store_rule_validation(): void
    {
        $this->postJson('/mock-api/alerts/rules', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'triggerType', 'severity', 'channels']);
    }

    /** @test */
    public function store_rule_invalid_trigger(): void
    {
        $this->postJson('/mock-api/alerts/rules', [
            'name' => 'Test', 'triggerType' => 'invalid', 'severity' => 'Warning', 'channels' => ['In-App'],
        ])->assertStatus(422)->assertJsonValidationErrors(['triggerType']);
    }

    // ═══ TOGGLE ═══

    /** @test */
    public function toggle_rule_enabled(): void
    {
        $response = $this->patchJson('/mock-api/alerts/rules/ar01/toggle');
        $response->assertOk()
            ->assertJson(['id' => 'ar01', 'enabled' => false]);
    }

    /** @test */
    public function toggle_disabled_rule(): void
    {
        $response = $this->patchJson('/mock-api/alerts/rules/ar12/toggle');
        $response->assertOk()
            ->assertJson(['id' => 'ar12', 'enabled' => true]);
    }

    /** @test */
    public function toggle_unknown_returns_404(): void
    {
        $this->patchJson('/mock-api/alerts/rules/ar999/toggle')->assertStatus(404);
    }

    // ═══ DELETE ═══

    /** @test */
    public function delete_rule(): void
    {
        $this->deleteJson('/mock-api/alerts/rules/ar01')
            ->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function delete_unknown_returns_404(): void
    {
        $this->deleteJson('/mock-api/alerts/rules/ar999')->assertStatus(404);
    }

    // ═══ EVENTS ═══

    /** @test */
    public function events_returns_8(): void
    {
        $this->getJson('/mock-api/alerts/events')
            ->assertOk()
            ->assertJsonCount(8, 'data');
    }

    /** @test */
    public function events_have_structure(): void
    {
        $response = $this->getJson('/mock-api/alerts/events');
        foreach ($response->json('data') as $e) {
            $this->assertArrayHasKey('id', $e);
            $this->assertArrayHasKey('ruleId', $e);
            $this->assertArrayHasKey('triggerType', $e);
            $this->assertArrayHasKey('severity', $e);
            $this->assertArrayHasKey('acknowledged', $e);
        }
    }

    /** @test */
    public function events_filter_by_severity(): void
    {
        $response = $this->getJson('/mock-api/alerts/events?severity=Critical');
        $response->assertOk();
        foreach ($response->json('data') as $e) {
            $this->assertEquals('Critical', $e['severity']);
        }
    }

    /** @test */
    public function events_filter_unacknowledged(): void
    {
        $response = $this->getJson('/mock-api/alerts/events?unacknowledged=1');
        $response->assertOk();
        foreach ($response->json('data') as $e) {
            $this->assertFalse($e['acknowledged']);
        }
        $this->assertCount(3, $response->json('data'));
    }

    // ═══ ACKNOWLEDGE ═══

    /** @test */
    public function acknowledge_event(): void
    {
        $this->patchJson('/mock-api/alerts/events/ae01/acknowledge')
            ->assertOk()
            ->assertJson(['id' => 'ae01', 'acknowledged' => true]);
    }

    /** @test */
    public function acknowledge_unknown_returns_404(): void
    {
        $this->patchJson('/mock-api/alerts/events/ae999/acknowledge')->assertStatus(404);
    }
}
