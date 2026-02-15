<?php

namespace App\Models;

use App\Enums\SettingGroup;
use App\Enums\SettingType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    /** @use HasFactory<\Database\Factories\SettingFactory> */
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'value',
        'group',
        'type',
        'description',
        'options',
        'is_public',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => 'array',
            'is_public' => 'boolean',
            'group' => SettingGroup::class,
            'type' => SettingType::class,
        ];
    }

    /**
     * Scope a query to only include settings for a given group.
     */
    public function scopeGroup(Builder $query, SettingGroup $group): Builder
    {
        return $query->where('group', $group);
    }

    /**
     * Scope a query to only include public settings.
     */
    public function scopePublic(Builder $query): Builder
    {
        return $query->where('is_public', true);
    }

    /**
     * Get a setting value by key.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = static::query()->where('key', $key)->first();

        if (! $setting) {
            return $default;
        }

        return match ($setting->type) {
            SettingType::Boolean => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            SettingType::Number => is_numeric($setting->value) ? (float) $setting->value : $default,
            default => $setting->value ?? $default,
        };
    }

    /**
     * Set a setting value by key.
     */
    public static function setValue(string $key, mixed $value): ?static
    {
        $setting = static::query()->where('key', $key)->first();

        if (! $setting) {
            return null;
        }

        $setting->value = match (true) {
            is_array($value) => json_encode($value),
            is_bool($value) => $value ? '1' : '0',
            default => (string) $value,
        };
        $setting->save();

        return $setting;
    }

    /**
     * Get all settings grouped, optionally filtered by a specific group.
     *
     * @return array<string, array<int, array<string, mixed>>>
     */
    public static function allGrouped(?SettingGroup $group = null): array
    {
        $query = static::query()->orderBy('group')->orderBy('key');

        if ($group) {
            $query->group($group);
        }

        return $query->get()
            ->groupBy('group')
            ->toArray();
    }
}
