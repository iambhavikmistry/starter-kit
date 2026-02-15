import { Head, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Settings,
    Shield,
    Users,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard as adminDashboard } from '@/routes/admin';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: adminDashboard().url,
    },
];

export default function AdminDashboard() {
    const { auth } = usePage().props;

    const stats = [
        {
            title: 'Total Users',
            value: '—',
            icon: Users,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/50',
        },
        {
            title: 'Active Roles',
            value: '4',
            icon: Shield,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/50',
        },
        {
            title: 'System Settings',
            value: '—',
            icon: Settings,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/50',
        },
        {
            title: 'Analytics',
            value: '—',
            icon: BarChart3,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/50',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Welcome back, {auth.user?.name ?? 'User'}
                    </h2>
                    <p className="text-muted-foreground">
                        Here&apos;s an overview of your admin panel.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.title}
                            className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </p>
                                <div
                                    className={`rounded-lg p-2 ${stat.bg}`}
                                >
                                    <stat.icon
                                        className={`h-4 w-4 ${stat.color}`}
                                    />
                                </div>
                            </div>
                            <p className="mt-2 text-3xl font-bold">
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h3 className="text-lg font-semibold">
                            Recent Activity
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            No recent activity to display.
                        </p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h3 className="text-lg font-semibold">
                            Quick Actions
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Admin quick actions will be available here.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
