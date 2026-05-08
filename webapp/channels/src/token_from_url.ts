// Pull a token from the URL and complete a real web session.
// Using the server login endpoint ensures all required cookies are set:
// MMAUTHTOKEN (HttpOnly), MMUSERID, and MMCSRF.

(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        return;
    }

    const cleanAndReload = () => {
        // Clean the URL to avoid reusing the token on reload/back/forward.
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.reload();
    };

    const cookieAttrs = (() => {
        const parts: string[] = [
            'path=/',
            'samesite=none',
        ];

        // Only set Secure on HTTPS, otherwise browsers will drop the cookie.
        if (window.location.protocol === 'https:') {
            parts.push('secure');
        }
        return parts.join('; ');
    })();

    const inferBase = () => {
        const path = window.location.pathname || '/';
        const markers = [
            '/channels',
            '/admin_console',
            '/signup',
            '/login',
            '/do_login',
            '/mfa',
            '/reset_password',
            '/claim',
            '/oauth',
        ];

        let base = path;
        for (const m of markers) {
            const idx = path.indexOf(m);
            if (idx > 0) {
                base = path.slice(0, idx);
                break;
            }
        }

        base = base.replace(/\/+$/, '');
        return base;
    };

    const base = inferBase();
    const desktopTokenUrl = `${base}/api/v4/users/login/desktop_token`;

    // Try to exchange the token for a proper web session (server will set cookies).
    fetch(desktopTokenUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token}),
        credentials: 'include',
    }).then(async (res) => {
        if (res.ok) {
            cleanAndReload();
            return;
        }

        // Fallback: treat it like a session token cookie.
        // (This won’t create HttpOnly cookies, but can help in some deployments.)
        document.cookie = `MMAUTHTOKEN=${encodeURIComponent(token)}; ${cookieAttrs}`;

        // Best-effort: fetch the current user and set MMUSERID if we can.
        const meRes = await fetch(`${base}/api/v4/users/me`, {credentials: 'include'});
        if (meRes.ok) {
            const me = await meRes.json() as {id?: string};
            if (me?.id) {
                document.cookie = `MMUSERID=${encodeURIComponent(me.id)}; ${cookieAttrs}`;
            }
        }

        cleanAndReload();
    }).catch(() => {
        // Network error; fall back to cookie-only approach.
        document.cookie = `MMAUTHTOKEN=${encodeURIComponent(token)}; ${cookieAttrs}`;
        cleanAndReload();
    });
})();

