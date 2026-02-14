<?php

namespace App\Enums;

enum RoleEnum: string
{
    case SuperAdmin = 'super_admin';
    case Admin = 'admin';
    case Manager = 'manager';
    case Member = 'member';

    /**
     * @return array<PermissionEnum>
     */
    public function permissions(): array
    {
        return match ($this) {
            self::SuperAdmin, self::Admin => PermissionEnum::cases(),
            self::Manager => [
                PermissionEnum::DashboardView,
                PermissionEnum::AnalyticsView,
                PermissionEnum::UsersView,
                PermissionEnum::UsersUpdate,
                PermissionEnum::RolesView,
                PermissionEnum::RolesAssign,
                PermissionEnum::SettingsView,
                PermissionEnum::BillingView,
            ],
            self::Member => [
                PermissionEnum::DashboardView,
            ],
        };
    }
}
