<?php

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    foreach (RoleEnum::cases() as $roleEnum) {
        Role::firstOrCreate(['name' => $roleEnum->value, 'guard_name' => 'web']);
    }

    foreach (PermissionEnum::cases() as $permEnum) {
        Permission::firstOrCreate(['name' => $permEnum->value, 'guard_name' => 'web']);
    }

    $adminRole = Role::findByName(RoleEnum::Admin->value, 'web');
    $adminRole->syncPermissions(PermissionEnum::cases());
});

function createAdminUser(): User
{
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Admin->value);

    return $user;
}

function createMemberUser(): User
{
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Member->value);

    return $user;
}

test('guests cannot access role management', function () {
    $this->get(route('admin.roles.index'))->assertRedirect(route('login'));
    $this->get(route('admin.roles.create'))->assertRedirect(route('login'));
    $this->post(route('admin.roles.store'))->assertRedirect(route('login'));
});

test('member users cannot access role management', function () {
    $member = createMemberUser();

    $this->actingAs($member)
        ->get(route('admin.roles.index'))
        ->assertForbidden();
});

test('admin can view role index page', function () {
    $admin = createAdminUser();

    $this->actingAs($admin)
        ->get(route('admin.roles.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('admin/roles/index')
            ->has('roles.data')
            ->has('filters')
        );
});

test('admin can search roles', function () {
    $admin = createAdminUser();

    $this->actingAs($admin)
        ->get(route('admin.roles.index', ['search' => 'admin']))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('filters.search', 'admin')
        );
});

test('admin can view create role page', function () {
    $admin = createAdminUser();

    $this->actingAs($admin)
        ->get(route('admin.roles.create'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('admin/roles/create')
            ->has('permissions')
        );
});

test('admin can create a role with permissions', function () {
    $admin = createAdminUser();

    $this->actingAs($admin)
        ->post(route('admin.roles.store'), [
            'name' => 'editor',
            'permissions' => [
                PermissionEnum::DashboardView->value,
                PermissionEnum::UsersView->value,
            ],
        ])
        ->assertRedirect(route('admin.roles.index'));

    $role = Role::findByName('editor', 'web');

    expect($role)->not->toBeNull()
        ->and($role->hasPermissionTo(PermissionEnum::DashboardView->value))->toBeTrue()
        ->and($role->hasPermissionTo(PermissionEnum::UsersView->value))->toBeTrue()
        ->and($role->hasPermissionTo(PermissionEnum::UsersCreate->value))->toBeFalse();
});

test('create role validates required fields', function () {
    $admin = createAdminUser();

    $this->actingAs($admin)
        ->post(route('admin.roles.store'), [])
        ->assertSessionHasErrors(['name', 'permissions']);
});

test('create role validates unique name', function () {
    $admin = createAdminUser();

    $this->actingAs($admin)
        ->post(route('admin.roles.store'), [
            'name' => RoleEnum::Admin->value,
            'permissions' => [PermissionEnum::DashboardView->value],
        ])
        ->assertSessionHasErrors('name');
});

test('create role validates at least one permission', function () {
    $admin = createAdminUser();

    $this->actingAs($admin)
        ->post(route('admin.roles.store'), [
            'name' => 'empty_role',
            'permissions' => [],
        ])
        ->assertSessionHasErrors('permissions');
});

test('create role validates permission values', function () {
    $admin = createAdminUser();

    $this->actingAs($admin)
        ->post(route('admin.roles.store'), [
            'name' => 'bad_perms',
            'permissions' => ['nonexistent.permission'],
        ])
        ->assertSessionHasErrors('permissions.0');
});

test('admin can view edit role page', function () {
    $admin = createAdminUser();
    $role = Role::findByName(RoleEnum::Manager->value, 'web');

    $this->actingAs($admin)
        ->get(route('admin.roles.edit', $role))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('admin/roles/edit')
            ->has('role')
            ->has('permissions')
            ->where('role.id', $role->id)
            ->where('role.name', $role->name)
        );
});

