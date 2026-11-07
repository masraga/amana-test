<?php

namespace App\Services;

use App\Repositories\Contracts\ReportRepositoryInterface;

class DashboardService
{
    public function __construct(private readonly ReportRepositoryInterface $reportRepository) {}

    /** @return array<string, int> */
    public function getStatsForUser(int $userId): array
    {
        return $this->reportRepository->getStatusCountsForUser($userId);
    }

    /** @return array<string, int> */
    public function getStatsForAdmin(): array
    {
        return $this->reportRepository->getStatusCountsAll();
    }
}
