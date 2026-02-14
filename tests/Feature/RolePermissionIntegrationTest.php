<?php

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Support\Str;
use Spatie\Permission\PermissionRegistrar;

test('role and permission seeders create expected roles permissions and user assignments', function () {
    $this->seed(RolePermissionSeeder::class);
    $this->seed(UserSeeder::class);
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(Role::where('guard_name', 'web')->count())->toBe(count(RoleEnum::cases()));
    expect(Permission::where('guard_name', 'web')->count())->toBe(count(PermissionEnum::cases()));

    $superAdmin = User::where('email', 'super@example.com')->first();
    expect($superAdmin)->not->toBeNull()
        ->and($superAdmin->hasRole(RoleEnum::SuperAdmin->value))->toBeTrue()
        ->and($superAdmin->hasPermissionTo(PermissionEnum::UsersDelete->value))->toBeTrue();

    $superAdminRole = Role::findByName(RoleEnum::SuperAdmin->value, 'web');
    expect($superAdminRole->permissions()->count())->toBe(count(PermissionEnum::cases()));

    $manager = User::where('email', 'manager@example.com')->first();
    expect($manager)->not->toBeNull()
        ->and($manager->hasRole(RoleEnum::Manager->value))->toBeTrue()
        ->and($manager->hasPermissionTo(PermissionEnum::AnalyticsView->value))->toBeTrue()
        ->and($manager->hasPermissionTo(PermissionEnum::UsersDelete->value))->toBeFalse();

    $member = User::where('email', 'test@example.com')->first();
    expect($member)->not->toBeNull()
        ->and($member->hasRole(RoleEnum::Member->value))->toBeTrue()
        ->and($member->hasPermissionTo(PermissionEnum::DashboardView->value))->toBeTrue()
        ->and($member->hasPermissionTo(PermissionEnum::UsersDelete->value))->toBeFalse();
});

test('each role has the correct number of permissions', function () {
    $this->seed(RolePermissionSeeder::class);
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    foreach (RoleEnum::cases() as $roleEnum) {
        $role = Role::findByName($roleEnum->value, 'web');
        expect($role->permissions()->count())
            ->toBe(count($roleEnum->permissions()), "Role {$roleEnum->value} has wrong permission count");
    }
});

test('user can be assigned a role and permission with uuid primary keys', function () {
    $user = User::factory()->create();
    $role = Role::create(['name' => 'editor', 'guard_name' => 'web']);
    $permission = Permission::create(['name' => 'edit articles', 'guard_name' => 'web']);

    expect(Str::isUuid($user->id))->toBeTrue();
    expect(Str::isUuid($role->id))->toBeTrue();
    expect(Str::isUuid($permission->id))->toBeTrue();

    $role->givePermissionTo($permission);
    $user->assignRole($role);

    expect($user->hasRole('editor'))->toBeTrue();
    expect($user->hasPermissionTo('edit articles'))->toBeTrue();
});
