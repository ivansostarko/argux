<?php

use App\Http\Controllers\Web\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/login', [AuthController::class, 'authenticate'])->name('login.authenticate');

    Route::get('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/register', [AuthController::class, 'store'])->name('register.store');

    Route::get('/forgot-password', [AuthController::class, 'forgotPassword'])->name('password.request');
    Route::post('/forgot-password', [AuthController::class, 'sendResetCode'])->name('password.email');
    Route::post('/forgot-password/verify', [AuthController::class, 'verifyResetCode'])->name('password.verify');
    Route::post('/forgot-password/reset', [AuthController::class, 'resetPassword'])->name('password.reset');
});

Route::get('/2fa', [AuthController::class, 'twoFactor'])->name('2fa');
Route::post('/2fa', [AuthController::class, 'verifyTwoFactor'])->name('2fa.verify');
Route::post('/2fa/resend', [AuthController::class, 'resendTwoFactor'])->name('2fa.resend');

/*
|--------------------------------------------------------------------------
| Locale Switch
|--------------------------------------------------------------------------
*/

Route::post('/locale/{locale}', function (string $locale) {
    if (in_array($locale, config('app.available_locales', ['en', 'hr']))) {
        session(['locale' => $locale]);
        app()->setLocale($locale);
    }
    return back();
})->name('locale.switch');

/*
|--------------------------------------------------------------------------
| Catch-all redirect to login (mockup entry point)
|--------------------------------------------------------------------------
*/

Route::get('/', [AuthController::class, 'login']);
