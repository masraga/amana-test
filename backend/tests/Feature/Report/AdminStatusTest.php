<?php

namespace Tests\Feature\Report;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminStatusTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $reporter;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'administrator']);
        $this->reporter = User::factory()->create(['role' => 'reporter']);
    }

    public function test_admin_can_update_status_to_under_review(): void
    {
        $report = Report::factory()->submitted()->create(['user_id' => $this->reporter->id]);

        $response = $this->actingAs($this->admin, 'api')
            ->patchJson("/api/v1/admin/reports/{$report->id}/status", [
                'status' => 'under_review',
            ]);

        $response->assertStatus(200)->assertJson(['success' => true]);

        $this->assertDatabaseHas('reports', [
            'id' => $report->id,
            'status' => 'under_review',
        ]);
    }

    public function test_reporter_cannot_update_status(): void
    {
        $report = Report::factory()->submitted()->create(['user_id' => $this->reporter->id]);

        $response = $this->actingAs($this->reporter, 'api')
            ->patchJson("/api/v1/admin/reports/{$report->id}/status", [
                'status' => 'under_review',
            ]);

        $response->assertStatus(403);
    }

    public function test_admin_cannot_set_status_to_draft(): void
    {
        $report = Report::factory()->submitted()->create(['user_id' => $this->reporter->id]);

        $response = $this->actingAs($this->admin, 'api')
            ->patchJson("/api/v1/admin/reports/{$report->id}/status", [
                'status' => 'draft',
            ]);

        $response->assertStatus(422);
    }

    public function test_admin_can_view_all_submitted_reports(): void
    {
        Report::factory()->submitted()->count(3)->create(['user_id' => $this->reporter->id]);

        $response = $this->actingAs($this->admin, 'api')->getJson('/api/v1/admin/reports');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'items',
                    'meta',
                ],
            ]);
    }

    public function test_admin_can_mark_report_as_resolved(): void
    {
        $report = Report::factory()->underReview()->create(['user_id' => $this->reporter->id]);

        $response = $this->actingAs($this->admin, 'api')
            ->patchJson("/api/v1/admin/reports/{$report->id}/status", [
                'status' => 'resolved',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('reports', [
            'id' => $report->id,
            'status' => 'resolved',
        ]);
    }
}
