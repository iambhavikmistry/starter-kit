<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SettingGroup;
use App\Http\Controllers\Auth\OAuthController;
use App\Http\Controllers\Controller;
use App\Http\Requests\SystemSettings\UpdateSettingsRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
    /**
     * Display the system settings page.
     */
    public function index(?string $group = null): Response
    {
        $activeGroup = $group
            ? SettingGroup::tryFrom($group)
            : SettingGroup::General;

        if (! $activeGroup) {
            $activeGroup = SettingGroup::General;
        }

        $settings = Setting::query()
            ->group($activeGroup)
            ->orderBy('key')
            ->get();

        $groups = collect(SettingGroup::cases())->map(fn (SettingGroup $g) => [
            'value' => $g->value,
            'label' => $g->label(),
            'description' => $g->description(),
        ]);

        $props = [
            'settings' => $settings,
            'groups' => $groups,
            'activeGroup' => $activeGroup->value,
        ];

        if ($activeGroup === SettingGroup::Auth) {
            $props['oauthCallbackUrls'] = [
                'facebook' => OAuthController::getCallbackUrlForProvider('facebook'),
                'twitter' => OAuthController::getCallbackUrlForProvider('twitter'),
                'linkedin' => OAuthController::getCallbackUrlForProvider('linkedin'),
                'google' => OAuthController::getCallbackUrlForProvider('google'),
                'github' => OAuthController::getCallbackUrlForProvider('github'),
                'gitlab' => OAuthController::getCallbackUrlForProvider('gitlab'),
                'bitbucket' => OAuthController::getCallbackUrlForProvider('bitbucket'),
                'slack' => OAuthController::getCallbackUrlForProvider('slack'),
            ];
        }

        return Inertia::render('admin/system-settings/index', $props);
    }

    /**
     * Update the specified settings.
     */
    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        foreach ($validated['settings'] as $key => $value) {
            Setting::setValue($key, $value ?? '');
        }

        return back()->with('success', 'Settings updated successfully.');
    }
}
