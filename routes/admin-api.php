<?php

/**
 * ARGUX — Admin Panel Mock REST API Routes
 *
 * Add to routes/web.php: require __DIR__.'/admin-api.php';
 */

use App\Http\Controllers\MockApi\AdminDashboardApiController;
use App\Http\Controllers\MockApi\AdminAdminsApiController;
use App\Http\Controllers\MockApi\AdminUsersApiController;
use App\Http\Controllers\MockApi\AdminRolesApiController;
use App\Http\Controllers\MockApi\AdminStatisticsApiController;

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

// Role Management (CRUD + duplicate)
Route::get('/mock-api/admin/roles', [AdminRolesApiController::class, 'index'])->name('mock-api.admin.roles.index');
Route::get('/mock-api/admin/roles/{id}', [AdminRolesApiController::class, 'show'])->name('mock-api.admin.roles.show');
Route::post('/mock-api/admin/roles', [AdminRolesApiController::class, 'store'])->name('mock-api.admin.roles.store');
Route::put('/mock-api/admin/roles/{id}', [AdminRolesApiController::class, 'update'])->name('mock-api.admin.roles.update');
Route::delete('/mock-api/admin/roles/{id}', [AdminRolesApiController::class, 'destroy'])->name('mock-api.admin.roles.destroy');
Route::post('/mock-api/admin/roles/{id}/duplicate', [AdminRolesApiController::class, 'duplicate'])->name('mock-api.admin.roles.duplicate');

// Role Management (CRUD + duplicate)

// Statistics
Route::get('/mock-api/admin/statistics', [AdminStatisticsApiController::class, 'index'])->name('mock-api.admin.statistics.index');
Route::get('/mock-api/admin/statistics/{tab}', [AdminStatisticsApiController::class, 'tab'])->name('mock-api.admin.statistics.tab');

// Audit Log
Route::get('/mock-api/admin/audit', [AdminAuditApiController::class, 'index'])->name('mock-api.admin.audit.index');
Route::get('/mock-api/admin/audit/{id}', [AdminAuditApiController::class, 'show'])->name('mock-api.admin.audit.show');
Route::post('/mock-api/admin/audit/export', [AdminAuditApiController::class, 'export'])->name('mock-api.admin.audit.export');
Route::post('/mock-api/admin/audit/{id}/verify', [AdminAuditApiController::class, 'verify'])->name('mock-api.admin.audit.verify');

// Configuration
Route::get('/mock-api/admin/config', [AdminConfigApiController::class, 'index'])->name('mock-api.admin.config.index');
Route::get('/mock-api/admin/config/tab/{tab}', [AdminConfigApiController::class, 'show'])->name('mock-api.admin.config.show');
Route::put('/mock-api/admin/config/tab/{tab}', [AdminConfigApiController::class, 'update'])->name('mock-api.admin.config.update');
Route::post('/mock-api/admin/config/tab/{tab}/reset', [AdminConfigApiController::class, 'reset'])->name('mock-api.admin.config.reset');
Route::post('/mock-api/admin/config/test-notification', [AdminConfigApiController::class, 'testNotification'])->name('mock-api.admin.config.test-notification');
Route::post('/mock-api/admin/config/backup/trigger', [AdminConfigApiController::class, 'triggerBackup'])->name('mock-api.admin.config.trigger-backup');
