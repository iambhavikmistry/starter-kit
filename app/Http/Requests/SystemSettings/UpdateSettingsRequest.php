<?php

namespace App\Http\Requests\SystemSettings;

use App\Enums\SettingType;
use App\Models\Setting;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('settings.update') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'settings' => ['required', 'array'],
        ];

        $settings = Setting::query()->get(['key', 'type']);

        foreach ($settings as $setting) {
            $fieldRules = ['nullable'];

            $fieldRules[] = match ($setting->type) {
                SettingType::Number => 'numeric',
                SettingType::Boolean => 'in:0,1,true,false',
                default => 'string',
            };

            if ($setting->type === SettingType::Text) {
                $fieldRules[] = 'max:255';
            }

            if ($setting->type === SettingType::Textarea) {
                $fieldRules[] = 'max:5000';
            }

            $rules["settings.{$setting->key}"] = $fieldRules;
        }

        return $rules;
    }

    /**
     * Get the custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'settings.required' => 'No settings were provided.',
            'settings.array' => 'Settings must be provided as key-value pairs.',
        ];
    }
}
