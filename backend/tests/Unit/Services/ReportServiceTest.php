<?php

namespace Tests\Unit\Services;

use App\Models\Report;
use App\Repositories\Contracts\ReportRepositoryInterface;
use App\Services\ReportService;
use Mockery;
use Mockery\MockInterface;
use PHPUnit\Framework\TestCase;

class ReportServiceTest extends TestCase
{
    private MockInterface $reportRepository;
    private ReportService $reportService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->reportRepository = Mockery::mock(ReportRepositoryInterface::class);
        $this->reportService = new ReportService($this->reportRepository);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_generate_reference_number_starts_with_rpt(): void
    {
        $ref = $this->reportService->generateReferenceNumber();

        $this->assertStringStartsWith('RPT-', $ref);
    }

    public function test_generate_reference_number_contains_date(): void
    {
        $ref = $this->reportService->generateReferenceNumber();
        $date = now()->format('Ymd');

        $this->assertStringContainsString($date, $ref);
    }

    public function test_create_report_defaults_to_draft_status(): void
    {
        $data = [
            'title' => 'Test',
            'category' => 'fraud',
            'description' => 'Test description',
            'incident_date' => '2026-01-01',
        ];

        $report = new Report();

        $this->reportRepository
            ->shouldReceive('create')
            ->once()
            ->with(Mockery::on(function (array $arg) {
                return $arg['status'] === 'draft';
            }))
            ->andReturn($report);

        $result = $this->reportService->createReport($data, 1);

        $this->assertInstanceOf(Report::class, $result);
    }

    public function test_create_report_generates_reference_number(): void
    {
        $data = [
            'title' => 'Test',
            'category' => 'fraud',
            'description' => 'Test description',
            'incident_date' => '2026-01-01',
        ];

        $report = new Report();

        $this->reportRepository
            ->shouldReceive('create')
            ->once()
            ->with(Mockery::on(function (array $arg) {
                return str_starts_with($arg['reference_number'], 'RPT-');
            }))
            ->andReturn($report);

        $this->reportService->createReport($data, 1);

        $this->assertTrue(true);
    }

    public function test_update_non_draft_report_throws_logic_exception(): void
    {
        $this->expectException(\LogicException::class);

        $report = Mockery::mock(Report::class);
        $report->shouldReceive('isDraft')->andReturn(false);

        $this->reportService->updateReport($report, ['title' => 'New Title']);
    }

    public function test_delete_non_draft_report_throws_logic_exception(): void
    {
        $this->expectException(\LogicException::class);

        $report = Mockery::mock(Report::class);
        $report->shouldReceive('isDraft')->andReturn(false);

        $this->reportService->deleteReport($report);
    }

    public function test_submit_changes_status_to_submitted(): void
    {
        $report = Mockery::mock(Report::class);
        $report->shouldReceive('isDraft')->andReturn(true);

        $this->reportRepository
            ->shouldReceive('update')
            ->once()
            ->with($report, ['status' => 'submitted'])
            ->andReturn($report);

        $this->reportService->submitReport($report);

        $this->assertTrue(true);
    }

    public function test_update_status_accepts_valid_statuses(): void
    {
        $report = Mockery::mock(Report::class);

        foreach (['submitted', 'under_review', 'resolved'] as $status) {
            $this->reportRepository
                ->shouldReceive('update')
                ->once()
                ->with($report, ['status' => $status])
                ->andReturn($report);

            $this->reportService->updateStatus($report, $status);
        }

        $this->assertTrue(true);
    }

    public function test_update_status_rejects_draft_status(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        $report = Mockery::mock(Report::class);

        $this->reportService->updateStatus($report, 'draft');
    }
}
