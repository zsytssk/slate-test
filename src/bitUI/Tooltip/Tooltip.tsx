import classnames from 'classnames';
import { useEffect, useState, useRef } from 'react';
import React from 'react';
import ReactDOM from 'react-dom';

import { useClickInside, useClickOutside } from '../hooks';
import { getPlacementPos, Placement } from '../utils';

import './Tooltip.module.less';

type TooltipProps = {
    trigger?: 'click';
    children: React.FunctionComponentElement<any>;
    className?: string;
} & TooltipConProps;

let wrap: HTMLDivElement;
export function Tooltip(props: TooltipProps) {
    const { children, trigger, visible: propVisible, ...otherProps } = props;
    const newRef = useRef<HTMLDivElement>(null);
    const ref =
        (children?.ref as React.MutableRefObject<HTMLDivElement>) || newRef;
    const tipRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    if (!wrap) {
        const findWrap = document.querySelector(
            '.bit-tooltip-wrap',
        ) as HTMLDivElement;
        if (findWrap) {
            wrap = findWrap;
        } else {
            wrap = document.createElement('div');
            wrap.classList.add('bit-tooltip-wrap');
            document.body.appendChild(wrap);
        }
    }

    const child = React.cloneElement(children, { ref });

    useEffect(() => {
        if (propVisible === undefined) {
            return;
        }
        setVisible(propVisible);
    }, [propVisible]);

    useClickInside(
        ref,
        (e: any) => {
            if (typeof propVisible === 'boolean') {
                return;
            }
            setVisible(!visible);
        },
        true,
    );

    useClickOutside(ref, (e: any) => {
        if (typeof propVisible === 'boolean') {
            return;
        }
        if (tipRef.current?.contains(e.target)) {
            return;
        }
        setVisible(false);
    });

    return (
        <>
            {ReactDOM.createPortal(
                <TooltipCon
                    visible={visible}
                    {...otherProps}
                    domRef={ref}
                    tipRef={tipRef}
                />,
                wrap,
            )}
            {child}
        </>
    );
}

export type TooltipConProps = {
    title: React.ReactNode | string;
    visible?: boolean;
    position?: Placement;
    className?: string;
    tipRef?: React.MutableRefObject<HTMLDivElement | null>;
};
type Style = {
    left: number;
    top: number;
};
function TooltipCon({
    title,
    domRef,
    visible,
    className,
    position = 'top',
    tipRef,
}: TooltipConProps & { domRef: React.MutableRefObject<HTMLElement> }) {
    const [style, setStyle] = useState({} as Style);

    position = position || 'top';

    useEffect(() => {
        const fn = () => {
            const dom = domRef.current;
            const localDom = tipRef?.current;
            if (!dom || !localDom) {
                return;
            }
            const pos = getPlacementPos(position, dom, localDom, 10);

            setStyle({
                ...pos,
            });
        };

        fn();

        if (window.MutationObserver && tipRef?.current) {
            const config = { attributes: true, childList: true, subtree: true };
            const observer = new MutationObserver(fn);

            observer.observe(tipRef.current, config);
            return () => {
                observer.disconnect();
            };
        }
    }, [visible, position, domRef, tipRef]);

    if (!visible) {
        return null;
    }

    return (
        <div
            className={classnames('bit-tooltip', position, className)}
            ref={tipRef}
            style={{ ...style }}
        >
            <div className="bit-tooltip-content">
                <div className="bit-tooltip-arrow"></div>
                <div className="bit-tooltip-inner">
                    <span>{title}</span>
                </div>
            </div>
        </div>
    );
}
