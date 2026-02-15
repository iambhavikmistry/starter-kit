<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    /*
    |--------------------------------------------------------------------------
    | OAuth / Social Login
    |--------------------------------------------------------------------------
    |
    | OAuth credentials are managed in Admin → System Settings → Authentication.
    | Config below provides structure only; values are injected at runtime from
    | the database. Do not set these in .env.
    |
    */

    'slack' => [
        'client_id' => null,
        'client_secret' => null,
        'redirect' => null,
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'github' => [
        'client_id' => null,
        'client_secret' => null,
        'redirect' => null,
    ],

    'google' => [
        'client_id' => null,
        'client_secret' => null,
        'redirect' => null,
    ],

    'facebook' => [
        'client_id' => null,
        'client_secret' => null,
        'redirect' => null,
    ],

    'twitter' => [
        'client_id' => null,
        'client_secret' => null,
        'redirect' => null,
        'oauth' => 2,
    ],

    'linkedin' => [
        'client_id' => null,
        'client_secret' => null,
        'redirect' => null,
    ],

    'gitlab' => [
        'client_id' => null,
        'client_secret' => null,
        'redirect' => null,
    ],

    'bitbucket' => [
        'client_id' => null,
        'client_secret' => null,
        'redirect' => null,
    ],

];
