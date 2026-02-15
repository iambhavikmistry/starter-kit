import React from 'react';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Check, Copy, Eye, EyeOff, Shield } from 'lucide-react';
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
import { useClipboard } from '@/hooks/use-clipboard';
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

const GENERAL_AUTH_KEYS = [
    'auth_registration_enabled',
    'auth_email_verification_required',
    'auth_session_timeout_minutes',
    'auth_min_password_length',
    'auth_recaptcha_enabled',
    'auth_recaptcha_site_key',
    'auth_recaptcha_secret_key',
] as const;

const SOCIAL_PROVIDERS = [
    { id: 'facebook', label: 'Facebook' },
    { id: 'twitter', label: 'Twitter / X' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'google', label: 'Google' },
    { id: 'github', label: 'GitHub' },
    { id: 'gitlab', label: 'GitLab' },
    { id: 'bitbucket', label: 'Bitbucket' },
    { id: 'slack', label: 'Slack' },
] as const;

type OAuthCallbackUrls = {
    facebook: string;
    twitter: string;
    linkedin: string;
    google: string;
    github: string;
    gitlab: string;
    bitbucket: string;
    slack: string;
};

type Props = {
    settings: Setting[];
    groups: SettingGroupOption[];
    activeGroup: string;
    oauthCallbackUrls?: OAuthCallbackUrls;
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
        .replace(/^(site_|mail_|social_|meta_|seo_|auth_)/, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .replace(/\bGithub\b/, 'GitHub');
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
                        type={setting.key.includes('_secret') ? 'password' : 'text'}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        autoComplete={setting.key.includes('_secret') ? 'off' : undefined}
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
    oauthCallbackUrls = {
        facebook: '',
        twitter: '',
        linkedin: '',
        google: '',
        github: '',
        gitlab: '',
        bitbucket: '',
        slack: '',
    },
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
    const isAuthGroup = activeGroup === 'auth';
    const settingsByKey = Object.fromEntries(
        settings.map((s) => [s.key, s]),
    ) as Record<string, Setting>;
    const generalSettings = isAuthGroup
        ? settings.filter((s) => GENERAL_AUTH_KEYS.includes(s.key as (typeof GENERAL_AUTH_KEYS)[number]))
        : [];
    const socialSettingsByProvider = isAuthGroup
        ? SOCIAL_PROVIDERS.map((p) => ({
              provider: p,
              settings: settings.filter(
                  (s) =>
                      s.key === `auth_${p.id}_enabled` ||
                      s.key === `auth_${p.id}_client_id` ||
                      s.key === `auth_${p.id}_client_secret` ||
                      s.key === `auth_${p.id}_redirect_uri`,
              ),
          }))
        : [];

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
                                {isAuthGroup ? (
                                    <>
                                        <div className="space-y-6">
                                            <h3 className="text-sm font-medium">
                                                General
                                            </h3>
                                            {generalSettings.map((setting) =>
                                                setting.key ===
                                                'auth_recaptcha_enabled' ? (
                                                    <div
                                                        key={setting.key}
                                                        className="flex items-center justify-between rounded-lg border p-4"
                                                    >
                                                        <div className="flex items-center gap-2 space-y-0.5">
                                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <Label
                                                                    htmlFor={
                                                                        setting.key
                                                                    }
                                                                >
                                                                    reCAPTCHA
                                                                    Protection
                                                                </Label>
                                                                {setting.description && (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {
                                                                            setting.description
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Switch
                                                            id={setting.key}
                                                            checked={
                                                                (data.settings[
                                                                    setting.key
                                                                ] ??
                                                                    '') ===
                                                                    '1' ||
                                                                (data.settings[
                                                                    setting.key
                                                                ] ??
                                                                    '') ===
                                                                    'true'
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                setData(
                                                                    'settings',
                                                                    {
                                                                        ...data.settings,
                                                                        [setting.key]:
                                                                            checked
                                                                                ? '1'
                                                                                : '0',
                                                                    },
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                ) : (
                                                    <SettingField
                                                        key={setting.key}
                                                        setting={setting}
                                                        value={
                                                            data.settings[
                                                                setting.key
                                                            ] ?? ''
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
                                                ),
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-sm font-medium">
                                                Social Login
                                            </h3>
                                            {socialSettingsByProvider.map(
                                                ({ provider, settings: providerSettings }) => (
                                                    <AuthSocialProviderCard
                                                        key={provider.id}
                                                        providerLabel={
                                                            provider.label
                                                        }
                                                        providerId={
                                                            provider.id
                                                        }
                                                        settings={
                                                            providerSettings
                                                        }
                                                        settingsByKey={
                                                            settingsByKey
                                                        }
                                                        callbackUrl={
                                                            oauthCallbackUrls[
                                                                provider.id as keyof OAuthCallbackUrls
                                                            ]
                                                        }
                                                        data={data.settings}
                                                        setData={setData}
                                                        dataKey="settings"
                                                        errors={errors}
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    settings.map((setting) => (
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
                                    ))
                                )}

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
                                                : 'Save Changes'}
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

function AuthSocialProviderCard({
    providerLabel,
    providerId,
    settings: providerSettings,
    settingsByKey,
    callbackUrl,
    data,
    setData,
    dataKey,
    errors,
}: {
    providerLabel: string;
    providerId: string;
    settings: Setting[];
    settingsByKey: Record<string, Setting>;
    callbackUrl: string;
    data: Record<string, string>;
    setData: (key: string, value: Record<string, string>) => void;
    dataKey: string;
    errors: Record<string, string>;
}) {
    const [copiedUrl, copy] = useClipboard();
    const [secretVisible, setSecretVisible] = React.useState(false);
    const enabledKey = `auth_${providerId}_enabled`;
    const clientIdKey = `auth_${providerId}_client_id`;
    const clientSecretKey = `auth_${providerId}_client_secret`;
    const redirectUriKey = `auth_${providerId}_redirect_uri`;
    const enabledSetting = settingsByKey[enabledKey];
    const clientIdSetting = settingsByKey[clientIdKey];
    const clientSecretSetting = settingsByKey[clientSecretKey];
    const redirectUriSetting = settingsByKey[redirectUriKey];

    return (
        <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-medium">{providerLabel} Login</h4>
                {enabledSetting && (
                    <div className="flex items-center gap-2">
                        <Label
                            htmlFor={enabledKey}
                            className="text-sm text-muted-foreground"
                        >
                            Allow users to sign in with {providerLabel}
                        </Label>
                        <Switch
                            id={enabledKey}
                            checked={
                                data[enabledKey] === '1' ||
                                data[enabledKey] === 'true'
                            }
                            onCheckedChange={(checked) =>
                                setData(dataKey, {
                                    ...data,
                                    [enabledKey]: checked ? '1' : '0',
                                })
                            }
                        />
                    </div>
                )}
            </div>

            {callbackUrl && (
                <div className="grid gap-2">
                    <Label>Callback URL</Label>
                    <div className="flex gap-2">
                        <Input
                            readOnly
                            value={callbackUrl}
                            className="font-mono text-sm"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => copy(callbackUrl)}
                            title="Copy URL"
                        >
                            {copiedUrl === callbackUrl ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Add this URL to your {providerLabel} OAuth
                        configuration
                    </p>
                </div>
            )}

            {clientIdSetting && (
                <div className="grid gap-2">
                    <Label htmlFor={clientIdKey}>Client ID</Label>
                    <Input
                        id={clientIdKey}
                        value={data[clientIdKey] ?? ''}
                        onChange={(e) =>
                            setData(dataKey, {
                                ...data,
                                [clientIdKey]: e.target.value,
                            })
                        }
                        placeholder={`Enter ${providerLabel} client ID`}
                    />
                    {errors[`settings.${clientIdKey}`] && (
                        <InputError
                            message={errors[`settings.${clientIdKey}`]}
                        />
                    )}
                </div>
            )}

            {clientSecretSetting && (
                <div className="grid gap-2">
                    <Label htmlFor={clientSecretKey}>Client Secret</Label>
                    <div className="relative">
                        <Input
                            id={clientSecretKey}
                            type={secretVisible ? 'text' : 'password'}
                            value={data[clientSecretKey] ?? ''}
                            onChange={(e) =>
                                setData(dataKey, {
                                    ...data,
                                    [clientSecretKey]: e.target.value,
                                })
                            }
                            placeholder="Enter client secret"
                            autoComplete="off"
                            className="pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() =>
                                setSecretVisible((v) => !v)
                            }
                            title={secretVisible ? 'Hide' : 'Show'}
                        >
                            {secretVisible ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    {errors[`settings.${clientSecretKey}`] && (
                        <InputError
                            message={errors[`settings.${clientSecretKey}`]}
                        />
                    )}
                </div>
            )}

            {redirectUriSetting && (
                <div className="grid gap-2">
                    <Label htmlFor={redirectUriKey}>
                        Override callback URL (optional)
                    </Label>
                    <Input
                        id={redirectUriKey}
                        value={data[redirectUriKey] ?? ''}
                        onChange={(e) =>
                            setData(dataKey, {
                                ...data,
                                [redirectUriKey]: e.target.value,
                            })
                        }
                        placeholder="e.g. http://localhost:8002/auth/.../callback"
                    />
                </div>
            )}
        </div>
    );
}
