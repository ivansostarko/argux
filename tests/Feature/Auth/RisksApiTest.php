<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * ARGUX — Risks Dashboard Mock API Tests
 *
 * Summary KPIs, person/org factor breakdowns, factor categories.
 */
class RisksApiTest extends TestCase
{
    // ═══ SUMMARY ═══

    /** @test */
    public function summary_returns_entity_risk_counts(): void
    {
        $response = $this->getJson('/mock-api/risks/summary');

        $response->assertOk()
            ->assertJsonStructure(['persons', 'organizations', 'vehicles']);
    }

    /** @test */
    public function summary_persons_has_risk_levels(): void
    {
        $response = $this->getJson('/mock-api/risks/summary');

        $persons = $response->json('persons');
        foreach (['Critical', 'High', 'Medium', 'Low', 'total'] as $key) {
            $this->assertArrayHasKey($key, $persons);
        }
    }

    /** @test */
    public function summary_total_counts_correct(): void
    {
        $response = $this->getJson('/mock-api/risks/summary');

        $this->assertEquals(23, $response->json('persons.total'));
        $this->assertEquals(13, $response->json('organizations.total'));
        $this->assertEquals(20, $response->json('vehicles.total'));
    }

    // ═══ PERSON FACTORS ═══

    /** @test */
    public function person_factors_horvat_returns_6(): void
    {
        $response = $this->getJson('/mock-api/risks/persons/1/factors');

        $response->assertOk()
            ->assertJsonCount(6, 'data');
    }

    /** @test */
    public function person_factors_have_structure(): void
    {
        $response = $this->getJson('/mock-api/risks/persons/1/factors');

        foreach ($response->json('data') as $f) {
            $this->assertArrayHasKey('id', $f);
            $this->assertArrayHasKey('category', $f);
            $this->assertArrayHasKey('icon', $f);
            $this->assertArrayHasKey('label', $f);
            $this->assertArrayHasKey('severity', $f);
            $this->assertArrayHasKey('score', $f);
            $this->assertArrayHasKey('detail', $f);
        }
    }

    /** @test */
    public function person_factors_mendoza(): void
    {
        $response = $this->getJson('/mock-api/risks/persons/9/factors');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    /** @test */
    public function person_factors_babic(): void
    {
        $response = $this->getJson('/mock-api/risks/persons/12/factors');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    /** @test */
    public function person_factors_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/risks/persons/999/factors')->assertStatus(404);
    }

    // ═══ ORG FACTORS ═══

    /** @test */
    public function org_factors_adriatic_returns_3(): void
    {
        $response = $this->getJson('/mock-api/risks/organizations/101/factors');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    /** @test */
    public function org_factors_meridian(): void
    {
        $response = $this->getJson('/mock-api/risks/organizations/103/factors');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    /** @test */
    public function org_factors_unknown_returns_404(): void
    {
        $this->getJson('/mock-api/risks/organizations/999/factors')->assertStatus(404);
    }

    // ═══ FACTOR CATEGORIES ═══

    /** @test */
    public function factor_categories_returns_list(): void
    {
        $response = $this->getJson('/mock-api/risks/factor-categories');

        $response->assertOk()
            ->assertJsonCount(8, 'data');
    }

    /** @test */
    public function factor_categories_have_structure(): void
    {
        $response = $this->getJson('/mock-api/risks/factor-categories');

        foreach ($response->json('data') as $fc) {
            $this->assertArrayHasKey('id', $fc);
            $this->assertArrayHasKey('label', $fc);
            $this->assertArrayHasKey('icon', $fc);
            $this->assertArrayHasKey('color', $fc);
        }
    }
}
