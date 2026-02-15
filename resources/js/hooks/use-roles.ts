import { usePage } from '@inertiajs/react';

const ADMIN_ROLES = ['super_admin', 'admin', 'manager'];

export function useRoles() {
    const { auth } = usePage().props;

    const roles = auth.roles ?? [];
    const permissions = auth.permissions ?? [];

    const hasRole = (role: string): boolean => roles.includes(role);

    const hasAnyRole = (checkRoles: string[]): boolean =>
        checkRoles.some((role) => roles.includes(role));

    const hasPermission = (permission: string): boolean =>
        permissions.includes(permission);

    const hasAnyPermission = (checkPermissions: string[]): boolean =>
        checkPermissions.some((permission) => permissions.includes(permission));

    const isAdmin = hasAnyRole(ADMIN_ROLES);

    const isSuperAdmin = hasRole('super_admin');

    const isMember = hasRole('member') && !isAdmin;

    return {
        roles,
        permissions,
        hasRole,
        hasAnyRole,
        hasPermission,
        hasAnyPermission,
        isAdmin,
        isSuperAdmin,
        isMember,
    };
}
