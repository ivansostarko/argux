<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Background Jobs Mock API Tests
 *
 * List + detail + retry + cancel + delete + clear completed + stats.
 */
class JobsApiTest extends TestCase
{
    // ═══ LIST ═══

    /** @test */
    public function index_returns_jobs_with_counts(): void
    {
        $response = $this->getJson('/mock-api/jobs');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['total'], 'counts' => ['running', 'queued', 'completed', 'failed', 'cancelled'], 'queues']);
    }

    /** @test */
    public function index_returns_16_jobs(): void
    {
        $response = $this->getJson('/mock-api/jobs');

        $response->assertOk()
            ->assertJsonCount(16, 'data');
    }

    /** @test */
    public function index_filters_by_status(): void
    {
        $response = $this->getJson('/mock-api/jobs?status=running');

        $response->assertOk();
        foreach ($response->json('data') as $j) {
            $this->assertEquals('running', $j['status']);
        }
        $this->assertCount(3, $response->json('data'));
    }

    /** @test */
    public function index_filters_by_type(): void
    {
        $response = $this->getJson('/mock-api/jobs?type=ai_inference');

        $response->assertOk();
        foreach ($response->json('data') as $j) {
            $this->assertEquals('ai_inference', $j['type']);
        }
    }

    /** @test */
    public function index_filters_by_queue(): void
    {
        $response = $this->getJson('/mock-api/jobs?queue=ai-high');

        $response->assertOk();
        foreach ($response->json('data') as $j) {
            $this->assertEquals('ai-high', $j['queue']);
        }
    }

    /** @test */
    public function index_searches_by_name(): void
    {
        $response = $this->getJson('/mock-api/jobs?search=Whisper');

        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function index_searches_by_initiator(): void
    {
        $response = $this->getJson('/mock-api/jobs?search=Matić');

        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function index_status_all_returns_everything(): void
    {
        $this->getJson('/mock-api/jobs?status=all')
            ->assertOk()
            ->assertJsonCount(16, 'data');
    }

    /** @test */
    public function index_counts_are_correct(): void
    {
        $response = $this->getJson('/mock-api/jobs');

        $counts = $response->json('counts');
        $this->assertEquals(3, $counts['running']);
        $this->assertEquals(3, $counts['queued']);
        $this->assertEquals(6, $counts['completed']);
        $this->assertEquals(3, $counts['failed']);
        $this->assertEquals(1, $counts['cancelled']);
    }

    // ═══ SHOW ═══

    /** @test */
    public function show_returns_job_detail(): void
    {
        $response = $this->getJson('/mock-api/jobs/j01');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'type', 'name', 'status', 'progress', 'worker', 'queue', 'initiator', 'input', 'error', 'retryCount', 'maxRetries']]);
    }

    /** @test */
    public function show_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/jobs/j999')->assertStatus(404);
    }

    // ═══ RETRY ═══

    /** @test */
    public function retry_failed_job_succeeds(): void
    {
        $response = $this->postJson('/mock-api/jobs/j12/retry');

        $response->assertOk()
            ->assertJsonStructure(['message', 'id', 'new_status', 'retry_count'])
            ->assertJson(['new_status' => 'queued']);
    }

    /** @test */
    public function retry_running_job_blocked(): void
    {
        $response = $this->postJson('/mock-api/jobs/j01/retry');

        $response->assertStatus(409)
            ->assertJson(['code' => 'NOT_FAILED']);
    }

    /** @test */
    public function retry_completed_job_blocked(): void
    {
        $this->postJson('/mock-api/jobs/j07/retry')
            ->assertStatus(409)
            ->assertJson(['code' => 'NOT_FAILED']);
    }

    /** @test */
    public function retry_max_retries_reached(): void
    {
        $response = $this->postJson('/mock-api/jobs/j14/retry');

        $response->assertStatus(409)
            ->assertJson(['code' => 'MAX_RETRIES']);
    }

    /** @test */
    public function retry_unknown_returns_404(): void
    {
        $this->postJson('/mock-api/jobs/j999/retry')->assertStatus(404);
    }

    // ═══ CANCEL ═══

    /** @test */
    public function cancel_running_job_succeeds(): void
    {
        $response = $this->postJson('/mock-api/jobs/j01/cancel');

        $response->assertOk()
            ->assertJson(['new_status' => 'cancelled'])
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function cancel_queued_job_succeeds(): void
    {
        $this->postJson('/mock-api/jobs/j04/cancel')
            ->assertOk()
            ->assertJson(['new_status' => 'cancelled']);
    }

    /** @test */
    public function cancel_completed_job_blocked(): void
    {
        $this->postJson('/mock-api/jobs/j07/cancel')
            ->assertStatus(409)
            ->assertJson(['code' => 'NOT_ACTIVE']);
    }

    /** @test */
    public function cancel_failed_job_blocked(): void
    {
        $this->postJson('/mock-api/jobs/j12/cancel')
            ->assertStatus(409)
            ->assertJson(['code' => 'NOT_ACTIVE']);
    }

    /** @test */
    public function cancel_unknown_returns_404(): void
    {
        $this->postJson('/mock-api/jobs/j999/cancel')->assertStatus(404);
    }

    // ═══ DELETE ═══

    /** @test */
    public function delete_completed_job_succeeds(): void
    {
        $this->deleteJson('/mock-api/jobs/j07')
            ->assertOk()
            ->assertJsonStructure(['message', 'id']);
    }

    /** @test */
    public function delete_failed_job_succeeds(): void
    {
        $this->deleteJson('/mock-api/jobs/j12')->assertOk();
    }

    /** @test */
    public function delete_cancelled_job_succeeds(): void
    {
        $this->deleteJson('/mock-api/jobs/j16')->assertOk();
    }

    /** @test */
    public function delete_running_job_blocked(): void
    {
        $this->deleteJson('/mock-api/jobs/j01')
            ->assertStatus(409)
            ->assertJson(['code' => 'JOB_ACTIVE']);
    }

    /** @test */
    public function delete_queued_job_blocked(): void
    {
        $this->deleteJson('/mock-api/jobs/j04')
            ->assertStatus(409)
            ->assertJson(['code' => 'JOB_ACTIVE']);
    }

    /** @test */
    public function delete_unknown_returns_404(): void
    {
        $this->deleteJson('/mock-api/jobs/j999')->assertStatus(404);
    }

    // ═══ CLEAR COMPLETED ═══

    /** @test */
    public function clear_completed_returns_count(): void
    {
        $response = $this->postJson('/mock-api/jobs/clear-completed');

        $response->assertOk()
            ->assertJsonStructure(['message', 'cleared'])
            ->assertJson(['cleared' => 6]);
    }

    // ═══ STATS ═══

    /** @test */
    public function stats_returns_workers_and_queues(): void
    {
        $response = $this->getJson('/mock-api/jobs/stats');

        $response->assertOk()
            ->assertJsonStructure(['counts', 'total', 'by_type', 'workers', 'queues']);
        $this->assertEquals(16, $response->json('total'));
    }

    /** @test */
    public function stats_workers_have_status(): void
    {
        $response = $this->getJson('/mock-api/jobs/stats');

        $workers = $response->json('workers');
        $this->assertContains('busy', array_values($workers));
        $this->assertContains('idle', array_values($workers));
    }

    // ═══ COMBINED ═══

    /** @test */
    public function combined_status_and_type_filter(): void
    {
        $response = $this->getJson('/mock-api/jobs?status=completed&type=sync');

        $response->assertOk();
        foreach ($response->json('data') as $j) {
            $this->assertEquals('completed', $j['status']);
            $this->assertEquals('sync', $j['type']);
        }
    }
}
