import { Head, Link, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import {
    index,
    update,
} from '@/actions/App/Http/Controllers/Admin/RoleController';
import { dashboard as adminDashboard } from '@/routes/admin';
import type { BreadcrumbItem } from '@/types';

type PermissionItem = {
    value: string;
    label: string;
};

type GroupedPermissions = Record<string, PermissionItem[]>;

type RoleData = {
    id: string;
    name: string;
    permissions: string[];
};

type Props = {
    role: RoleData;
    permissions: GroupedPermissions;
};

export default function EditRole({ role, permissions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: adminDashboard().url },
        { title: 'Roles & Permissions', href: index.url() },
        {
            title: `Edit: ${role.name.replace(/_/g, ' ')}`,
            href: '#',
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: role.permissions,
    });

    const togglePermission = (value: string) => {
        const current = data.permissions;

        if (current.includes(value)) {
            setData(
                'permissions',
                current.filter((p) => p !== value),
            );
        } else {
            setData('permissions', [...current, value]);
        }
    };

    const toggleGroup = (group: PermissionItem[]) => {
        const groupValues = group.map((p) => p.value);
        const allSelected = groupValues.every((v) =>
            data.permissions.includes(v),
        );

        if (allSelected) {
            setData(
                'permissions',
                data.permissions.filter((p) => !groupValues.includes(p)),
            );
        } else {
            const merged = new Set([...data.permissions, ...groupValues]);
            setData('permissions', Array.from(merged));
        }
    };

    const toggleAll = () => {
        const allValues = Object.values(permissions).flatMap((group) =>
            group.map((p) => p.value),
        );
        const allSelected = allValues.every((v) =>
            data.permissions.includes(v),
        );

        setData('permissions', allSelected ? [] : allValues);
    };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(update.url(role.id));
    }

    const allPermissionValues = Object.values(permissions).flatMap(
        (group) => group.map((p) => p.value),
    );
    const allSelected =
        allPermissionValues.length > 0 &&
        allPermissionValues.every((v) => data.permissions.includes(v));
    const someSelected =
        data.permissions.length > 0 && !allSelected;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${role.name}`} />

            <div className="px-4 py-6">
                <Heading
                    title="Edit Role"
                    description={`Update permissions for ${role.name.replace(/_/g, ' ')}`}
                />

                <Card className="mx-auto max-w-3xl">
                    <CardContent className="pt-6">
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    autoFocus
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Permissions</Label>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="select-all"
                                            checked={
                                                allSelected ||
                                                (someSelected &&
                                                    'indeterminate')
                                            }
                                            onCheckedChange={toggleAll}
                                        />
                                        <Label
                                            htmlFor="select-all"
                                            className="text-muted-foreground text-sm font-normal"
                                        >
                                            Select all
                                        </Label>
                                    </div>
                                </div>
                                <InputError message={errors.permissions} />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {Object.entries(permissions).map(
                                        ([group, items]) => {
                                            const groupValues = items.map(
                                                (p) => p.value,
                                            );
                                            const groupAllSelected =
                                                groupValues.every((v) =>
                                                    data.permissions.includes(
                                                        v,
                                                    ),
                                                );
                                            const groupSomeSelected =
                                                groupValues.some((v) =>
                                                    data.permissions.includes(
                                                        v,
                                                    ),
                                                ) && !groupAllSelected;

                                            return (
                                                <div
                                                    key={group}
                                                    className="rounded-lg border p-4"
                                                >
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <Checkbox
                                                            id={`group-${group}`}
                                                            checked={
                                                                groupAllSelected ||
                                                                (groupSomeSelected &&
                                                                    'indeterminate')
                                                            }
                                                            onCheckedChange={() =>
                                                                toggleGroup(
                                                                    items,
                                                                )
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor={`group-${group}`}
                                                            className="text-sm font-semibold"
                                                        >
                                                            {group}
                                                        </Label>
                                                    </div>
                                                    <div className="space-y-2 pl-6">
                                                        {items.map(
                                                            (permission) => (
                                                                <div
                                                                    key={
                                                                        permission.value
                                                                    }
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <Checkbox
                                                                        id={`perm-${permission.value}`}
                                                                        checked={data.permissions.includes(
                                                                            permission.value,
                                                                        )}
                                                                        onCheckedChange={() =>
                                                                            togglePermission(
                                                                                permission.value,
                                                                            )
                                                                        }
                                                                    />
                                                                    <Label
                                                                        htmlFor={`perm-${permission.value}`}
                                                                        className="text-muted-foreground text-sm font-normal"
                                                                    >
                                                                        {
                                                                            permission.label
                                                                        }
                                                                    </Label>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Saving...'
                                        : 'Update Role'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={index.url()}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
