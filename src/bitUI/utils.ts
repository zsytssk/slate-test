import { useEffect } from 'react';

export type PlacementPos = {
    top: number;
    left: number;
};
export type Placement = 'top' | 'left' | 'right' | 'bottom';

export function getPlacementPos(
    placement: Placement,
    dom: HTMLElement,
    localDom: HTMLElement,
    offset: number,
) {
    const bounds = dom.getBoundingClientRect();
    const localBounds = localDom.getBoundingClientRect();
    // let { scrollTop, scrollLeft } = document.documentElement;
    const { clientWidth, clientHeight } = document.body;

    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;
    let left = 0;
    let top = 0;

    if (placement === 'right') {
        left = scrollLeft + bounds.left + bounds.width + offset;
        top =
            scrollTop + bounds.top + bounds.height / 2 - localBounds.height / 2;
    } else if (placement === 'top') {
        left =
            scrollLeft + bounds.left + (bounds.width - localBounds.width) / 2;
        top = scrollTop + bounds.top - localBounds.height - offset;
    } else if (placement === 'left') {
        left = scrollLeft + bounds.left - localBounds.width - offset;
        top =
            scrollTop + bounds.top + bounds.height / 2 - localBounds.height / 2;
    } else if (placement === 'bottom') {
        left =
            scrollLeft + bounds.left + (bounds.width - localBounds.width) / 2;
        top = scrollTop + bounds.top + bounds.height + offset;
    }

    if (left < 10) {
        left = 10;
    } else if (left + bounds.width - clientWidth > 10) {
        left = clientWidth - bounds.width - 10;
    }

    if (top < 10) {
        top = 10;
    } else if (top + bounds.height - clientHeight > 10) {
        left = clientHeight - bounds.height - 10;
    }

    return { left, top };
}

let param_map: { [key: string]: string };
export function getParams(key: string) {
    if (!param_map) {
        param_map = {};
        window.location.href.replace(
            /[?&]+([^=&]+)=([^&]*)/gi,
            (m, _key, value) => {
                param_map[_key] = value;
                return value;
            },
        );
    }
    return param_map[key];
    // return true;
}

export const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
