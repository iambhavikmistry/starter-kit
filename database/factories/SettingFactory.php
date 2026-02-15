<?php

namespace Database\Factories;

use App\Enums\SettingGroup;
use App\Enums\SettingType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Setting>
 */
class SettingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'key' => fake()->unique()->slug(2),
            'value' => fake()->sentence(),
            'group' => SettingGroup::General,
            'type' => SettingType::Text,
            'description' => fake()->sentence(),
            'options' => null,
            'is_public' => false,
        ];
    }

    /**
     * Indicate a boolean setting.
     */
    public function boolean(bool $value = true): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => SettingType::Boolean,
            'value' => $value ? '1' : '0',
        ]);
    }

    /**
     * Indicate a public setting.
     */
    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => true,
        ]);
    }

    /**
     * Set the group for the setting.
     */
    public function group(SettingGroup $group): static
    {
        return $this->state(fn (array $attributes) => [
            'group' => $group,
        ]);
    }
}