test('admin can update a role', function () {
    $admin = createAdminUser();

    $role = Role::create(['name' => 'tester', 'guard_name' => 'web']);
    $role->syncPermissions([PermissionEnum::DashboardView->value]);

    $this->actingAs($admin)
        ->put(route('admin.roles.update', $role), [
            'name' => 'tester_updated',
            'permissions' => [
                PermissionEnum::DashboardView->value,
                PermissionEnum::AnalyticsView->value,
            ],
        ])
        ->assertRedirect(route('admin.roles.index'));

    $role->refresh();

    expect($role->name)->toBe('tester_updated')
        ->and($role->hasPermissionTo(PermissionEnum::AnalyticsView->value))->toBeTrue();
});

test('admin can update role permissions without changing name', function () {
    $admin = createAdminUser();

    $role = Role::create(['name' => 'static_name', 'guard_name' => 'web']);
    $role->syncPermissions([PermissionEnum::DashboardView->value]);

    $this->actingAs($admin)
        ->put(route('admin.roles.update', $role), [
            'name' => 'static_name',
            'permissions' => [
                PermissionEnum::DashboardView->value,
                PermissionEnum::UsersView->value,
                PermissionEnum::UsersCreate->value,
            ],
        ])
        ->assertRedirect(route('admin.roles.index'));

    $role->refresh();

    expect($role->name)->toBe('static_name')
        ->and($role->permissions)->toHaveCount(3);
});

test('admin can delete a role without users', function () {
    $admin = createAdminUser();

    $role = Role::create(['name' => 'deletable', 'guard_name' => 'web']);
    $role->syncPermissions([PermissionEnum::DashboardView->value]);

    $this->actingAs($admin)
        ->delete(route('admin.roles.destroy', $role))
        ->assertRedirect(route('admin.roles.index'));

    expect(Role::where('name', 'deletable')->first())->toBeNull();
});

test('admin cannot delete a role that is assigned to users', function () {
    $admin = createAdminUser();

    $role = Role::create(['name' => 'busy_role', 'guard_name' => 'web']);
    $role->syncPermissions([PermissionEnum::DashboardView->value]);

    $user = User::factory()->create();
    $user->assignRole('busy_role');

    $this->actingAs($admin)
        ->delete(route('admin.roles.destroy', $role))
        ->assertRedirect();

    expect(Role::where('name', 'busy_role')->first())->not->toBeNull();
});

test('unauthorized user cannot create roles', function () {
    $manager = User::factory()->create();
    $managerRole = Role::findByName(RoleEnum::Manager->value, 'web');
    $managerRole->syncPermissions([
        PermissionEnum::DashboardView->value,
        PermissionEnum::RolesView->value,
    ]);
    $manager->assignRole(RoleEnum::Manager->value);

    $this->actingAs($manager)
        ->post(route('admin.roles.store'), [
            'name' => 'forbidden_role',
            'permissions' => [PermissionEnum::DashboardView->value],
        ])
        ->assertForbidden();
});

test('roles index supports pagination', function () {
    $admin = createAdminUser();

    foreach (range(1, 15) as $i) {
        Role::create(['name' => "test_role_{$i}", 'guard_name' => 'web']);
    }

    $this->actingAs($admin)
        ->get(route('admin.roles.index', ['per_page' => 5]))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('roles.data', 5)
            ->where('roles.per_page', 5)
        );
});

test('roles index returns permissions count and users count', function () {
    $admin = createAdminUser();

    $role = Role::create(['name' => 'counted_role', 'guard_name' => 'web']);
    $role->syncPermissions([
        PermissionEnum::DashboardView->value,
        PermissionEnum::UsersView->value,
    ]);

    $user = User::factory()->create();
    $user->assignRole('counted_role');

    $this->actingAs($admin)
        ->get(route('admin.roles.index', ['search' => 'counted_role']))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('roles.data', 1)
            ->where('roles.data.0.permissions_count', 2)
            ->where('roles.data.0.users_count', 1)
        );
});
