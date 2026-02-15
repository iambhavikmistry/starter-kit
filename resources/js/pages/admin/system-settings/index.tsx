import { Transition } from '@headlessui/react';
import { Head, Link, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index, update } from '@/actions/App/Http/Controllers/Admin/SystemSettingsController';

type Setting = {
    id: string;
    key: string;
    value: string | null;
    group: string;
    type: string;
    description: string | null;
    options: Record<string, string> | null;
    is_public: boolean;
};

type SettingGroupOption = {
    value: string;
    label: string;
    description: string;
};

type Props = {
    settings: Setting[];
    groups: SettingGroupOption[];
    activeGroup: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: adminDashboard().url,
    },
    {
        title: 'System Settings',
        href: index.url(),
    },
];

function formatLabel(key: string): string {
    return key
        .replace(/^(site_|mail_|social_|meta_|seo_)/, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function SettingField({
    setting,
    value,
    onChange,
    error,
}: {
    setting: Setting;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}) {
    const label = formatLabel(setting.key);

    switch (setting.type) {
        case 'boolean':
            return (
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor={setting.key}>{label}</Label>
                        {setting.description && (
                            <p className="text-sm text-muted-foreground">
                                {setting.description}
                            </p>
                        )}
                    </div>
                    <Switch
                        id={setting.key}
                        checked={value === '1' || value === 'true'}
                        onCheckedChange={(checked) =>
                            onChange(checked ? '1' : '0')
                        }
                    />
                    {error && <InputError message={error} />}
                </div>
            );

        case 'textarea':
            return (
                <div className="grid gap-2">
                    <Label htmlFor={setting.key}>{label}</Label>
                    {setting.description && (
                        <p className="text-sm text-muted-foreground">
                            {setting.description}
                        </p>
                    )}
                    <Textarea
                        id={setting.key}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        rows={3}
                    />
                    <InputError message={error} />
                </div>
            );

        case 'select':
            return (
                <div className="grid gap-2">
                    <Label htmlFor={setting.key}>{label}</Label>
                    {setting.description && (
                        <p className="text-sm text-muted-foreground">
                            {setting.description}
                        </p>
                    )}
                    <Select value={value} onValueChange={onChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                            {setting.options &&
                                Object.entries(setting.options).map(
                                    ([optValue, optLabel]) => (
                                        <SelectItem
                                            key={optValue}
                                            value={optValue}
                                        >
                                            {optLabel}
                                        </SelectItem>
                                    ),
                                )}
                        </SelectContent>
                    </Select>
                    <InputError message={error} />
                </div>
            );

        case 'number':
            return (
                <div className="grid gap-2">
                    <Label htmlFor={setting.key}>{label}</Label>
                    {setting.description && (
                        <p className="text-sm text-muted-foreground">
                            {setting.description}
                        </p>
                    )}
                    <Input
                        id={setting.key}
                        type="number"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        step="any"
                    />
                    <InputError message={error} />
                </div>
            );

        default:
            return (
                <div className="grid gap-2">
                    <Label htmlFor={setting.key}>{label}</Label>
                    {setting.description && (
                        <p className="text-sm text-muted-foreground">
                            {setting.description}
                        </p>
                    )}
                    <Input
                        id={setting.key}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <InputError message={error} />
                </div>
            );
    }
}

export default function SystemSettings({
    settings,
    groups,
    activeGroup,
}: Props) {
    const initialSettings: Record<string, string> = {};
    settings.forEach((setting) => {
        initialSettings[setting.key] = setting.value ?? '';
    });

    const { data, setData, put, processing, errors, recentlySuccessful } =
        useForm<{ settings: Record<string, string> }>({
            settings: initialSettings,
        });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(update.url(), {
            preserveScroll: true,
        });
    }

    const activeGroupOption = groups.find((g) => g.value === activeGroup);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings" />

            <div className="px-4 py-6">
                <Heading
                    title="System Settings"
                    description="Manage your platform configuration and preferences"
                />

                <div className="flex flex-col lg:flex-row lg:space-x-12">
                    <aside className="w-full max-w-xl lg:w-48">
                        <nav
                            className="flex flex-col space-y-1"
                            aria-label="Settings Groups"
                        >
                            {groups.map((group) => (
                                <Button
                                    key={group.value}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={`w-full justify-start ${
                                        activeGroup === group.value
                                            ? 'bg-muted'
                                            : ''
                                    }`}
                                >
                                    <Link
                                        href={index.url(
                                            group.value,
                                        )}
                                    >
                                        {group.label}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </aside>

                    <div className="mt-6 flex-1 md:max-w-2xl lg:mt-0">
                        <section className="max-w-xl space-y-6">
                            {activeGroupOption && (
                                <Heading
                                    variant="small"
                                    title={activeGroupOption.label}
                                    description={
                                        activeGroupOption.description
                                    }
                                />
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                {settings.map((setting) => (
                                    <SettingField
                                        key={setting.key}
                                        setting={setting}
                                        value={
                                            data.settings[setting.key] ?? ''
                                        }
                                        onChange={(value) =>
                                            setData('settings', {
                                                ...data.settings,
                                                [setting.key]: value,
                                            })
                                        }
                                        error={
                                            errors[
                                                `settings.${setting.key}` as keyof typeof errors
                                            ]
                                        }
                                    />
                                ))}

                                {settings.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No settings found for this group.
                                    </p>
                                )}

                                {settings.length > 0 && (
                                    <div className="flex items-center gap-4">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Saving...'
                                                : 'Save Settings'}
                                        </Button>

                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-neutral-600">
                                                Saved
                                            </p>
                                        </Transition>
                                    </div>
                                )}
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
