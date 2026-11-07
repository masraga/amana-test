<?php

namespace App\Repositories;

use App\Models\Report;
use App\Repositories\Contracts\ReportRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ReportRepository implements ReportRepositoryInterface
{
    public function findById(int $id): ?Report
    {
        return Report::find($id);
    }

    /** @param array<string, mixed> $filters */
    public function findAllForUser(int $userId, array $filters): LengthAwarePaginator
    {
        $query = Report::forUser($userId)->latest();

        $this->applyFilters($query, $filters);

        return $query->paginate(15);
    }

    /** @param array<string, mixed> $filters */
    public function findAllSubmitted(array $filters): LengthAwarePaginator
    {
        $query = Report::submittedOrHigher()->latest();

        $this->applyFilters($query, $filters);

        return $query->paginate(15);
    }

    /** @param array<string, mixed> $data */
    public function create(array $data): Report
    {
        return Report::create($data);
    }

    /** @param array<string, mixed> $data */
    public function update(Report $report, array $data): Report
    {
        $report->update($data);

        return $report->fresh();
    }

    public function delete(Report $report): bool
    {
        return $report->delete();
    }

    /** @return array<string, int> */
    public function getStatusCountsForUser(int $userId): array
    {
        $counts = Report::forUser($userId)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        return $this->normalizeStatusCounts($counts);
    }

    /** @return array<string, int> */
    public function getStatusCountsAll(): array
    {
        $counts = Report::submittedOrHigher()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        return $this->normalizeStatusCounts($counts, false);
    }

    /** @param \Illuminate\Database\Eloquent\Builder<Report> $query
     *  @param array<string, mixed> $filters
     */
    private function applyFilters(\Illuminate\Database\Eloquent\Builder $query, array $filters): void
    {
        if (!empty($filters['title'])) {
            $query->where('title', 'like', '%' . $filters['title'] . '%');
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
    }

    /**
     * @param array<string, int> $counts
     * @return array<string, int>
     */
    private function normalizeStatusCounts(array $counts, bool $includeDraft = true): array
    {
        $statuses = $includeDraft
            ? ['draft', 'submitted', 'under_review', 'resolved']
            : ['submitted', 'under_review', 'resolved'];

        $normalized = [];
        foreach ($statuses as $status) {
            $normalized[$status] = $counts[$status] ?? 0;
        }

        $total = $includeDraft
            ? array_sum($normalized)
            : array_sum($normalized);

        return array_merge(['total' => $total], $normalized);
    }
}
