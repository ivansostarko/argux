<?php

/**
 * ARGUX — Mock Authentication REST API Routes
 *
 * Add these to routes/web.php or include from routes/mock-api.php
 *
 * 12 endpoints covering the full auth lifecycle:
 *   - Login with credential validation
 *   - 2FA challenge/verify/resend
 *   - Session management (me, refresh, logout)
 *   - Password reset flow (forgot, reset)
 *   - Active sessions and audit log
 */

use App\Http\Controllers\MockApi\AuthApiController;

// Authentication
Route::post('/mock-api/auth/login', [AuthApiController::class, 'login'])->name('mock-api.auth.login');
Route::post('/mock-api/auth/logout', [AuthApiController::class, 'logout'])->name('mock-api.auth.logout');
Route::post('/mock-api/auth/refresh', [AuthApiController::class, 'refresh'])->name('mock-api.auth.refresh');
Route::get('/mock-api/auth/me', [AuthApiController::class, 'me'])->name('mock-api.auth.me');

// Two-Factor Authentication
Route::post('/mock-api/auth/2fa/verify', [AuthApiController::class, 'verifyTwoFactor'])->name('mock-api.auth.2fa.verify');
Route::post('/mock-api/auth/2fa/resend', [AuthApiController::class, 'resendTwoFactor'])->name('mock-api.auth.2fa.resend');

// Password Reset
Route::post('/mock-api/auth/forgot-password', [AuthApiController::class, 'forgotPassword'])->name('mock-api.auth.forgot-password');
Route::post('/mock-api/auth/reset-password', [AuthApiController::class, 'resetPassword'])->name('mock-api.auth.reset-password');

// Sessions & Audit
Route::get('/mock-api/auth/sessions', [AuthApiController::class, 'sessions'])->name('mock-api.auth.sessions');
Route::delete('/mock-api/auth/sessions/{id}', [AuthApiController::class, 'revokeSession'])->name('mock-api.auth.sessions.revoke');
Route::get('/mock-api/auth/audit-log', [AuthApiController::class, 'auditLog'])->name('mock-api.auth.audit-log');
