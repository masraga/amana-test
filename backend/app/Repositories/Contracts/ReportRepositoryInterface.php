<?php

namespace App\Repositories\Contracts;

use App\Models\Report;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ReportRepositoryInterface
{
    public function findById(int $id): ?Report;

    /** @param array<string, mixed> $filters */
    public function findAllForUser(int $userId, array $filters): LengthAwarePaginator;

    /** @param array<string, mixed> $filters */
    public function findAllSubmitted(array $filters): LengthAwarePaginator;

    /** @param array<string, mixed> $data */
    public function create(array $data): Report;

    /** @param array<string, mixed> $data */
    public function update(Report $report, array $data): Report;

    public function delete(Report $report): bool;

    /** @return array<string, int> */
    public function getStatusCountsForUser(int $userId): array;

    /** @return array<string, int> */
    public function getStatusCountsAll(): array;
}
