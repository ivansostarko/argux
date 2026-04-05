<?php

/**
 * ARGUX — Operator / User Mock REST API Routes
 *
 * All /mock-api/* endpoints for the operator application.
 * Covers: jobs, reports, storage, records, risks, notifications,
 * activity, alerts, data-sources, workflows, connections.
 *
 * Add to routes/web.php:  require __DIR__.'/user-api.php';
 *
 * 65 routes total:
 *   Jobs (7), Reports (7), Storage (7), Records (4), Risks (4),
 *   Notifications (3), Activity (2), Alerts (7), Data Sources (7),
 *   Workflows (6), Connections (6), Surveillance Apps (5)
 */

use App\Http\Controllers\MockApi\JobsApiController;
use App\Http\Controllers\MockApi\ReportsApiController;
use App\Http\Controllers\MockApi\StorageApiController;
use App\Http\Controllers\MockApi\RecordsApiController;
use App\Http\Controllers\MockApi\RisksApiController;
use App\Http\Controllers\MockApi\NotificationsApiController;
use App\Http\Controllers\MockApi\ActivityApiController;
use App\Http\Controllers\MockApi\AlertsApiController;
use App\Http\Controllers\MockApi\DataSourcesApiController;
use App\Http\Controllers\MockApi\WorkflowsApiController;
use App\Http\Controllers\MockApi\ConnectionsApiController;
use App\Http\Controllers\MockApi\SurveillanceAppsApiController;

// ═══════════════════════════════════════════════════════════════
// Background Jobs (7 routes)
// ═══════════════════════════════════════════════════════════════
Route::get('/mock-api/jobs', [JobsApiController::class, 'index'])->name('mock-api.jobs.index');
Route::get('/mock-api/jobs/stats', [JobsApiController::class, 'stats'])->name('mock-api.jobs.stats');
Route::get('/mock-api/jobs/{id}', [JobsApiController::class, 'show'])->name('mock-api.jobs.show');
Route::post('/mock-api/jobs/{id}/retry', [JobsApiController::class, 'retry'])->name('mock-api.jobs.retry');
Route::post('/mock-api/jobs/{id}/cancel', [JobsApiController::class, 'cancel'])->name('mock-api.jobs.cancel');
Route::delete('/mock-api/jobs/{id}', [JobsApiController::class, 'destroy'])->name('mock-api.jobs.destroy');
Route::post('/mock-api/jobs/clear-completed', [JobsApiController::class, 'clearCompleted'])->name('mock-api.jobs.clear');

// ═══════════════════════════════════════════════════════════════
// Report Generator (7 routes)
// ═══════════════════════════════════════════════════════════════
Route::get('/mock-api/reports/entities', [ReportsApiController::class, 'entities'])->name('mock-api.reports.entities');
Route::get('/mock-api/reports', [ReportsApiController::class, 'index'])->name('mock-api.reports.index');
Route::get('/mock-api/reports/{id}', [ReportsApiController::class, 'show'])->name('mock-api.reports.show');
Route::post('/mock-api/reports', [ReportsApiController::class, 'store'])->name('mock-api.reports.store');
Route::post('/mock-api/reports/{id}/retry', [ReportsApiController::class, 'retry'])->name('mock-api.reports.retry');
Route::get('/mock-api/reports/{id}/download', [ReportsApiController::class, 'download'])->name('mock-api.reports.download');
Route::delete('/mock-api/reports/{id}', [ReportsApiController::class, 'destroy'])->name('mock-api.reports.destroy');

