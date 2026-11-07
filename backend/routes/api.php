<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    // Public auth routes
    Route::prefix('auth')->group(function (): void {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    // Protected routes
    Route::middleware('auth:api')->group(function (): void {
        Route::prefix('auth')->group(function (): void {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });

        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Reporter routes
        Route::apiResource('reports', ReportController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
        Route::patch('/reports/{report}/submit', [ReportController::class, 'submit']);

        // Admin routes
        Route::middleware('role:administrator')->prefix('admin')->group(function (): void {
            Route::get('/reports', [ReportController::class, 'adminIndex']);
            Route::get('/reports/{report}', [ReportController::class, 'adminShow']);
            Route::patch('/reports/{report}/status', [ReportController::class, 'updateStatus']);
        });
    });
});
