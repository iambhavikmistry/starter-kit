<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Auth\OAuthController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('auth/{provider}/redirect', [OAuthController::class, 'redirect'])
    ->name('oauth.redirect');
Route::get('auth/{provider}/callback', [OAuthController::class, 'callback'])
    ->name('oauth.callback');

Route::get('dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

/*
|--------------------------------------------------------------------------
| Admin Panel Routes
|--------------------------------------------------------------------------
|
| Routes for users with admin-level roles (SuperAdmin, Admin, Manager).
| All routes are prefixed with /admin and protected by the admin middleware.
|
*/
Route::prefix('admin')
    ->middleware(['auth', 'verified', 'admin'])
    ->name('admin.')
    ->group(function () {
        Route::get('dashboard', Admin\DashboardController::class)->name('dashboard');

        Route::resource('users', Admin\UserController::class)->except(['show']);
        Route::resource('roles', Admin\RoleController::class)->except(['show']);

        Route::get('system-settings/{group?}', [Admin\SystemSettingsController::class, 'index'])->name('system-settings.index');
        Route::put('system-settings', [Admin\SystemSettingsController::class, 'update'])->name('system-settings.update');
    });

require __DIR__.'/settings.php';