// ═══════════════════════════════════════════════════════════════
// Storage Browser (7 routes)
// ═══════════════════════════════════════════════════════════════
Route::get('/mock-api/storage/tree', [StorageApiController::class, 'tree'])->name('mock-api.storage.tree');
Route::get('/mock-api/storage/files', [StorageApiController::class, 'index'])->name('mock-api.storage.files.index');
Route::get('/mock-api/storage/files/{id}', [StorageApiController::class, 'show'])->name('mock-api.storage.files.show');
Route::post('/mock-api/storage/files', [StorageApiController::class, 'store'])->name('mock-api.storage.files.store');
Route::get('/mock-api/storage/files/{id}/download', [StorageApiController::class, 'download'])->name('mock-api.storage.files.download');
Route::delete('/mock-api/storage/files/{id}', [StorageApiController::class, 'destroy'])->name('mock-api.storage.files.destroy');
Route::get('/mock-api/storage/stats', [StorageApiController::class, 'stats'])->name('mock-api.storage.stats');

// ═══════════════════════════════════════════════════════════════
// Records / AI Processing (4 routes)
// ═══════════════════════════════════════════════════════════════
Route::get('/mock-api/records', [RecordsApiController::class, 'index'])->name('mock-api.records.index');
Route::get('/mock-api/records/{id}', [RecordsApiController::class, 'show'])->name('mock-api.records.show');
Route::post('/mock-api/records/{id}/retry', [RecordsApiController::class, 'retry'])->name('mock-api.records.retry');
Route::delete('/mock-api/records/{id}', [RecordsApiController::class, 'destroy'])->name('mock-api.records.destroy');

// ═══════════════════════════════════════════════════════════════
// Risks Dashboard (4 routes)
// ═══════════════════════════════════════════════════════════════
Route::get('/mock-api/risks/summary', [RisksApiController::class, 'summary'])->name('mock-api.risks.summary');
Route::get('/mock-api/risks/persons/{id}/factors', [RisksApiController::class, 'personFactors'])->name('mock-api.risks.persons.factors');
Route::get('/mock-api/risks/organizations/{id}/factors', [RisksApiController::class, 'orgFactors'])->name('mock-api.risks.orgs.factors');
Route::get('/mock-api/risks/factor-categories', [RisksApiController::class, 'factorCategories'])->name('mock-api.risks.factor-categories');

// ═══════════════════════════════════════════════════════════════
// Notifications (3 routes)
// ═══════════════════════════════════════════════════════════════
Route::get('/mock-api/notifications', [NotificationsApiController::class, 'index'])->name('mock-api.notifications.index');
Route::patch('/mock-api/notifications/{id}/read', [NotificationsApiController::class, 'toggleRead'])->name('mock-api.notifications.read');
Route::post('/mock-api/notifications/read-all', [NotificationsApiController::class, 'readAll'])->name('mock-api.notifications.read-all');

// ═══════════════════════════════════════════════════════════════
// Activity Log (2 routes)
// ═══════════════════════════════════════════════════════════════
Route::get('/mock-api/activity', [ActivityApiController::class, 'index'])->name('mock-api.activity.index');
Route::get('/mock-api/activity/{id}', [ActivityApiController::class, 'show'])->name('mock-api.activity.show');

// ═══════════════════════════════════════════════════════════════
// Alert Rules & Events (7 routes)
// ═══════════════════════════════════════════════════════════════
Route::get('/mock-api/alerts/rules', [AlertsApiController::class, 'rules'])->name('mock-api.alerts.rules');
Route::get('/mock-api/alerts/rules/{id}', [AlertsApiController::class, 'showRule'])->name('mock-api.alerts.rules.show');
Route::post('/mock-api/alerts/rules', [AlertsApiController::class, 'storeRule'])->name('mock-api.alerts.rules.store');
Route::patch('/mock-api/alerts/rules/{id}/toggle', [AlertsApiController::class, 'toggleRule'])->name('mock-api.alerts.rules.toggle');
Route::delete('/mock-api/alerts/rules/{id}', [AlertsApiController::class, 'destroyRule'])->name('mock-api.alerts.rules.destroy');
Route::get('/mock-api/alerts/events', [AlertsApiController::class, 'events'])->name('mock-api.alerts.events');
Route::patch('/mock-api/alerts/events/{id}/acknowledge', [AlertsApiController::class, 'acknowledgeEvent'])->name('mock-api.alerts.events.ack');

