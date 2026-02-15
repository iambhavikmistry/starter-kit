import { LayoutGrid, Settings, Users } from 'lucide-react';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as rolesIndex } from '@/routes/admin/roles';
import { index as systemSettingsIndex } from '@/routes/admin/system-settings';
import { index as usersIndex } from '@/routes/admin/users';
import type { NavItem } from '@/types';

export const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: adminDashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'User Management',
        icon: Users,
        children: [
            {
                title: 'Users',
                href: usersIndex(),
            },
            {
                title: 'Roles & Permissions',
                href: rolesIndex(),
            },
        ],
    },
    {
        title: 'System Settings',
        href: systemSettingsIndex(),
        icon: Settings,
    },
];

export const userNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];
