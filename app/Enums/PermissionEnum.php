<?php

namespace App\Enums;

enum PermissionEnum: string
{
    case DashboardView = 'dashboard.view';
    case AnalyticsView = 'analytics.view';

    case UsersView = 'users.view';
    case UsersCreate = 'users.create';
    case UsersUpdate = 'users.update';
    case UsersDelete = 'users.delete';

    case RolesView = 'roles.view';
    case RolesCreate = 'roles.create';
    case RolesUpdate = 'roles.update';
    case RolesDelete = 'roles.delete';
    case RolesAssign = 'roles.assign';

    case SettingsView = 'settings.view';
    case SettingsUpdate = 'settings.update';

    case BillingView = 'billing.view';
    case BillingManage = 'billing.manage';
}
