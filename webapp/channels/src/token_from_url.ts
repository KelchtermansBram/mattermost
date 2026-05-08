// Pull an auth token from the URL and set it as a cookie early in boot.
// This avoids relying on inline scripts which can be blocked by CSP.

(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        return;
    }

    const parts: string[] = [
        `MMAUTHTOKEN=${encodeURIComponent(token)}`,
        'path=/',
        'samesite=none',
    ];

    // Only set Secure on HTTPS, otherwise browsers will drop the cookie.
    if (window.location.protocol === 'https:') {
        parts.push('secure');
    }

    document.cookie = parts.join('; ');

    // Clean the URL to avoid reusing the token on reload/back/forward.
    window.history.replaceState({}, document.title, window.location.pathname);

    // Reload so Mattermost sees the new cookie.
    window.location.reload();
})();

