<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Report\StoreReportRequest;
use App\Http\Requests\Report\UpdateReportRequest;
use App\Http\Requests\Report\UpdateStatusRequest;
use App\Models\Report;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['title', 'category', 'status']);
        $paginator = $this->reportService->getReportsForUser(auth()->id(), $filters);

        return response()->json([
            'success' => true,
            'data' => [
                'items' => $paginator->items(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ],
        ]);
    }

    public function store(StoreReportRequest $request): JsonResponse
    {
        $report = $this->reportService->createReport($request->validated(), auth()->id());

        return response()->json([
            'success' => true,
            'data' => $report,
            'message' => 'Report created successfully.',
        ], 201);
    }

    public function show(Report $report): JsonResponse
    {
        $this->authorize('view', $report);

        return response()->json([
            'success' => true,
            'data' => $report->load('user:id,name,email'),
        ]);
    }

    public function update(UpdateReportRequest $request, Report $report): JsonResponse
    {
        $this->authorize('update', $report);

        $updated = $this->reportService->updateReport($report, $request->validated());

        return response()->json([
            'success' => true,
            'data' => $updated,
        ]);
    }

    public function submit(Report $report): JsonResponse
    {
        $this->authorize('submit', $report);

        $submitted = $this->reportService->submitReport($report);

        return response()->json([
            'success' => true,
            'data' => $submitted,
            'message' => 'Report submitted successfully.',
        ]);
    }

    public function destroy(Report $report): JsonResponse
    {
        $this->authorize('delete', $report);

        $this->reportService->deleteReport($report);

        return response()->json([
            'success' => true,
            'message' => 'Report deleted successfully.',
        ], 204);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $filters = $request->only(['title', 'category', 'status']);
        $paginator = $this->reportService->getAllReports($filters);

        return response()->json([
            'success' => true,
            'data' => [
                'items' => $paginator->items(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ],
        ]);
    }

    public function adminShow(Report $report): JsonResponse
    {
        $this->authorize('adminView', $report);

        return response()->json([
            'success' => true,
            'data' => $report->load('user:id,name,email'),
        ]);
    }

    public function updateStatus(UpdateStatusRequest $request, Report $report): JsonResponse
    {
        $this->authorize('updateStatus', $report);

        $updated = $this->reportService->updateStatus($report, $request->validated()['status']);

        return response()->json([
            'success' => true,
            'data' => $updated,
            'message' => 'Status updated successfully.',
        ]);
    }
}
