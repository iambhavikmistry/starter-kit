import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { EllipsisVerticalIcon, PlusIcon } from 'lucide-react';
import Heading from '@/components/heading';
import { DataTable } from '@/components/data-table';
import type { ServerFilterConfig } from '@/components/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import {
    index,
    create,
    edit,
    destroy,
} from '@/actions/App/Http/Controllers/Admin/UserController';
import { dashboard as adminDashboard } from '@/routes/admin';
import type { BreadcrumbItem } from '@/types';

type UserRole = {
    id: string;
    name: string;
};

type UserItem = {
    id: string;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    roles: UserRole[];
};

type RoleOption = {
    value: string;
    label: string;
};

type PaginatedUsers = {
    data: UserItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Filters = {
    search: string;
    role: string;
    sort: string;
    direction: string;
    per_page: number;
};

type Props = {
    users: PaginatedUsers;
    roles: RoleOption[];
    filters: Filters;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminDashboard().url },
    { title: 'Users', href: index.url() },
];

const roleStyles: Record<string, string> = {
    super_admin:
        'bg-purple-600/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400',
    admin: 'bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400',
    manager:
        'bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400',
    member: 'bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400',
};

function UserActions({
    user,
    onDelete,
}: {
    user: UserItem;
    onDelete: (user: UserItem) => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    aria-label="User actions"
                >
                    <EllipsisVerticalIcon className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href={edit.url(user.id)}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(user)}
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function UsersIndex({ users, roles, filters }: Props) {
    const getInitials = useInitials();
    const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
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

    const handleServerFilterApply = (values: Record<string, string>) => {
        visitWithFilters({
            ...filters,
            ...values,
            page: 1,
        });
    };

    const handleServerFilterClear = () => {
        visitWithFilters({
            ...filters,
            role: '',
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

    const serverFilters: ServerFilterConfig[] = [
        {
            key: 'role',
            label: 'Role',
            type: 'select',
            options: roles,
        },
    ];

    const columns: ColumnDef<UserItem>[] = [
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
            header: 'User',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                        <AvatarImage
                            src={undefined}
                            alt={row.original.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(row.original.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {row.original.name}
                        </span>
                        <span className="text-muted-foreground text-sm">
                            {row.original.email}
                        </span>
                    </div>
                </div>
            ),
            size: 300,
        },
        {
            header: 'Role',
            accessorKey: 'role',
            accessorFn: (row) => row.roles[0]?.name ?? 'none',
            cell: ({ row }) => {
                const role = row.original.roles[0]?.name ?? 'none';
                const style = roleStyles[role] ?? '';

                return (
                    <Badge
                        className={`rounded-sm border-none capitalize ${style}`}
                    >
                        {role.replace(/_/g, ' ')}
                    </Badge>
                );
            },
            size: 150,
        },
        {
            header: 'Email Verified',
            accessorKey: 'email_verified_at',
            cell: ({ row }) => (
                <Badge
                    variant={
                        row.original.email_verified_at
                            ? 'default'
                            : 'outline'
                    }
                    className="rounded-sm border-none"
                >
                    {row.original.email_verified_at
                        ? 'Verified'
                        : 'Unverified'}
                </Badge>
            ),
            size: 130,
            enableSorting: false,
        },
        {
            header: 'Joined',
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
                <UserActions
                    user={row.original}
                    onDelete={setDeleteTarget}
                />
            ),
            size: 70,
            enableSorting: false,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="px-4 py-6">
                <Heading
                    title="Users"
                    description="Manage user accounts and their roles"
                />

                <div className="rounded-xl border">
                    <DataTable
                        columns={columns}
                        data={users.data}
                        serverSearchValue={filters.search}
                        onServerSearchChange={handleServerSearchChange}
                        serverSearchPlaceholder="Search users..."
                        serverFilters={serverFilters}
                        serverFilterValues={{ role: filters.role }}
                        onServerFilterApply={handleServerFilterApply}
                        onServerFilterClear={handleServerFilterClear}
                        pagination={{
                            currentPage: users.current_page,
                            lastPage: users.last_page,
                            perPage: users.per_page,
                            total: users.total,
                            from: users.from,
                            to: users.to,
                        }}
                        onPageChange={handlePageChange}
                        onPerPageChange={handlePerPageChange}
                        enableExport
                        exportFileName="users"
                        toolbar={
                            <Button asChild>
                                <Link href={create.url()}>
                                    <PlusIcon />
                                    Add User
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
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <strong>{deleteTarget?.name}</strong>? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
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
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
