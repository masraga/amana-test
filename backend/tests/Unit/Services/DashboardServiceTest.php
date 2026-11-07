<?php

namespace Tests\Unit\Services;

use App\Repositories\Contracts\ReportRepositoryInterface;
use App\Services\DashboardService;
use Mockery;
use Mockery\MockInterface;
use PHPUnit\Framework\TestCase;

class DashboardServiceTest extends TestCase
{
    private MockInterface $reportRepository;
    private DashboardService $dashboardService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->reportRepository = Mockery::mock(ReportRepositoryInterface::class);
        $this->dashboardService = new DashboardService($this->reportRepository);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_get_stats_for_user_returns_correct_keys(): void
    {
        $expected = [
            'total' => 5,
            'draft' => 2,
            'submitted' => 1,
            'under_review' => 1,
            'resolved' => 1,
        ];

        $this->reportRepository
            ->shouldReceive('getStatusCountsForUser')
            ->once()
            ->with(1)
            ->andReturn($expected);

        $result = $this->dashboardService->getStatsForUser(1);

        $this->assertArrayHasKey('total', $result);
        $this->assertArrayHasKey('draft', $result);
        $this->assertArrayHasKey('submitted', $result);
        $this->assertArrayHasKey('under_review', $result);
        $this->assertArrayHasKey('resolved', $result);
    }

    public function test_get_stats_for_admin_does_not_include_draft(): void
    {
        $expected = [
            'total' => 3,
            'submitted' => 1,
            'under_review' => 1,
            'resolved' => 1,
        ];

        $this->reportRepository
            ->shouldReceive('getStatusCountsAll')
            ->once()
            ->andReturn($expected);

        $result = $this->dashboardService->getStatsForAdmin();

        $this->assertArrayNotHasKey('draft', $result);
        $this->assertEquals(3, $result['total']);
    }
}
