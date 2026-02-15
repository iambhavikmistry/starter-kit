<?php

namespace Database\Seeders;

use App\Enums\SettingGroup;
use App\Enums\SettingType;
use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->settings() as $setting) {
            Setting::firstOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }

    /**
     * Get the default settings.
     *
     * @return array<int, array{key: string, value: ?string, group: SettingGroup, type: SettingType, description: string, options: ?array<string, string>, is_public: bool}>
     */
    private function settings(): array
    {
        return [
            // General settings
            [
                'key' => 'site_name',
                'value' => config('app.name', 'Laravel'),
                'group' => SettingGroup::General,
                'type' => SettingType::Text,
                'description' => 'The name of the platform displayed across the site.',
                'options' => null,
                'is_public' => true,
            ],
            [
                'key' => 'site_description',
                'value' => 'A powerful platform built with Laravel.',
                'group' => SettingGroup::General,
                'type' => SettingType::Textarea,
                'description' => 'A brief description of the platform.',
                'options' => null,
                'is_public' => true,
            ],
            [
                'key' => 'timezone',
                'value' => config('app.timezone', 'UTC'),
                'group' => SettingGroup::General,
                'type' => SettingType::Select,
                'description' => 'The default timezone for the platform.',
                'options' => [
                    'UTC' => 'UTC',
                    'America/New_York' => 'Eastern Time (US & Canada)',
                    'America/Chicago' => 'Central Time (US & Canada)',
                    'America/Denver' => 'Mountain Time (US & Canada)',
                    'America/Los_Angeles' => 'Pacific Time (US & Canada)',
                    'Europe/London' => 'London',
                    'Europe/Paris' => 'Paris',
                    'Europe/Berlin' => 'Berlin',
                    'Asia/Kolkata' => 'India (Kolkata)',
                    'Asia/Tokyo' => 'Tokyo',
                    'Asia/Shanghai' => 'Shanghai',
                    'Australia/Sydney' => 'Sydney',
                ],
                'is_public' => false,
            ],
            [
                'key' => 'date_format',
                'value' => 'Y-m-d',
                'group' => SettingGroup::General,
                'type' => SettingType::Select,
                'description' => 'The default date format used across the platform.',
                'options' => [
                    'Y-m-d' => '2026-01-15',
                    'd/m/Y' => '15/01/2026',
                    'm/d/Y' => '01/15/2026',
                    'd M Y' => '15 Jan 2026',
                    'M d, Y' => 'Jan 15, 2026',
                    'F j, Y' => 'January 15, 2026',
                ],
                'is_public' => false,
            ],
            [
                'key' => 'maintenance_mode',
                'value' => '0',
                'group' => SettingGroup::General,
                'type' => SettingType::Boolean,
                'description' => 'Enable maintenance mode to restrict access to the platform.',
                'options' => null,
                'is_public' => false,
            ],
            [
                'key' => 'allow_registration',
                'value' => '1',
                'group' => SettingGroup::General,
                'type' => SettingType::Boolean,
                'description' => 'Allow new users to register on the platform.',
                'options' => null,
                'is_public' => true,
            ],

            // Mail settings
            [
                'key' => 'mail_from_name',
                'value' => config('app.name', 'Laravel'),
                'group' => SettingGroup::Mail,
                'type' => SettingType::Text,
                'description' => 'The name used as the sender for outgoing emails.',
                'options' => null,
                'is_public' => false,
            ],
            [
                'key' => 'mail_from_address',
                'value' => 'noreply@example.com',
                'group' => SettingGroup::Mail,
                'type' => SettingType::Text,
                'description' => 'The email address used as the sender for outgoing emails.',
                'options' => null,
                'is_public' => false,
            ],
            [
                'key' => 'mail_footer_text',
                'value' => 'Thank you for using our platform.',
                'group' => SettingGroup::Mail,
                'type' => SettingType::Textarea,
                'description' => 'Text displayed in the footer of all outgoing emails.',
                'options' => null,
                'is_public' => false,
            ],

            // SEO settings
            [
                'key' => 'meta_title',
                'value' => config('app.name', 'Laravel'),
                'group' => SettingGroup::Seo,
                'type' => SettingType::Text,
                'description' => 'Default meta title for the platform.',
                'options' => null,
                'is_public' => true,
            ],
            [
                'key' => 'meta_description',
                'value' => 'A powerful platform built with Laravel.',
                'group' => SettingGroup::Seo,
                'type' => SettingType::Textarea,
                'description' => 'Default meta description for search engines.',
                'options' => null,
                'is_public' => true,
            ],
            [
                'key' => 'meta_keywords',
                'value' => 'laravel, platform',
                'group' => SettingGroup::Seo,
                'type' => SettingType::Text,
                'description' => 'Default meta keywords for search engines (comma-separated).',
                'options' => null,
                'is_public' => true,
            ],

            // Social settings
            [
                'key' => 'social_facebook',
                'value' => '',
                'group' => SettingGroup::Social,
                'type' => SettingType::Text,
                'description' => 'Facebook page URL.',
                'options' => null,
                'is_public' => true,
            ],
            [
                'key' => 'social_twitter',
                'value' => '',
                'group' => SettingGroup::Social,
                'type' => SettingType::Text,
                'description' => 'Twitter/X profile URL.',
                'options' => null,
                'is_public' => true,
            ],
            [
                'key' => 'social_instagram',
                'value' => '',
                'group' => SettingGroup::Social,
                'type' => SettingType::Text,
                'description' => 'Instagram profile URL.',
                'options' => null,
                'is_public' => true,
            ],
            [
                'key' => 'social_linkedin',
                'value' => '',
                'group' => SettingGroup::Social,
                'type' => SettingType::Text,
                'description' => 'LinkedIn page URL.',
                'options' => null,
                'is_public' => true,
            ],

            // Billing settings
            [
                'key' => 'currency',
                'value' => 'USD',
                'group' => SettingGroup::Billing,
                'type' => SettingType::Select,
                'description' => 'Default currency for the platform.',
                'options' => [
                    'USD' => 'US Dollar (USD)',
                    'EUR' => 'Euro (EUR)',
                    'GBP' => 'British Pound (GBP)',
                    'INR' => 'Indian Rupee (INR)',
                    'JPY' => 'Japanese Yen (JPY)',
                    'AUD' => 'Australian Dollar (AUD)',
                    'CAD' => 'Canadian Dollar (CAD)',
                ],
                'is_public' => false,
            ],
            [
                'key' => 'tax_rate',
                'value' => '0',
                'group' => SettingGroup::Billing,
                'type' => SettingType::Number,
                'description' => 'Default tax rate percentage applied to transactions.',
                'options' => null,
                'is_public' => false,
            ],
        ];
    }
}
