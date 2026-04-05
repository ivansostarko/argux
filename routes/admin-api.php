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

// Support Tickets
Route::get('/mock-api/admin/support/tickets', [AdminSupportApiController::class, 'index'])->name('mock-api.admin.support.index');
Route::get('/mock-api/admin/support/tickets/{id}', [AdminSupportApiController::class, 'show'])->name('mock-api.admin.support.show');
Route::post('/mock-api/admin/support/tickets', [AdminSupportApiController::class, 'store'])->name('mock-api.admin.support.store');
Route::patch('/mock-api/admin/support/tickets/{id}/status', [AdminSupportApiController::class, 'updateStatus'])->name('mock-api.admin.support.status');
Route::patch('/mock-api/admin/support/tickets/{id}/priority', [AdminSupportApiController::class, 'updatePriority'])->name('mock-api.admin.support.priority');
Route::patch('/mock-api/admin/support/tickets/{id}/assignee', [AdminSupportApiController::class, 'updateAssignee'])->name('mock-api.admin.support.assignee');
Route::post('/mock-api/admin/support/tickets/{id}/reply', [AdminSupportApiController::class, 'reply'])->name('mock-api.admin.support.reply');
Route::delete('/mock-api/admin/support/tickets/{id}', [AdminSupportApiController::class, 'destroy'])->name('mock-api.admin.support.destroy');

// Knowledge Base
Route::get('/mock-api/admin/kb/categories', [AdminKbApiController::class, 'categories'])->name('mock-api.admin.kb.categories');
Route::get('/mock-api/admin/kb/articles', [AdminKbApiController::class, 'index'])->name('mock-api.admin.kb.articles.index');
Route::get('/mock-api/admin/kb/articles/{id}', [AdminKbApiController::class, 'show'])->name('mock-api.admin.kb.articles.show');
Route::post('/mock-api/admin/kb/articles', [AdminKbApiController::class, 'store'])->name('mock-api.admin.kb.articles.store');
Route::put('/mock-api/admin/kb/articles/{id}', [AdminKbApiController::class, 'update'])->name('mock-api.admin.kb.articles.update');
Route::delete('/mock-api/admin/kb/articles/{id}', [AdminKbApiController::class, 'destroy'])->name('mock-api.admin.kb.articles.destroy');
Route::post('/mock-api/admin/kb/articles/{id}/helpful', [AdminKbApiController::class, 'helpful'])->name('mock-api.admin.kb.articles.helpful');


// Profile
Route::get('/mock-api/profile', [ProfileApiController::class, 'show'])->name('mock-api.profile.show');
Route::put('/mock-api/profile/personal', [ProfileApiController::class, 'updatePersonal'])->name('mock-api.profile.personal');
Route::post('/mock-api/profile/avatar', [ProfileApiController::class, 'uploadAvatar'])->name('mock-api.profile.avatar');
Route::put('/mock-api/profile/password', [ProfileApiController::class, 'updatePassword'])->name('mock-api.profile.password');
Route::get('/mock-api/profile/security', [ProfileApiController::class, 'security'])->name('mock-api.profile.security');
Route::put('/mock-api/profile/2fa', [ProfileApiController::class, 'update2fa'])->name('mock-api.profile.2fa');
Route::post('/mock-api/profile/backup-codes', [ProfileApiController::class, 'generateBackupCodes'])->name('mock-api.profile.backup-codes');
Route::get('/mock-api/profile/sessions', [ProfileApiController::class, 'sessions'])->name('mock-api.profile.sessions');
Route::delete('/mock-api/profile/sessions/{id}', [ProfileApiController::class, 'revokeSession'])->name('mock-api.profile.sessions.revoke');
Route::delete('/mock-api/profile/sessions', [ProfileApiController::class, 'revokeAllSessions'])->name('mock-api.profile.sessions.revoke-all');
Route::get('/mock-api/profile/audit', [ProfileApiController::class, 'audit'])->name('mock-api.profile.audit');
Route::put('/mock-api/profile/settings', [ProfileApiController::class, 'updateSettings'])->name('mock-api.profile.settings');

