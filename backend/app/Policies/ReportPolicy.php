<?php

namespace App\Policies;

use App\Models\Report;
use App\Models\User;

class ReportPolicy
{
    public function view(User $user, Report $report): bool
    {
        return $user->id === $report->user_id && !$user->isAdministrator();
    }

    public function update(User $user, Report $report): bool
    {
        return $user->id === $report->user_id && $report->isDraft();
    }

    public function delete(User $user, Report $report): bool
    {
        return $user->id === $report->user_id && $report->isDraft();
    }

    public function submit(User $user, Report $report): bool
    {
        return $user->id === $report->user_id && $report->isDraft();
    }

    public function adminView(User $user, Report $report): bool
    {
        return $user->isAdministrator();
    }

    public function updateStatus(User $user, Report $report): bool
    {
        return $user->isAdministrator();
    }
}
