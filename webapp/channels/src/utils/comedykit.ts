// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const DEFAULT_COMEDYKIT_URL = 'https://www.comedykit.be';
const APP_ORIGIN_COOKIE = 'ck_app_origin';

type CapacitorWindow = Window & {
    Capacitor?: {
        isNativePlatform?: () => boolean;
    };
};

export function isCapacitorNative(): boolean {
    try {
        return Boolean((window as CapacitorWindow).Capacitor?.isNativePlatform?.());
    } catch {
        return false;
    }
}

function isComedyKitOrigin(origin: string): boolean {
    try {
        const {hostname} = new URL(origin);
        return hostname === 'comedykit.be' || hostname.endsWith('.comedykit.be');
    } catch {
        return false;
    }
}

/**
 * Return URL for leaving Mattermost back to the ComedyKit app/site.
 * On Android Capacitor the app origin is stored in a shared cookie before navigating here.
 */
export function getComedyKitReturnUrl(): string {
    if (typeof document === 'undefined') {
        return DEFAULT_COMEDYKIT_URL;
    }

    const match = document.cookie.match(new RegExp(`(?:^|; )${APP_ORIGIN_COOKIE}=([^;]*)`));
    if (match?.[1]) {
        try {
            const origin = decodeURIComponent(match[1]);
            if (isComedyKitOrigin(origin)) {
                return origin;
            }
        } catch {
            // fall through to default
        }
    }

    return DEFAULT_COMEDYKIT_URL;
}

/**
 * Leave Mattermost and return to ComedyKit.
 * In Capacitor WebView this must be an in-place navigation (no target=_blank).
 */
export function navigateToComedyKit(event?: {preventDefault: () => void}): void {
    event?.preventDefault();
    window.location.assign(getComedyKitReturnUrl());
}