// Background Jobs
Route::get('/mock-api/jobs', [JobsApiController::class, 'index'])->name('mock-api.jobs.index');
Route::get('/mock-api/jobs/stats', [JobsApiController::class, 'stats'])->name('mock-api.jobs.stats');
Route::get('/mock-api/jobs/{id}', [JobsApiController::class, 'show'])->name('mock-api.jobs.show');
Route::post('/mock-api/jobs/{id}/retry', [JobsApiController::class, 'retry'])->name('mock-api.jobs.retry');
Route::post('/mock-api/jobs/{id}/cancel', [JobsApiController::class, 'cancel'])->name('mock-api.jobs.cancel');
Route::delete('/mock-api/jobs/{id}', [JobsApiController::class, 'destroy'])->name('mock-api.jobs.destroy');
Route::post('/mock-api/jobs/clear-completed', [JobsApiController::class, 'clearCompleted'])->name('mock-api.jobs.clear');

// Reports
Route::get('/mock-api/reports/entities', [ReportsApiController::class, 'entities'])->name('mock-api.reports.entities');
Route::get('/mock-api/reports', [ReportsApiController::class, 'index'])->name('mock-api.reports.index');
Route::get('/mock-api/reports/{id}', [ReportsApiController::class, 'show'])->name('mock-api.reports.show');
Route::post('/mock-api/reports', [ReportsApiController::class, 'store'])->name('mock-api.reports.store');
Route::post('/mock-api/reports/{id}/retry', [ReportsApiController::class, 'retry'])->name('mock-api.reports.retry');
Route::get('/mock-api/reports/{id}/download', [ReportsApiController::class, 'download'])->name('mock-api.reports.download');
Route::delete('/mock-api/reports/{id}', [ReportsApiController::class, 'destroy'])->name('mock-api.reports.destroy');

// Storage Browser
Route::get('/mock-api/storage/tree', [StorageApiController::class, 'tree'])->name('mock-api.storage.tree');
Route::get('/mock-api/storage/files', [StorageApiController::class, 'index'])->name('mock-api.storage.files.index');
Route::get('/mock-api/storage/files/{id}', [StorageApiController::class, 'show'])->name('mock-api.storage.files.show');
Route::post('/mock-api/storage/files', [StorageApiController::class, 'store'])->name('mock-api.storage.files.store');
Route::get('/mock-api/storage/files/{id}/download', [StorageApiController::class, 'download'])->name('mock-api.storage.files.download');
Route::delete('/mock-api/storage/files/{id}', [StorageApiController::class, 'destroy'])->name('mock-api.storage.files.destroy');
Route::get('/mock-api/storage/stats', [StorageApiController::class, 'stats'])->name('mock-api.storage.stats');

// Records / AI Processing
Route::get('/mock-api/records', [RecordsApiController::class, 'index'])->name('mock-api.records.index');
Route::get('/mock-api/records/{id}', [RecordsApiController::class, 'show'])->name('mock-api.records.show');
Route::post('/mock-api/records/{id}/retry', [RecordsApiController::class, 'retry'])->name('mock-api.records.retry');
Route::delete('/mock-api/records/{id}', [RecordsApiController::class, 'destroy'])->name('mock-api.records.destroy');

// Risks Dashboard
Route::get('/mock-api/risks/summary', [RisksApiController::class, 'summary'])->name('mock-api.risks.summary');
Route::get('/mock-api/risks/persons/{id}/factors', [RisksApiController::class, 'personFactors'])->name('mock-api.risks.persons.factors');
Route::get('/mock-api/risks/organizations/{id}/factors', [RisksApiController::class, 'orgFactors'])->name('mock-api.risks.orgs.factors');
Route::get('/mock-api/risks/factor-categories', [RisksApiController::class, 'factorCategories'])->name('mock-api.risks.factor-categories');

// Notifications
Route::get('/mock-api/notifications', [NotificationsApiController::class, 'index'])->name('mock-api.notifications.index');
Route::patch('/mock-api/notifications/{id}/read', [NotificationsApiController::class, 'toggleRead'])->name('mock-api.notifications.read');
Route::post('/mock-api/notifications/read-all', [NotificationsApiController::class, 'readAll'])->name('mock-api.notifications.read-all');
