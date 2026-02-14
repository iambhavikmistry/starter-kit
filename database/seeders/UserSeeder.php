<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->createUser('Super Admin', 'super@example.com', RoleEnum::SuperAdmin);
        $this->createUser('Admin User', 'admin@example.com', RoleEnum::Admin);
        $this->createUser('Manager User', 'manager@example.com', RoleEnum::Manager);
        $this->createUser('Test User', 'test@example.com', RoleEnum::Member);

        User::factory(5)->create()->each(function (User $user): void {
            $user->assignRole(RoleEnum::Member->value);
        });
    }

    private function createUser(string $name, string $email, RoleEnum $role): User
    {
        $user = User::factory()->create([
            'name' => $name,
            'email' => $email,
        ]);

        $user->assignRole($role->value);

        return $user;
    }
}
