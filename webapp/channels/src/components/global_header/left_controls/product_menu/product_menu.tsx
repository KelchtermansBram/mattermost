// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { useRef } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { isFreeEdition as isFreeEditionSelector } from 'mattermost-redux/selectors/entities/general';
import { getCurrentTeam } from 'mattermost-redux/selectors/entities/teams';

import { setProductMenuSwitcherOpen } from 'actions/views/product_menu';
import { isSwitcherOpen } from 'selectors/views/product_menu';

import {
    OnboardingTaskCategory,
    OnboardingTasksName,
    TaskNameMapToSteps,
    useHandleOnBoardingTaskData,
} from 'components/onboarding_tasks';

import { getComedyKitReturnUrl, isCapacitorNative, navigateToComedyKit } from 'utils/comedykit';
import { getProductSwitcherLinkURL, useCurrentProductId, useProducts } from 'utils/products';

import type { GlobalState } from 'types/store';

import ProductBrandingFreeEdition from './product_branding_team_edition';
import ProductMenuItem from './product_menu_item';

import { useClickOutsideRef } from '../../hooks';

export const ProductMenuContainer = styled.nav`
    display: flex;
    align-items: center;
    cursor: pointer;

    > * + * {
        margin-left: 12px;
    }
`;

export const ProductMenuButton = styled.button.attrs(() => ({
    id: 'product_switch_menu',
    type: 'button',
}))`
    display: flex;
    align-items: center;
    background: transparent;
    border: none;
    border-radius: 4px;
    padding: 3px 6px 3px 5px;

    &:hover, &:focus {
        color: rgba(var(--sidebar-text-rgb), 0.56);
        background-color: rgba(var(--sidebar-text-rgb), 0.08);
    }

    &:active {
        color: rgba(var(--sidebar-text-rgb), 0.56);
        background-color: rgba(var(--sidebar-text-rgb), 0.16);
    }

    > * + * {
        margin-left: 8px;
    }
`;

const ProductMenu = (): JSX.Element => {
    const {formatMessage} = useIntl();
    const products = useProducts();
    const dispatch = useDispatch();
    const switcherOpen = useSelector(isSwitcherOpen);
    const menuRef = useRef<HTMLDivElement>(null);
    const currentProductID = useCurrentProductId();
    const currentTeam = useSelector(getCurrentTeam);
    const isFreeEdition = useSelector(isFreeEditionSelector);
    const visibleSwitcherItems = useSelector(
        (state: GlobalState) => {
            if (!isSwitcherOpen(state)) {
                return [];
            }
            return (state.plugins.components.ProductSwitcherMenuItem ?? []).filter((item) => {
                if (item.isHidden === undefined) {
                    return true;
                }
                try {
                    return !item.isHidden(state);
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error(`ProductSwitcherMenuItem ${item.pluginId}:${item.id} isHidden threw`, e);

                    // Fail closed: hide the item if its predicate throws.
                    return false;
                }
            });
        },
        shallowEqual,
    );

    const handleClick = () => dispatch(setProductMenuSwitcherOpen(!switcherOpen));

    const handleOnBoardingTaskData = useHandleOnBoardingTaskData();

    const visitSystemConsoleTaskName = OnboardingTasksName.VISIT_SYSTEM_CONSOLE;
    const handleVisitConsoleClick = () => {
        const steps = TaskNameMapToSteps[visitSystemConsoleTaskName];
        handleOnBoardingTaskData(visitSystemConsoleTaskName, steps.FINISHED);
        localStorage.setItem(OnboardingTaskCategory, 'true');
    };

    useClickOutsideRef(menuRef, () => {
        if (!switcherOpen) {
            return;
        }
        dispatch(setProductMenuSwitcherOpen(false));
    });

    const productItems = products?.map((product) => {
        let tourTip;

        const destination = getProductSwitcherLinkURL(product, currentTeam?.name);

        if (destination === null) {
            return null;
        }

        return (
            <ProductMenuItem
                key={product.id}
                destination={destination}
                icon={product.switcherIcon}
                text={product.switcherText}
                active={product.id === currentProductID}
                onClick={handleClick}
                tourTip={tourTip}
                id={`product-menu-item-${product.pluginId || product.id}`}
            />
        );
    });

    const comedyKitUrl = getComedyKitReturnUrl();
    const openInPlace = isCapacitorNative();

    return (
        <div ref={menuRef}>
            <a
                href={comedyKitUrl}
                {...(openInPlace
                    ? {onClick: navigateToComedyKit}
                    : {target: '_blank', rel: 'noopener noreferrer'})}
            >
                <ProductBrandingFreeEdition/>
            </a>
        </div>
    );
};

export default ProductMenu;
