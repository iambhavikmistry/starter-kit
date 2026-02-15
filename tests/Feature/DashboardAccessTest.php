<?php

use App\Enums\RoleEnum;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    foreach (RoleEnum::cases() as $roleEnum) {
        Role::firstOrCreate(['name' => $roleEnum->value, 'guard_name' => 'web']);
    }
});

test('guests are redirected to login when accessing dashboard', function () {
    $this->get(route('dashboard'))
        ->assertRedirect(route('login'));
});

test('guests are redirected to login when accessing admin dashboard', function () {
    $this->get(route('admin.dashboard'))
        ->assertRedirect(route('login'));
});

test('admin users are redirected from dashboard to admin dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Admin->value);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('admin.dashboard'));
});

test('super admin users are redirected from dashboard to admin dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::SuperAdmin->value);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('admin.dashboard'));
});

test('manager users are redirected from dashboard to admin dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Manager->value);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('admin.dashboard'));
});

test('member users see the user dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Member->value);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
        );
});

test('admin users can access admin dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Admin->value);

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('admin/dashboard')
        );
});

test('member users cannot access admin dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Member->value);

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('member users cannot access admin system settings', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Member->value);

    $this->actingAs($user)
        ->get(route('admin.system-settings.index'))
        ->assertForbidden();
});

test('inertia shares user roles and permissions', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Member->value);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('auth.roles')
            ->has('auth.permissions')
            ->where('auth.roles', [RoleEnum::Member->value])
        );
});

test('admin inertia shares admin roles', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Admin->value);

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('auth.roles')
            ->where('auth.roles', [RoleEnum::Admin->value])
        );
});
