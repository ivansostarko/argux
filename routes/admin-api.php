<?php

/**
 * ARGUX — Admin Panel Mock REST API Routes
 *
 * Add to routes/web.php: require __DIR__.'/admin-api.php';
 */

use App\Http\Controllers\MockApi\AdminDashboardApiController;

// Admin Dashboard
Route::get('/mock-api/admin/dashboard/stats', [AdminDashboardApiController::class, 'stats'])->name('mock-api.admin.dashboard.stats');
Route::get('/mock-api/admin/dashboard/kpis', [AdminDashboardApiController::class, 'kpis'])->name('mock-api.admin.dashboard.kpis');
Route::get('/mock-api/admin/dashboard/services', [AdminDashboardApiController::class, 'services'])->name('mock-api.admin.dashboard.services');
Route::get('/mock-api/admin/dashboard/activity', [AdminDashboardApiController::class, 'activity'])->name('mock-api.admin.dashboard.activity');
Route::get('/mock-api/admin/dashboard/storage', [AdminDashboardApiController::class, 'storage'])->name('mock-api.admin.dashboard.storage');
Route::post('/mock-api/admin/dashboard/action', [AdminDashboardApiController::class, 'executeAction'])->name('mock-api.admin.dashboard.action');
Route::post('/mock-api/admin/dashboard/service/{id}/restart', [AdminDashboardApiController::class, 'restartService'])->name('mock-api.admin.dashboard.service.restart');
