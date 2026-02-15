import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { EllipsisVerticalIcon, PlusIcon, ShieldIcon } from 'lucide-react';
import Heading from '@/components/heading';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import {
    index,
    create,
    edit,
    destroy,
} from '@/actions/App/Http/Controllers/Admin/RoleController';
import { dashboard as adminDashboard } from '@/routes/admin';
import type { BreadcrumbItem } from '@/types';

type RoleItem = {
    id: string;
    name: string;
    guard_name: string;
    permissions_count: number;
    users_count: number;
    created_at: string;
};

type PaginatedRoles = {
    data: RoleItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Filters = {
    search: string;
    sort: string;
    direction: string;
    per_page: number;
};

type Props = {
    roles: PaginatedRoles;
    filters: Filters;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminDashboard().url },
    { title: 'Roles & Permissions', href: index.url() },
];

function RoleActions({
    role,
    onDelete,
}: {
    role: RoleItem;
    onDelete: (role: RoleItem) => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    aria-label="Role actions"
                >
                    <EllipsisVerticalIcon className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href={edit.url(role.id)}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(role)}
                        disabled={role.users_count > 0}
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function RolesIndex({ roles, filters }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<RoleItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const visitWithFilters = (
        params: Record<string, string | number>,
    ) => {
        router.get(index.url(), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) {
            return;
        }

        setDeleting(true);
        router.delete(destroy.url(deleteTarget.id), {
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    const handlePageChange = (page: number) => {
        visitWithFilters({ ...filters, page });
    };

    const handleServerSearchChange = (value: string) => {
        visitWithFilters({
            ...filters,
            search: value,
            page: 1,
        });
    };

    const handlePerPageChange = (perPage: number) => {
        visitWithFilters({
            ...filters,
            per_page: perPage,
            page: 1,
        });
    };

    const columns: ColumnDef<RoleItem>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() &&
                            'indeterminate')
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) =>
                        row.toggleSelected(!!value)
                    }
                    aria-label="Select row"
                />
            ),
            size: 50,
            enableSorting: false,
        },
        {
            header: 'Role',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex size-9 items-center justify-center rounded-lg">
                        <ShieldIcon className="text-primary size-4" />
                    </div>
                    <span className="font-medium capitalize">
                        {row.original.name.replace(/_/g, ' ')}
                    </span>
                </div>
            ),
            size: 250,
        },
        {
            header: 'Permissions',
            accessorKey: 'permissions_count',
            cell: ({ row }) => (
                <Badge variant="outline" className="rounded-sm border-none">
                    {row.original.permissions_count}{' '}
                    {row.original.permissions_count === 1
                        ? 'permission'
                        : 'permissions'}
                </Badge>
            ),
            size: 160,
            enableSorting: false,
        },
        {
            header: 'Users',
            accessorKey: 'users_count',
            cell: ({ row }) => (
                <Badge variant="outline" className="rounded-sm border-none">
                    {row.original.users_count}{' '}
                    {row.original.users_count === 1 ? 'user' : 'users'}
                </Badge>
            ),
            size: 120,
            enableSorting: false,
        },
        {
            header: 'Created',
            accessorKey: 'created_at',
            cell: ({ row }) =>
                new Date(row.original.created_at).toLocaleDateString(
                    'en-US',
                    {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    },
                ),
            size: 140,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <RoleActions
                    role={row.original}
                    onDelete={setDeleteTarget}
                />
            ),
            size: 70,
            enableSorting: false,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Permissions" />

            <div className="px-4 py-6">
                <Heading
                    title="Roles & Permissions"
                    description="Manage roles and their associated permissions"
                />

                <div className="rounded-xl border">
                    <DataTable
                        columns={columns}
                        data={roles.data}
                        serverSearchValue={filters.search}
                        onServerSearchChange={handleServerSearchChange}
                        serverSearchPlaceholder="Search roles..."
                        pagination={{
                            currentPage: roles.current_page,
                            lastPage: roles.last_page,
                            perPage: roles.per_page,
                            total: roles.total,
                            from: roles.from,
                            to: roles.to,
                        }}
                        onPageChange={handlePageChange}
                        onPerPageChange={handlePerPageChange}
                        enableExport
                        exportFileName="roles"
                        toolbar={
                            <Button asChild>
                                <Link href={create.url()}>
                                    <PlusIcon />
                                    Add Role
                                </Link>
                            </Button>
                        }
                    />
                </div>
            </div>

            <Dialog
                open={!!deleteTarget}
                onOpenChange={() => setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Role</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the role{' '}
                            <strong className="capitalize">
                                {deleteTarget?.name.replace(/_/g, ' ')}
                            </strong>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteTarget && deleteTarget.users_count > 0 && (
                        <p className="text-destructive text-sm">
                            This role is assigned to{' '}
                            {deleteTarget.users_count} user(s) and cannot
                            be deleted.
                        </p>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={
                                deleting ||
                                (deleteTarget?.users_count ?? 0) > 0
                            }
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
