<?php

namespace App\Providers;

use App\Repositories\Contracts\ReportRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\ReportRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ReportRepositoryInterface::class, ReportRepository::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
    }

    public function boot(): void {}
}
