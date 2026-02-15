<?php

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Enums\SettingGroup;
use App\Enums\SettingType;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use Database\Seeders\SettingSeeder;

beforeEach(function () {
    Permission::firstOrCreate(
        ['name' => PermissionEnum::SettingsView->value, 'guard_name' => 'web'],
    );
    Permission::firstOrCreate(
        ['name' => PermissionEnum::SettingsUpdate->value, 'guard_name' => 'web'],
    );

    foreach (RoleEnum::cases() as $roleEnum) {
        Role::firstOrCreate(['name' => $roleEnum->value, 'guard_name' => 'web']);
    }
});

test('guests are redirected to login when accessing system settings', function () {
    $this->get(route('admin.system-settings.index'))
        ->assertRedirect(route('login'));
});

test('member users cannot access admin system settings', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Member->value);

    $this->actingAs($user)
        ->get(route('admin.system-settings.index'))
        ->assertForbidden();
});

test('admin users can view system settings page', function () {
    $this->seed(SettingSeeder::class);

    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Admin->value);
    $user->givePermissionTo(PermissionEnum::SettingsView->value);

    $this->actingAs($user)
        ->get(route('admin.system-settings.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('admin/system-settings/index')
            ->has('settings')
            ->has('groups')
            ->where('activeGroup', 'general')
        );
});

test('system settings page defaults to general group', function () {
    $this->seed(SettingSeeder::class);

    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Admin->value);

    $this->actingAs($user)
        ->get(route('admin.system-settings.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('activeGroup', 'general')
        );
});

test('system settings page can filter by group', function () {
    $this->seed(SettingSeeder::class);

    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Admin->value);

    $this->actingAs($user)
        ->get(route('admin.system-settings.index', ['group' => 'mail']))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('activeGroup', 'mail')
            ->has('settings', 3)
        );
});

test('system settings page falls back to general for invalid group', function () {
    $this->seed(SettingSeeder::class);

    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Admin->value);

    $this->actingAs($user)
        ->get(route('admin.system-settings.index', ['group' => 'invalid']))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('activeGroup', 'general')
        );
});

test('admin users can update system settings', function () {
    $this->seed(SettingSeeder::class);

    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Admin->value);
    $user->givePermissionTo(PermissionEnum::SettingsUpdate->value);

    $this->actingAs($user)
        ->put(route('admin.system-settings.update'), [
            'settings' => [
                'site_name' => 'My Custom Platform',
                'site_description' => 'A custom description',
            ],
        ])
        ->assertRedirect();

    expect(Setting::getValue('site_name'))->toBe('My Custom Platform')
        ->and(Setting::getValue('site_description'))->toBe('A custom description');
});

test('member users cannot update system settings', function () {
    $this->seed(SettingSeeder::class);

    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Member->value);

    $this->actingAs($user)
        ->put(route('admin.system-settings.update'), [
            'settings' => [
                'site_name' => 'Hacked Platform',
            ],
        ])
        ->assertForbidden();

    expect(Setting::getValue('site_name'))->not->toBe('Hacked Platform');
});

test('setting update validates input types', function () {
    $this->seed(SettingSeeder::class);

    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Admin->value);
    $user->givePermissionTo(PermissionEnum::SettingsUpdate->value);

    $this->actingAs($user)
        ->put(route('admin.system-settings.update'), [
            'settings' => [
                'tax_rate' => 'not-a-number',
            ],
        ])
        ->assertSessionHasErrors('settings.tax_rate');
});

test('setting model get value returns typed values', function () {
    Setting::factory()->create([
        'key' => 'test_bool',
        'value' => '1',
        'type' => SettingType::Boolean,
    ]);

    Setting::factory()->create([
        'key' => 'test_number',
        'value' => '42.5',
        'type' => SettingType::Number,
    ]);

    Setting::factory()->create([
        'key' => 'test_text',
        'value' => 'hello',
        'type' => SettingType::Text,
    ]);

    expect(Setting::getValue('test_bool'))->toBeTrue()
        ->and(Setting::getValue('test_number'))->toBe(42.5)
        ->and(Setting::getValue('test_text'))->toBe('hello')
        ->and(Setting::getValue('nonexistent', 'fallback'))->toBe('fallback');
});

test('setting model set value updates existing settings', function () {
    Setting::factory()->create([
        'key' => 'test_key',
        'value' => 'old_value',
    ]);

    Setting::setValue('test_key', 'new_value');

    expect(Setting::getValue('test_key'))->toBe('new_value');
});

test('setting model set value returns null for nonexistent keys', function () {
    $result = Setting::setValue('nonexistent_key', 'value');

    expect($result)->toBeNull();
});

test('setting seeder creates expected default settings', function () {
    $this->seed(SettingSeeder::class);

    expect(Setting::query()->count())->toBeGreaterThan(0)
        ->and(Setting::query()->group(SettingGroup::General)->count())->toBeGreaterThan(0)
        ->and(Setting::query()->group(SettingGroup::Mail)->count())->toBe(3)
        ->and(Setting::query()->group(SettingGroup::Seo)->count())->toBe(3)
        ->and(Setting::query()->group(SettingGroup::Social)->count())->toBe(4)
        ->and(Setting::query()->group(SettingGroup::Billing)->count())->toBe(2);
});

test('setting seeder is idempotent', function () {
    $this->seed(SettingSeeder::class);
    $countBefore = Setting::query()->count();

    $this->seed(SettingSeeder::class);
    $countAfter = Setting::query()->count();

    expect($countAfter)->toBe($countBefore);
});
