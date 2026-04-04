<?php

/**
 * ARGUX — Admin Panel Mock REST API Routes
 *
 * Add to routes/web.php: require __DIR__.'/admin-api.php';
 */

use App\Http\Controllers\MockApi\AdminDashboardApiController;
use App\Http\Controllers\MockApi\AdminAdminsApiController;
use App\Http\Controllers\MockApi\AdminUsersApiController;

// Admin Dashboard
Route::get('/mock-api/admin/dashboard/stats', [AdminDashboardApiController::class, 'stats'])->name('mock-api.admin.dashboard.stats');
Route::get('/mock-api/admin/dashboard/kpis', [AdminDashboardApiController::class, 'kpis'])->name('mock-api.admin.dashboard.kpis');
Route::get('/mock-api/admin/dashboard/services', [AdminDashboardApiController::class, 'services'])->name('mock-api.admin.dashboard.services');
Route::get('/mock-api/admin/dashboard/activity', [AdminDashboardApiController::class, 'activity'])->name('mock-api.admin.dashboard.activity');
Route::get('/mock-api/admin/dashboard/storage', [AdminDashboardApiController::class, 'storage'])->name('mock-api.admin.dashboard.storage');
Route::post('/mock-api/admin/dashboard/action', [AdminDashboardApiController::class, 'executeAction'])->name('mock-api.admin.dashboard.action');
Route::post('/mock-api/admin/dashboard/service/{id}/restart', [AdminDashboardApiController::class, 'restartService'])->name('mock-api.admin.dashboard.service.restart');

// Admin Management (CRUD + actions)
Route::get('/mock-api/admin/admins', [AdminAdminsApiController::class, 'index'])->name('mock-api.admin.admins.index');
Route::get('/mock-api/admin/admins/{id}', [AdminAdminsApiController::class, 'show'])->name('mock-api.admin.admins.show');
Route::post('/mock-api/admin/admins', [AdminAdminsApiController::class, 'store'])->name('mock-api.admin.admins.store');
Route::put('/mock-api/admin/admins/{id}', [AdminAdminsApiController::class, 'update'])->name('mock-api.admin.admins.update');
Route::delete('/mock-api/admin/admins/{id}', [AdminAdminsApiController::class, 'destroy'])->name('mock-api.admin.admins.destroy');
Route::patch('/mock-api/admin/admins/{id}/status', [AdminAdminsApiController::class, 'updateStatus'])->name('mock-api.admin.admins.status');
Route::post('/mock-api/admin/admins/{id}/reset-password', [AdminAdminsApiController::class, 'resetPassword'])->name('mock-api.admin.admins.reset-password');
Route::post('/mock-api/admin/admins/{id}/reset-mfa', [AdminAdminsApiController::class, 'resetMfa'])->name('mock-api.admin.admins.reset-mfa');
Route::delete('/mock-api/admin/admins/{id}/sessions', [AdminAdminsApiController::class, 'killSessions'])->name('mock-api.admin.admins.kill-sessions');

// User Management (CRUD + actions)
Route::get('/mock-api/admin/users', [AdminUsersApiController::class, 'index'])->name('mock-api.admin.users.index');
Route::get('/mock-api/admin/users/{id}', [AdminUsersApiController::class, 'show'])->name('mock-api.admin.users.show');
Route::post('/mock-api/admin/users', [AdminUsersApiController::class, 'store'])->name('mock-api.admin.users.store');
Route::put('/mock-api/admin/users/{id}', [AdminUsersApiController::class, 'update'])->name('mock-api.admin.users.update');
Route::delete('/mock-api/admin/users/{id}', [AdminUsersApiController::class, 'destroy'])->name('mock-api.admin.users.destroy');
Route::patch('/mock-api/admin/users/{id}/status', [AdminUsersApiController::class, 'updateStatus'])->name('mock-api.admin.users.status');
Route::post('/mock-api/admin/users/{id}/reset-password', [AdminUsersApiController::class, 'resetPassword'])->name('mock-api.admin.users.reset-password');
Route::post('/mock-api/admin/users/{id}/reset-mfa', [AdminUsersApiController::class, 'resetMfa'])->name('mock-api.admin.users.reset-mfa');
Route::delete('/mock-api/admin/users/{id}/sessions', [AdminUsersApiController::class, 'killSessions'])->name('mock-api.admin.users.kill-sessions');
