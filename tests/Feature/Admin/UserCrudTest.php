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

function createAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Admin->value);

    return $user;
}

function createMember(): User
{
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Member->value);

    return $user;
}

test('guests cannot access user management', function () {
    $this->get(route('admin.users.index'))->assertRedirect(route('login'));
    $this->get(route('admin.users.create'))->assertRedirect(route('login'));
    $this->post(route('admin.users.store'))->assertRedirect(route('login'));
});

test('member users cannot access user management', function () {
    $member = createMember();

    $this->actingAs($member)
        ->get(route('admin.users.index'))
        ->assertForbidden();
});

test('admin can view user index page', function () {
    $admin = createAdmin();

    User::factory(3)->create();

    $this->actingAs($admin)
        ->get(route('admin.users.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/index')
            ->has('users.data')
            ->has('roles')
            ->has('filters')
        );
});

test('admin can search users', function () {
    $admin = createAdmin();

    User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);
    User::factory()->create(['name' => 'Jane Smith', 'email' => 'jane@example.com']);

    $this->actingAs($admin)
        ->get(route('admin.users.index', ['search' => 'John']))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('filters.search', 'John')
            ->has('users.data', 1)
        );
});

test('admin can filter users by role', function () {
    $admin = createAdmin();

    $member = User::factory()->create();
    $member->assignRole(RoleEnum::Member->value);

    $this->actingAs($admin)
        ->get(route('admin.users.index', ['role' => RoleEnum::Member->value]))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('filters.role', RoleEnum::Member->value)
        );
});

test('admin can view create user page', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get(route('admin.users.create'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/create')
            ->has('roles')
        );
});

test('admin can create a user', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => RoleEnum::Member->value,
        ])
        ->assertRedirect(route('admin.users.index'));

    $user = User::where('email', 'newuser@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->name)->toBe('New User')
        ->and($user->hasRole(RoleEnum::Member->value))->toBeTrue();
});

test('create user validates required fields', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('admin.users.store'), [])
        ->assertSessionHasErrors(['name', 'email', 'password', 'role']);
});

test('create user validates unique email', function () {
    $admin = createAdmin();

    User::factory()->create(['email' => 'taken@example.com']);

    $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'Test',
            'email' => 'taken@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => RoleEnum::Member->value,
        ])
        ->assertSessionHasErrors('email');
});

test('admin can view edit user page', function () {
    $admin = createAdmin();
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Member->value);

    $this->actingAs($admin)
        ->get(route('admin.users.edit', $user))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/edit')
            ->has('user')
            ->has('roles')
            ->where('user.id', $user->id)
        );
});

test('admin can update a user', function () {
    $admin = createAdmin();
    $user = User::factory()->create(['name' => 'Old Name']);
    $user->assignRole(RoleEnum::Member->value);

    $this->actingAs($admin)
        ->put(route('admin.users.update', $user), [
            'name' => 'Updated Name',
            'email' => $user->email,
            'role' => RoleEnum::Manager->value,
        ])
        ->assertRedirect(route('admin.users.index'));

    $user->refresh();

    expect($user->name)->toBe('Updated Name')
        ->and($user->hasRole(RoleEnum::Manager->value))->toBeTrue();
});

test('admin can update a user without changing password', function () {
    $admin = createAdmin();
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Member->value);

    $originalPassword = $user->password;

    $this->actingAs($admin)
        ->put(route('admin.users.update', $user), [
            'name' => 'Same User',
            'email' => $user->email,
            'role' => RoleEnum::Member->value,
        ])
        ->assertRedirect(route('admin.users.index'));

    $user->refresh();

    expect($user->password)->toBe($originalPassword);
});

test('admin can update a user password', function () {
    $admin = createAdmin();
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Member->value);

    $originalPassword = $user->password;

    $this->actingAs($admin)
        ->put(route('admin.users.update', $user), [
            'name' => $user->name,
            'email' => $user->email,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
            'role' => RoleEnum::Member->value,
        ])
        ->assertRedirect(route('admin.users.index'));

    $user->refresh();

    expect($user->password)->not->toBe($originalPassword);
});

test('admin can delete a user', function () {
    $admin = createAdmin();
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->delete(route('admin.users.destroy', $user))
        ->assertRedirect(route('admin.users.index'));

    expect(User::find($user->id))->toBeNull();
});

test('admin cannot delete themselves', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->delete(route('admin.users.destroy', $admin))
        ->assertRedirect();

    expect(User::find($admin->id))->not->toBeNull();
});

test('unauthorized user cannot create users', function () {
    $manager = User::factory()->create();
    $managerRole = Role::findByName(RoleEnum::Manager->value, 'web');
    $managerRole->syncPermissions([
        PermissionEnum::DashboardView->value,
        PermissionEnum::UsersView->value,
    ]);
    $manager->assignRole(RoleEnum::Manager->value);

    $this->actingAs($manager)
        ->post(route('admin.users.store'), [
            'name' => 'Forbidden',
            'email' => 'forbidden@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => RoleEnum::Member->value,
        ])
        ->assertForbidden();
});

test('users index supports pagination', function () {
    $admin = createAdmin();

    User::factory(15)->create();

    $this->actingAs($admin)
        ->get(route('admin.users.index', ['per_page' => 5]))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('users.data', 5)
            ->where('users.per_page', 5)
        );
});
