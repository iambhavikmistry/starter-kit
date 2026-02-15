import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Welcome, {auth.user?.name ?? 'User'}
                    </h2>
                    <p className="text-muted-foreground">
                        Here&apos;s your personal dashboard.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h3 className="text-lg font-semibold">
                            My Profile
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Manage your account settings and preferences.
                        </p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h3 className="text-lg font-semibold">
                            Activity
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Your recent activity will appear here.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
