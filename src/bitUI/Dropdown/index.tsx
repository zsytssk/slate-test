import classnames from 'classnames';
import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';

import {
    useStateId,
    useClickInside,
    useClickOutside,
    useMouseleave,
    useMouseenter,
    useWindowResize,
} from '../hooks';
import { getPlacementPos, Placement } from '../utils';

import './style.module.less';

type DropdownProps = {
    /** 使用onVisibleChange就不要在本地 setVisible */
    onVisibleChange?: (visible: boolean) => void;
    getPopupContainer?: (triggerNode: HTMLElement | null) => HTMLElement | null;
    visible?: boolean;
    children: React.FunctionComponentElement<any>;
    childRef?: React.RefObject<HTMLDivElement>;
    dropdownRef?: React.RefObject<HTMLDivElement>;
    trigger?: 'mouseenter' | 'click';
} & Omit<DropdownConProps, 'needCalcPos'>;
let wrap: HTMLDivElement;
export default function Dropdown({
    trigger = 'click',
    ...props
}: DropdownProps) {
    const {
        children,
        visible,
        onVisibleChange,
        getPopupContainer,
        childRef,
        dropdownRef,
        ...otherProps
    } = props;
    const newRef = useRef<HTMLDivElement>(null);
    const ref = (children?.ref as React.RefObject<HTMLDivElement>) || newRef;
    const tempRef = useRef<HTMLDivElement>(null);
    const localDropdownRef = dropdownRef || tempRef;
    const child = React.cloneElement(children, { ref });
    const [localVisible, setLocalVisible] = useState(false);

    if (!wrap) {
        const findWrap = document.querySelector(
            '.bit-dropdown-wrap',
        ) as HTMLDivElement;
        if (findWrap) {
            wrap = findWrap;
        } else {
            wrap = document.createElement('div');
            wrap.classList.add('bit-dropdown-wrap');
            document.body.appendChild(wrap);
        }
    }

    useEffect(() => {
        if (visible === undefined) {
            return;
        }
        setLocalVisible(visible);
    }, [visible]);

    useClickInside(
        ref,
        (e: any) => {
            if (trigger !== 'click') {
                return;
            }
            /** getPopupContainer 如果是 ref.current 需要处理 */
            if (localDropdownRef.current?.contains(e.target as Node)) {
                return;
            }
            onVisibleChange?.(!localVisible);
            if (visible === undefined) {
                setLocalVisible(!localVisible);
            }
        },
        true,
    );

    useClickOutside(ref, (e) => {
        if (trigger !== 'click') {
            return;
        }
        if (!localVisible) {
            return;
        }
        if (localDropdownRef.current?.contains(e.target as Node)) {
            return;
        }
        onVisibleChange?.(false);
        if (visible === undefined) {
            setLocalVisible(false);
        }
    });

    useMouseenter(
        ref,
        (e: any) => {
            if (trigger !== 'mouseenter') {
                return;
            }
            /** getPopupContainer 如果是 ref.current 需要处理 */
            onVisibleChange?.(true);
            if (visible === undefined) {
                setLocalVisible(true);
            }
        },
        true,
    );

    useMouseleave(
        ref,
        (e: any) => {
            if (trigger !== 'mouseenter') {
                return;
            }
            /** getPopupContainer 如果是 ref.current 需要处理 */
            onVisibleChange?.(false);
            if (visible === undefined) {
                setLocalVisible(false);
            }
        },
        true,
    );

    useEffect(() => {
        if (localVisible) {
            // 用来使最近打开的弹出层放在最上面...
            localDropdownRef.current?.parentElement?.appendChild(
                localDropdownRef.current,
            );
        }
    }, [localVisible, localDropdownRef]);

    return (
        <>
            {localVisible &&
                ReactDOM.createPortal(
                    <DropdownCon
                        domRef={ref}
                        dropdownRef={localDropdownRef}
                        needCalcPos={!Boolean(getPopupContainer)}
                        {...otherProps}
                    />,
                    getPopupContainer?.(ref.current as HTMLElement) || wrap,
                )}
            {child}
        </>
    );
}

type DropdownConProps = {
    overlay: (
        ref: React.MutableRefObject<HTMLDivElement | null>,
    ) => React.ReactElement<any>;
    placement?: Placement;
    placementDom?: HTMLDivElement;
    offset?: number;
    overlayClassName?: string;
    style?: React.CSSProperties;
    needCalcPos: boolean;
};
type Style = {
    left: number;
    top: number;
};
type DropdownConP = DropdownConProps & {
    domRef: React.MutableRefObject<HTMLDivElement | null>;
    dropdownRef: React.MutableRefObject<HTMLDivElement | null>;
};
function DropdownCon(props: DropdownConP) {
    const {
        needCalcPos,
        domRef,
        overlay,
        placementDom,
        placement,
        offset,
        overlayClassName,
        style: propsStyle,
        dropdownRef,
    } = props;
    const [style, setStyle] = useState({} as Style);

    const { innerWidth } = useWindowResize();
    const [stateId, updateFn] = useStateId();

    useEffect(() => {
        if (!needCalcPos) {
            return;
        }
        const dom = placementDom || domRef.current;
        const place = placement || 'bottom';
        const localDom = dropdownRef.current;
        const localOffset = offset || 10;
        if (!dom || !localDom) {
            return;
        }
        const pos = getPlacementPos(place, dom, localDom, localOffset);

        setStyle({
            ...pos,
        });
    }, [
        stateId,
        innerWidth,
        needCalcPos,
        placementDom,
        domRef,
        placement,
        dropdownRef,
        offset,
    ]);

    useEffect(() => {
        if (!dropdownRef.current) {
            return;
        }
        const observer = new MutationObserver((mutations) => {
            updateFn();
        });
        observer.observe(dropdownRef.current, {
            attributes: true,
            childList: true,
        });
    }, [dropdownRef, updateFn]);

    return (
        <div
            ref={dropdownRef}
            className={classnames('bit-dropdown', overlayClassName)}
            style={{ ...style, ...(propsStyle || {}) }}
        >
            {overlay(domRef)}
        </div>
    );
}
