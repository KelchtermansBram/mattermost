// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { useRef } from "react";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import { getLicense } from "mattermost-redux/selectors/entities/general";

import { setProductMenuSwitcherOpen } from "actions/views/product_menu";
import { isSwitcherOpen } from "selectors/views/product_menu";

import {
    OnboardingTaskCategory,
    OnboardingTasksName,
    TaskNameMapToSteps,
    useHandleOnBoardingTaskData,
} from "components/onboarding_tasks";

import { LicenseSkus } from "utils/constants";
import { useCurrentProductId, useProducts } from "utils/products";

import ProductBrandingFreeEdition from "./product_branding_team_edition";
import ProductMenuItem from "./product_menu_item";

import { useClickOutsideRef } from "../../hooks";

export const ProductMenuContainer = styled.nav`
    display: flex;
    align-items: center;
    cursor: pointer;

    > * + * {
        margin-left: 12px;
    }
`;

export const ProductMenuButton = styled.button.attrs(() => ({
    id: "product_switch_menu",
    type: "button",
}))`
    display: flex;
    align-items: center;
    background: transparent;
    border: none;
    border-radius: 4px;
    padding: 3px 6px 3px 5px;

    &:hover,
    &:focus {
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
    const { formatMessage } = useIntl();
    const products = useProducts();
    const dispatch = useDispatch();
    const switcherOpen = useSelector(isSwitcherOpen);
    const menuRef = useRef<HTMLDivElement>(null);
    const currentProductID = useCurrentProductId();
    const license = useSelector(getLicense);

    const handleClick = () =>
        dispatch(setProductMenuSwitcherOpen(!switcherOpen));

    const handleOnBoardingTaskData = useHandleOnBoardingTaskData();

    const visitSystemConsoleTaskName = OnboardingTasksName.VISIT_SYSTEM_CONSOLE;
    const handleVisitConsoleClick = () => {
        const steps = TaskNameMapToSteps[visitSystemConsoleTaskName];
        handleOnBoardingTaskData(visitSystemConsoleTaskName, steps.FINISHED);
        localStorage.setItem(OnboardingTaskCategory, "true");
    };

    useClickOutsideRef(menuRef, () => {
        if (!switcherOpen) {
            return;
        }
        dispatch(setProductMenuSwitcherOpen(false));
    });

    const productItems = products?.map((product) => {
        let tourTip;

        return (
            <ProductMenuItem
                key={product.id}
                destination={product.switcherLinkURL}
                icon={product.switcherIcon}
                text={product.switcherText}
                active={product.id === currentProductID}
                onClick={handleClick}
                tourTip={tourTip}
                id={`product-menu-item-${product.pluginId || product.id}`}
            />
        );
    });

    const isFreeEdition =
        license.IsLicensed === "false" ||
        license.SkuShortName === LicenseSkus.Entry;

    return (
        <div ref={menuRef}>
            <a
                href="https://comedykit.be"
                target="_blank"
                rel="noopener noreferrer"
            >
                <ProductBrandingFreeEdition />
            </a>
        </div>
    );
};

export default ProductMenu;