// ═══════════════════════════════════════════════════════════════
// Data Sources (7 routes)
// ═══════════════════════════════════════════════════════════════
Route::get('/mock-api/data-sources', [DataSourcesApiController::class, 'index'])->name('mock-api.datasources.index');
Route::get('/mock-api/data-sources/{id}', [DataSourcesApiController::class, 'show'])->name('mock-api.datasources.show');
Route::post('/mock-api/data-sources', [DataSourcesApiController::class, 'store'])->name('mock-api.datasources.store');
Route::post('/mock-api/data-sources/{id}/sync', [DataSourcesApiController::class, 'sync'])->name('mock-api.datasources.sync');
Route::patch('/mock-api/data-sources/{id}/pause', [DataSourcesApiController::class, 'togglePause'])->name('mock-api.datasources.pause');
Route::delete('/mock-api/data-sources/{id}', [DataSourcesApiController::class, 'destroy'])->name('mock-api.datasources.destroy');
Route::post('/mock-api/data-sources/sync-all', [DataSourcesApiController::class, 'syncAll'])->name('mock-api.datasources.sync-all');

// ═══════════════════════════════════════════════════════════════
// Workflows (6 routes)
// ═══════════════════════════════════════════════════════════════
Route::get('/mock-api/workflows', [WorkflowsApiController::class, 'index'])->name('mock-api.workflows.index');
Route::get('/mock-api/workflows/templates', [WorkflowsApiController::class, 'templates'])->name('mock-api.workflows.templates');
Route::get('/mock-api/workflows/{id}', [WorkflowsApiController::class, 'show'])->name('mock-api.workflows.show');
Route::post('/mock-api/workflows', [WorkflowsApiController::class, 'store'])->name('mock-api.workflows.store');
Route::patch('/mock-api/workflows/{id}/status', [WorkflowsApiController::class, 'updateStatus'])->name('mock-api.workflows.status');
Route::delete('/mock-api/workflows/{id}', [WorkflowsApiController::class, 'destroy'])->name('mock-api.workflows.destroy');

// ═══════════════════════════════════════════════════════════════
// Connections Graph (6 routes)
// ═══════════════════════════════════════════════════════════════
Route::get('/mock-api/connections', [ConnectionsApiController::class, 'index'])->name('mock-api.connections.index');
Route::get('/mock-api/connections/types', [ConnectionsApiController::class, 'types'])->name('mock-api.connections.types');
Route::get('/mock-api/connections/node/{nodeId}', [ConnectionsApiController::class, 'nodeDetail'])->name('mock-api.connections.node');
Route::get('/mock-api/connections/{id}', [ConnectionsApiController::class, 'show'])->name('mock-api.connections.show');
Route::post('/mock-api/connections', [ConnectionsApiController::class, 'store'])->name('mock-api.connections.store');
Route::delete('/mock-api/connections/{id}', [ConnectionsApiController::class, 'destroy'])->name('mock-api.connections.destroy');

// ═══════════════════════════════════════════════════════════════
// Surveillance Apps (5 routes)
// ═══════════════════════════════════════════════════════════════
Route::get('/mock-api/surveillance-apps', [SurveillanceAppsApiController::class, 'index'])->name('mock-api.apps.index');
Route::get('/mock-api/surveillance-apps/{id}', [SurveillanceAppsApiController::class, 'show'])->name('mock-api.apps.show');
Route::get('/mock-api/surveillance-apps/{id}/data/{tab}', [SurveillanceAppsApiController::class, 'tabData'])->name('mock-api.apps.data');
Route::post('/mock-api/surveillance-apps/{id}/command', [SurveillanceAppsApiController::class, 'executeCommand'])->name('mock-api.apps.command');
Route::patch('/mock-api/surveillance-apps/{id}/status', [SurveillanceAppsApiController::class, 'updateStatus'])->name('mock-api.apps.status');
