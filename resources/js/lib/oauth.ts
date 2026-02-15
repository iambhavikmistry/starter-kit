const OAUTH_PROVIDER_LABELS: Record<string, string> = {
    facebook: 'Facebook',
    twitter: 'Twitter / X',
    linkedin: 'LinkedIn',
    google: 'Google',
    github: 'GitHub',
    gitlab: 'GitLab',
    bitbucket: 'Bitbucket',
    slack: 'Slack',
};

export function getOAuthProviderLabel(provider: string): string {
    return OAUTH_PROVIDER_LABELS[provider.toLowerCase()] ?? provider;
}
