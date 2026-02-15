<?php

use App\Models\Setting;
use Database\Seeders\SettingSeeder;
use Laravel\Socialite\Two\InvalidStateException;

beforeEach(function () {
    $this->seed(SettingSeeder::class);
});

test('oauth redirect returns 404 when provider is disabled', function () {
    $response = $this->get(route('oauth.redirect', ['provider' => 'github']));

    $response->assertNotFound();
});

test('oauth redirect returns 404 when provider is enabled but credentials are not configured', function () {
    Setting::setValue('auth_github_enabled', true);
    Setting::setValue('auth_github_client_id', '');
    Setting::setValue('auth_github_client_secret', '');

    $response = $this->get(route('oauth.redirect', ['provider' => 'github']));

    $response->assertNotFound();
});

test('oauth redirect returns 404 for invalid provider', function () {
    $response = $this->get(route('oauth.redirect', ['provider' => 'invalid']));

    $response->assertNotFound();
});

test('oauth redirect redirects to provider when enabled and configured', function () {
    Setting::setValue('auth_github_enabled', true);
    Setting::setValue('auth_github_client_id', 'test-client-id');
    Setting::setValue('auth_github_client_secret', 'test-client-secret');

    $response = $this->get(route('oauth.redirect', ['provider' => 'github']));

    $response->assertRedirect();
    expect($response->headers->get('Location'))->toContain('github.com');
});

test('login page receives oauth providers list', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('oauthProviders')
        ->where('oauthProviders', [])
    );
});

test('login page shows enabled oauth providers', function () {
    Setting::setValue('auth_github_enabled', true);

    $response = $this->get(route('login'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('oauthProviders', ['github'])
    );
});

test('oauth redirect works for slack when enabled and configured', function () {
    Setting::setValue('auth_slack_enabled', true);
    Setting::setValue('auth_slack_client_id', 'test-client-id');
    Setting::setValue('auth_slack_client_secret', 'test-client-secret');

    $response = $this->get(route('oauth.redirect', ['provider' => 'slack']));

    $response->assertRedirect();
    expect($response->headers->get('Location'))->toContain('slack.com');
});

test('oauth callback redirects to login with error when state is invalid', function () {
    Setting::setValue('auth_github_enabled', true);
    Setting::setValue('auth_github_client_id', 'test-client-id');
    Setting::setValue('auth_github_client_secret', 'test-client-secret');

    $socialite = $this->mock(\Laravel\Socialite\Contracts\Factory::class);
    $driver = $this->mock(\Laravel\Socialite\Contracts\Provider::class);
    $socialite->shouldReceive('driver')->with('github')->andReturn($driver);
    $driver->shouldReceive('user')->andThrow(new InvalidStateException);

    $response = $this->get(route('oauth.callback', ['provider' => 'github']));

    $response->assertRedirect(route('login'));
    $response->assertSessionHas('error');
});
