<?php

namespace Database\Seeders;

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    private const GUARD = 'web';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->seedPermissions();
        $this->seedRoles();
    }

    private function seedPermissions(): void
    {
        foreach (PermissionEnum::cases() as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission->value, 'guard_name' => self::GUARD],
                ['name' => $permission->value, 'guard_name' => self::GUARD]
            );
        }
    }

    private function seedRoles(): void
    {
        foreach (RoleEnum::cases() as $roleEnum) {
            $role = Role::firstOrCreate(
                ['name' => $roleEnum->value, 'guard_name' => self::GUARD],
                ['name' => $roleEnum->value, 'guard_name' => self::GUARD]
            );

            $permissionValues = array_map(
                fn (PermissionEnum $p): string => $p->value,
                $roleEnum->permissions()
            );

            $role->syncPermissions($permissionValues);
        }
    }
}
