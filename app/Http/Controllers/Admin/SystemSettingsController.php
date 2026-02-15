<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SettingGroup;
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

        return Inertia::render('admin/system-settings/index', [
            'settings' => $settings,
            'groups' => $groups,
            'activeGroup' => $activeGroup->value,
        ]);
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
