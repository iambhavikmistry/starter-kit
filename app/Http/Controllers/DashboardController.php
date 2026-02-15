<?php

namespace App\Http\Controllers;

use App\Enums\RoleEnum;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Redirect to the appropriate dashboard based on user role.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        $adminRoles = [
            RoleEnum::SuperAdmin->value,
            RoleEnum::Admin->value,
            RoleEnum::Manager->value,
        ];

        if ($request->user()?->hasAnyRole($adminRoles)) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('dashboard');
    }
}
