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
| App Routes (mock — all render Dashboard placeholder)
|--------------------------------------------------------------------------
*/

Route::get('/map', fn () => \Inertia\Inertia::render('Map/Index'))->name('map');
Route::get('/vision', fn () => \Inertia\Inertia::render('Vision/Index'))->name('vision');
Route::get('/operations', fn () => \Inertia\Inertia::render('Operations/Index'))->name('operations');
Route::get('/persons', fn () => \Inertia\Inertia::render('Persons/Index'))->name('persons.index');
Route::get('/persons/create', fn () => \Inertia\Inertia::render('Persons/Create'))->name('persons.create');
Route::get('/persons/{id}/edit', fn (string $id) => \Inertia\Inertia::render('Persons/Edit', ['id' => (int)$id]))->name('persons.edit')->where('id', '[0-9]+');
Route::get('/persons/{id}/print', fn (string $id) => \Inertia\Inertia::render('Persons/Print', ['id' => (int)$id]))->name('persons.print')->where('id', '[0-9]+');
Route::get('/persons/{id}', fn (string $id) => \Inertia\Inertia::render('Persons/Show', ['id' => (int)$id]))->name('persons.show')->where('id', '[0-9]+');
Route::get('/organizations', fn () => \Inertia\Inertia::render('Organizations/Index'))->name('organizations.index');
Route::get('/organizations/create', fn () => \Inertia\Inertia::render('Organizations/Create'))->name('organizations.create');
Route::get('/organizations/{id}/edit', fn (string $id) => \Inertia\Inertia::render('Organizations/Edit', ['id' => (int)$id]))->name('organizations.edit')->where('id', '[0-9]+');
Route::get('/organizations/{id}/print', fn (string $id) => \Inertia\Inertia::render('Organizations/Print', ['id' => (int)$id]))->name('organizations.print')->where('id', '[0-9]+');
Route::get('/organizations/{id}', fn (string $id) => \Inertia\Inertia::render('Organizations/Show', ['id' => (int)$id]))->name('organizations.show')->where('id', '[0-9]+');
Route::get('/vehicles', fn () => \Inertia\Inertia::render('Vehicles/Index'))->name('vehicles.index');
Route::get('/vehicles/create', fn () => \Inertia\Inertia::render('Vehicles/Create'))->name('vehicles.create');
Route::get('/vehicles/{id}/edit', fn (string $id) => \Inertia\Inertia::render('Vehicles/Edit', ['id' => (int)$id]))->name('vehicles.edit')->where('id', '[0-9]+');
Route::get('/vehicles/{id}', fn (string $id) => \Inertia\Inertia::render('Vehicles/Show', ['id' => (int)$id]))->name('vehicles.show')->where('id', '[0-9]+');
Route::get('/devices', fn () => \Inertia\Inertia::render('Devices/Index'))->name('devices.index');
Route::get('/devices/create', fn () => \Inertia\Inertia::render('Devices/Create'))->name('devices.create');
Route::get('/devices/{id}/edit', fn (int $id) => \Inertia\Inertia::render('Devices/Edit', ['id' => $id]))->name('devices.edit')->where('id', '[0-9]+');
Route::get('/devices/{id}', fn (int $id) => \Inertia\Inertia::render('Devices/Show', ['id' => $id]))->name('devices.show')->where('id', '[0-9]+');
Route::get('/plate-recognition', fn () => \Inertia\Inertia::render('Dashboard/Index'))->name('plate-recognition');
Route::get('/face-recognition', fn () => \Inertia\Inertia::render('Dashboard/Index'))->name('face-recognition');
Route::get('/scraper', fn () => \Inertia\Inertia::render('Dashboard/Index'))->name('scraper');
Route::get('/web-scraper', fn () => \Inertia\Inertia::render('Dashboard/Index'))->name('web-scraper');
Route::get('/apps', fn () => \Inertia\Inertia::render('Dashboard/Index'))->name('apps');
Route::get('/connections', fn () => \Inertia\Inertia::render('Connections/Index'))->name('connections');
Route::get('/workflows', fn () => \Inertia\Inertia::render('Workflows/Index'))->name('workflows');
Route::get('/data-sources', fn () => \Inertia\Inertia::render('DataSources/Index'))->name('data-sources');
Route::get('/alerts', fn () => \Inertia\Inertia::render('Alerts/Index'))->name('alerts');
Route::get('/activity', fn () => \Inertia\Inertia::render('Activity/Index'))->name('activity');
Route::get('/notifications', fn () => \Inertia\Inertia::render('Notifications/Index'))->name('notifications');
Route::get('/risks', fn () => \Inertia\Inertia::render('Risks/Index'))->name('risks');
Route::get('/chat', fn () => \Inertia\Inertia::render('Chat/Index'))->name('chat');
Route::get('/chat/{convId}/print', fn (string $convId) => \Inertia\Inertia::render('Chat/Print', ['convId' => $convId]))->name('chat.print');
Route::get('/records', fn () => \Inertia\Inertia::render('Dashboard/Index'))->name('records');
Route::get('/storage', fn () => \Inertia\Inertia::render('Storage/Index'))->name('storage');
Route::get('/reports', fn () => \Inertia\Inertia::render('Reports/Index'))->name('reports');
Route::get('/jobs', fn () => \Inertia\Inertia::render('Dashboard/Index'))->name('jobs');
Route::get('/profile', fn () => \Inertia\Inertia::render('Profile/Index'))->name('profile');
Route::get('/settings', fn () => \Inertia\Inertia::render('Dashboard/Index'))->name('settings');

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
| Error Page Previews (development only)
|--------------------------------------------------------------------------
*/

Route::prefix('errors')->name('errors.')->group(function () {
    Route::get('/403', fn () => \Inertia\Inertia::render('Errors/403'))->name('403');
    Route::get('/404', fn () => \Inertia\Inertia::render('Errors/404'))->name('404');
    Route::get('/408', fn () => \Inertia\Inertia::render('Errors/408'))->name('408');
    Route::get('/419', fn () => \Inertia\Inertia::render('Errors/419'))->name('419');
    Route::get('/429', fn () => \Inertia\Inertia::render('Errors/429'))->name('429');
    Route::get('/500', fn () => \Inertia\Inertia::render('Errors/500'))->name('500');
    Route::get('/503', fn () => \Inertia\Inertia::render('Errors/503'))->name('503');
});

/*
|--------------------------------------------------------------------------
| Catch-all redirect to login (mockup entry point)
|--------------------------------------------------------------------------
*/

Route::get('/', fn () => redirect()->route('map'));
