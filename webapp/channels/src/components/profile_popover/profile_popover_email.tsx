// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from "react";
import { useIntl } from "react-intl";

const COMEDYKIT_BASE_URL = "https://comedykit.be/users";

type Props = {
    email?: string;
    haveOverrideProp?: boolean;
    isBot?: boolean;
    username?: string;
};

const MattermostLogoIcon = () => {
    const { formatMessage } = useIntl();
    return (
        <span
            className="profile-popover-email__comedykit-icon"
            aria-hidden="true"
        >
            <svg
                version="1.0"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 192 192"
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label={formatMessage({
                    id: "generic_icons.mattermost",
                    defaultMessage: "Mattermost Logo",
                })}
                style={{ color: "inherit" }}
            >
                <g
                    transform="translate(0,192) scale(0.1,-0.1)"
                    fill="currentColor"
                    stroke="none"
                >
                    <path d="M830 1910 c-201 -28 -399 -128 -546 -274 -373 -374 -375 -986 -5 -1357 136 -136 341 -241 516 -264 28 -3 62 -9 78 -11 l27 -6 0 271 c0 174 -4 271 -10 271 -5 0 -19 9 -30 20 -16 16 -20 33 -20 86 0 49 -3 65 -12 61 -7 -2 -85 -43 -172 -90 l-159 -86 -50 71 c-27 38 -45 73 -40 78 4 4 127 114 273 245 146 131 272 245 281 252 15 13 27 0 113 -127 53 -78 96 -144 96 -148 0 -4 -20 -18 -45 -31 l-45 -24 0 -133 c0 -121 -2 -136 -20 -154 -11 -11 -24 -20 -30 -20 -6 0 -10 -97 -10 -270 l0 -270 48 6 c227 28 432 132 588 297 362 384 348 969 -33 1338 -135 131 -294 219 -463 255 -86 18 -249 25 -330 14z m555 -499 c152 -70 181 -266 57 -394 -35 -36 -121 -77 -162 -77 -13 0 -51 46 -124 154 -58 85 -106 161 -106 169 0 18 46 87 73 110 68 57 184 74 262 38z" />
                </g>
            </svg>
        </span>
    );
};

const ProfilePopoverEmail = ({
    email,
    haveOverrideProp,
    isBot,
    username,
}: Props) => {
    if (isBot || haveOverrideProp) {
        return null;
    }

    // ComedyKit override: show link to ComedyKit profile when username is available
    if (username) {
        const comedyKitUrl = `${COMEDYKIT_BASE_URL}/${username}`;
        return (
            <div
                title={comedyKitUrl}
                className="user-profile-popover__email"
                style={{ display: "flex", alignItems: "center" }}
            >
                <MattermostLogoIcon />
                <a
                    href={comedyKitUrl}
                    target="_blank"
                    style={{ marginLeft: "8px" }}
                    rel="noopener noreferrer"
                >
                    Bekijk op ComedyKit
                </a>
            </div>
        );
    }

    // Default: email link (only when no ComedyKit username)
    if (!email) {
        return null;
    }

    function handleEmailClick(e: React.MouseEvent<HTMLAnchorElement>) {
        e.preventDefault();
        window.open(`mailto:${email}`);
    }

    return (
        <div title={email} className="user-profile-popover__email">
            <i className="icon icon-email-outline" aria-hidden="true" />
            <a href={`mailto:${email}`} onClick={handleEmailClick}>
                {email}
            </a>
        </div>
    );
};

export default ProfilePopoverEmail;
