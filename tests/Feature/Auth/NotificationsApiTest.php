<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Notifications Mock API Tests
 */
class NotificationsApiTest extends TestCase
{
    /** @test */
    public function index_returns_20_notifications(): void
    {
        $this->getJson('/mock-api/notifications')
            ->assertOk()
            ->assertJsonCount(20, 'data')
            ->assertJsonStructure(['meta' => ['total'], 'counts' => ['all', 'unread', 'critical', 'warning', 'info']]);
    }

    /** @test */
    public function index_filters_by_severity(): void
    {
        $response = $this->getJson('/mock-api/notifications?severity=critical');
        $response->assertOk();
        foreach ($response->json('data') as $n) {
            $this->assertEquals('critical', $n['severity']);
        }
    }

    /** @test */
    public function index_filters_by_type(): void
    {
        $response = $this->getJson('/mock-api/notifications?type=security');
        $response->assertOk();
        foreach ($response->json('data') as $n) {
            $this->assertEquals('security', $n['type']);
        }
    }

    /** @test */
    public function index_filters_unread_only(): void
    {
        $response = $this->getJson('/mock-api/notifications?unread=1');
        $response->assertOk();
        foreach ($response->json('data') as $n) {
            $this->assertFalse($n['read']);
        }
        $this->assertCount(5, $response->json('data'));
    }

    /** @test */
    public function index_counts_are_correct(): void
    {
        $response = $this->getJson('/mock-api/notifications');
        $counts = $response->json('counts');
        $this->assertEquals(20, $counts['all']);
        $this->assertEquals(5, $counts['unread']);
        $this->assertEquals(4, $counts['critical']);
        $this->assertEquals(6, $counts['warning']);
        $this->assertEquals(10, $counts['info']);
    }

    /** @test */
    public function index_notifications_have_structure(): void
    {
        $response = $this->getJson('/mock-api/notifications');
        foreach ($response->json('data') as $n) {
            $this->assertArrayHasKey('id', $n);
            $this->assertArrayHasKey('type', $n);
            $this->assertArrayHasKey('severity', $n);
            $this->assertArrayHasKey('title', $n);
            $this->assertArrayHasKey('body', $n);
            $this->assertArrayHasKey('read', $n);
            $this->assertArrayHasKey('source', $n);
        }
    }

    /** @test */
    public function toggle_read_succeeds(): void
    {
        $response = $this->patchJson('/mock-api/notifications/1/read', ['read' => true]);
        $response->assertOk()
            ->assertJson(['id' => 1, 'read' => true]);
    }

    /** @test */
    public function toggle_read_unread(): void
    {
        $response = $this->patchJson('/mock-api/notifications/6/read', ['read' => false]);
        $response->assertOk()
            ->assertJson(['id' => 6, 'read' => false]);
    }

    /** @test */
    public function toggle_read_unknown_returns_404(): void
    {
        $this->patchJson('/mock-api/notifications/999/read', ['read' => true])
            ->assertStatus(404);
    }

    /** @test */
    public function read_all_returns_count(): void
    {
        $response = $this->postJson('/mock-api/notifications/read-all');
        $response->assertOk()
            ->assertJsonStructure(['message', 'marked'])
            ->assertJson(['marked' => 5]);
    }
}
