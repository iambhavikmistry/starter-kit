<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;

class OAuthController extends Controller
{
    private const ALLOWED_PROVIDERS = [
        'facebook',
        'twitter',
        'linkedin',
        'google',
        'github',
        'gitlab',
        'bitbucket',
        'slack',
    ];

    /**
     * Redirect the user to the OAuth provider.
     */
    public function redirect(string $provider): RedirectResponse|SymfonyRedirectResponse
    {
        if (! $this->isAllowedProvider($provider) || ! $this->isProviderEnabled($provider)) {
            abort(404);
        }

        $this->applyProviderConfig($provider);

        $providerKey = Str::lower($provider);
        if (empty(config("services.{$providerKey}.client_id")) || empty(config("services.{$providerKey}.client_secret"))) {
            abort(404);
        }

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Handle the callback from the OAuth provider.
     */
    public function callback(string $provider): RedirectResponse
    {
        if (! $this->isAllowedProvider($provider) || ! $this->isProviderEnabled($provider)) {
            abort(404);
        }

        $this->applyProviderConfig($provider);

        $providerKey = Str::lower($provider);
        if (empty(config("services.{$providerKey}.client_id")) || empty(config("services.{$providerKey}.client_secret"))) {
            abort(404);
        }

        try {
            $oauthUser = Socialite::driver($provider)->user();
        } catch (InvalidStateException) {
            return redirect()->route('login')
                ->with('error', 'Invalid or expired sign-in state. Please try again.');
        }

        if (empty($oauthUser->getEmail())) {
            return redirect()->route('login')
                ->with('error', 'This provider did not return an email address. Please use another sign-in method.');
        }

        $user = User::query()
            ->where('provider', $provider)
            ->where('provider_id', $oauthUser->getId())
            ->first();

        if (! $user) {
            $user = User::query()->where('email', $oauthUser->getEmail())->first();

            if ($user) {
                $user->update([
                    'provider' => $provider,
                    'provider_id' => $oauthUser->getId(),
                    'avatar' => $oauthUser->getAvatar(),
                ]);
            } else {
                $user = User::query()->create([
                    'name' => $oauthUser->getName() ?? $oauthUser->getNickname() ?? Str::before($oauthUser->getEmail(), '@'),
                    'email' => $oauthUser->getEmail(),
                    'email_verified_at' => now(),
                    'password' => null,
                    'avatar' => $oauthUser->getAvatar(),
                    'provider' => $provider,
                    'provider_id' => $oauthUser->getId(),
                ]);
            }
        }

        Auth::login($user, true);

        return redirect()->intended(config('fortify.home'));
    }

    private function isAllowedProvider(string $provider): bool
    {
        return in_array(Str::lower($provider), self::ALLOWED_PROVIDERS, true);
    }

    private function isProviderEnabled(string $provider): bool
    {
        $key = 'auth_'.Str::lower($provider).'_enabled';

        return (bool) Setting::getValue($key, false);
    }

    private function applyProviderConfig(string $provider): void
    {
        $provider = Str::lower($provider);
        $clientId = Setting::getValue("auth_{$provider}_client_id");
        $clientSecret = Setting::getValue("auth_{$provider}_client_secret");
        $redirectUri = Setting::getValue("auth_{$provider}_redirect_uri");

        if ($clientId !== null && $clientId !== '') {
            config(["services.{$provider}.client_id" => $clientId]);
        }
        if ($clientSecret !== null && $clientSecret !== '') {
            config(["services.{$provider}.client_secret" => $clientSecret]);
        }

        $redirect = is_string($redirectUri) && $redirectUri !== ''
            ? $redirectUri
            : route('oauth.callback', ['provider' => $provider]);
        config(["services.{$provider}.redirect" => $redirect]);
    }

    /**
     * Get list of enabled OAuth provider keys for the login/register UI.
     *
     * @return array<int, string>
     */
    public static function enabledProviders(): array
    {
        $providers = [];
        foreach (self::ALLOWED_PROVIDERS as $provider) {
            $enabled = (bool) Setting::getValue("auth_{$provider}_enabled", false);
            if ($enabled) {
                $providers[] = $provider;
            }
        }

        return $providers;
    }

    /**
     * Get the callback URL for a provider (for display in admin).
     */
    public static function getCallbackUrlForProvider(string $provider): string
    {
        $provider = Str::lower($provider);
        if (! in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            return '';
        }
        $redirectUri = Setting::getValue("auth_{$provider}_redirect_uri");

        return is_string($redirectUri) && $redirectUri !== ''
            ? $redirectUri
            : route('oauth.callback', ['provider' => $provider]);
    }
}
