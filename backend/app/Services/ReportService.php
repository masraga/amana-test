<?php

namespace App\Services;

use App\Models\Report;
use App\Repositories\Contracts\ReportRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ReportService
{
    public function __construct(private readonly ReportRepositoryInterface $reportRepository) {}

    public function generateReferenceNumber(): string
    {
        $date = now()->format('Ymd');
        $suffix = strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 5));

        return "RPT-{$date}-{$suffix}";
    }

    /**
     * @param array<string, mixed> $data
     */
    public function createReport(array $data, int $userId): Report
    {
        return $this->reportRepository->create([
            'reference_number' => $this->generateReferenceNumber(),
            'user_id' => $userId,
            'title' => $data['title'],
            'category' => $data['category'],
            'description' => $data['description'],
            'incident_date' => $data['incident_date'],
            'status' => 'draft',
        ]);
    }

    /**
     * @param array<string, mixed> $data
     * @throws \LogicException
     */
    public function updateReport(Report $report, array $data): Report
    {
        if (!$report->isDraft()) {
            throw new \LogicException('Only draft reports can be edited.');
        }

        return $this->reportRepository->update($report, $data);
    }

    /**
     * @throws \LogicException
     */
    public function submitReport(Report $report): Report
    {
        if (!$report->isDraft()) {
            throw new \LogicException('Only draft reports can be submitted.');
        }

        return $this->reportRepository->update($report, ['status' => 'submitted']);
    }

    /**
     * @throws \LogicException
     */
    public function deleteReport(Report $report): bool
    {
        if (!$report->isDraft()) {
            throw new \LogicException('Only draft reports can be deleted.');
        }

        return $this->reportRepository->delete($report);
    }

    /**
     * @throws \InvalidArgumentException
     */
    public function updateStatus(Report $report, string $status): Report
    {
        $allowedStatuses = ['submitted', 'under_review', 'resolved'];

        if (!in_array($status, $allowedStatuses, true)) {
            throw new \InvalidArgumentException("Status '{$status}' is not allowed.");
        }

        return $this->reportRepository->update($report, ['status' => $status]);
    }

    /** @param array<string, mixed> $filters */
    public function getReportsForUser(int $userId, array $filters): LengthAwarePaginator
    {
        return $this->reportRepository->findAllForUser($userId, $filters);
    }

    /** @param array<string, mixed> $filters */
    public function getAllReports(array $filters): LengthAwarePaginator
    {
        return $this->reportRepository->findAllSubmitted($filters);
    }
}
