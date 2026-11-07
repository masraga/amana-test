<?php

namespace Tests\Feature\Report;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $reporter;

    protected function setUp(): void
    {
        parent::setUp();

        $this->reporter = User::factory()->create(['role' => 'reporter']);
    }

    public function test_reporter_can_create_draft_report(): void
    {
        $response = $this->actingAs($this->reporter, 'api')->postJson('/api/v1/reports', [
            'title' => 'Suspected Misuse',
            'category' => 'fraud',
            'description' => 'Details of the incident.',
            'incident_date' => '2026-01-01',
        ]);

        $response->assertStatus(201)->assertJson(['success' => true]);

        $this->assertDatabaseHas('reports', [
            'title' => 'Suspected Misuse',
            'status' => 'draft',
            'user_id' => $this->reporter->id,
        ]);
    }

    public function test_reporter_cannot_edit_submitted_report(): void
    {
        $report = Report::factory()->submitted()->create(['user_id' => $this->reporter->id]);

        $response = $this->actingAs($this->reporter, 'api')->putJson("/api/v1/reports/{$report->id}", [
            'title' => 'Updated Title',
        ]);

        $response->assertStatus(403);
    }

    public function test_reporter_can_delete_draft_report(): void
    {
        $report = Report::factory()->create(['user_id' => $this->reporter->id]);

        $response = $this->actingAs($this->reporter, 'api')->deleteJson("/api/v1/reports/{$report->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('reports', ['id' => $report->id]);
    }

    public function test_reporter_cannot_delete_another_users_report(): void
    {
        $other = User::factory()->create(['role' => 'reporter']);
        $report = Report::factory()->create(['user_id' => $other->id]);

        $response = $this->actingAs($this->reporter, 'api')->deleteJson("/api/v1/reports/{$report->id}");

        $response->assertStatus(403);
    }

    public function test_reporter_can_submit_draft(): void
    {
        $report = Report::factory()->create(['user_id' => $this->reporter->id]);

        $response = $this->actingAs($this->reporter, 'api')->patchJson("/api/v1/reports/{$report->id}/submit");

        $response->assertStatus(200)->assertJson(['success' => true]);

        $this->assertDatabaseHas('reports', [
            'id' => $report->id,
            'status' => 'submitted',
        ]);
    }

    public function test_reporter_can_see_own_reports(): void
    {
        Report::factory()->count(3)->create(['user_id' => $this->reporter->id]);

        $response = $this->actingAs($this->reporter, 'api')->getJson('/api/v1/reports');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'items',
                    'meta' => ['current_page', 'last_page', 'per_page', 'total'],
                ],
            ]);
    }
}
