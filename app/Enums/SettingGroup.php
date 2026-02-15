<?php

namespace App\Enums;

enum SettingGroup: string
{
    case General = 'general';
    case Mail = 'mail';
    case Social = 'social';
    case Seo = 'seo';
    case Billing = 'billing';

    /**
     * Get the human-readable label for the group.
     */
    public function label(): string
    {
        return match ($this) {
            self::General => 'General',
            self::Mail => 'Mail',
            self::Social => 'Social Media',
            self::Seo => 'SEO',
            self::Billing => 'Billing',
        };
    }

    /**
     * Get the description for the group.
     */
    public function description(): string
    {
        return match ($this) {
            self::General => 'Core platform settings like site name, timezone, and maintenance mode.',
            self::Mail => 'Email configuration including sender name and address.',
            self::Social => 'Social media links and integration settings.',
            self::Seo => 'Search engine optimization settings and metadata.',
            self::Billing => 'Billing and payment configuration settings.',
        };
    }
}
