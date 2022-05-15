import classnames from 'classnames';
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';

import './index.less';

export type OnAnimationEndStatus = 'entered' | 'exited';
export type OnAnimationEnd = (status: OnAnimationEndStatus) => void;
export type ModalProps = {
    visible?: boolean;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode | React.ReactNode[];
    onCancel?: () => void;
    onAnimationEnd?: OnAnimationEnd;
    domContainer?: HTMLDivElement;
    bodyClass?: string;
    bodyStyle?: React.CSSProperties;
    unScroll?: boolean;
    transClass?: string;
    isDestroy?: boolean;
};

let container: HTMLDivElement;

export default function Modal({
    visible,
    children,
    className,
    onCancel,
    onAnimationEnd,
    bodyStyle,
    bodyClass,
    style,
    transClass,
    isDestroy = true,
}: ModalProps) {
    const [rootStyle, setRootStyle] = useState<CSSProperties>({
        display: visible ? 'block' : 'none',
    });
    const [localVisible, setLocalVisible] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const findWrap = document.querySelector('.bc-modal-wrap') as HTMLDivElement;
    if (findWrap) {
        container = findWrap;
    } else {
        container = document.createElement('div');
        container.classList.add('bc-modal-wrap');
        document.body.appendChild(container);
    }

    useEffect(() => {
        if (visible) {
            // 用来使最近打开的弹出层放在最上面...
            wrapRef.current?.parentElement?.appendChild(wrapRef.current);
            setLocalVisible(true);
        }
    }, [visible]);

    const isIn = useMemo(() => {
        if (visible && localVisible) {
            return true;
        }
        return false;
    }, [visible, localVisible]);

    if (!visible && !localVisible && isDestroy) {
        return null;
    }

    return ReactDOM.createPortal(
        <div
            ref={wrapRef}
            className={classnames('bc-modal-root', className)}
            style={{ ...rootStyle, ...style }}
        >
            <div
                className="bc-modal-mask"
                onClick={(event: any) => {
                    event.preventDefault?.();
                    event.stopPropagation?.();
                    if (visible) {
                        onCancel?.();
                    }
                }}
            ></div>
            <CSSTransition
                in={isIn}
                classNames={transClass || `btg__modal_scale`}
                timeout={300}
                onEnter={() => {
                    setRootStyle({ display: 'block' });
                }}
                onEntered={() => {
                    onAnimationEnd?.('entered');
                }}
                onExited={() => {
                    setLocalVisible(false);
                    onAnimationEnd?.('exited');
                    setRootStyle({ display: 'none' });
                }}
                nodeRef={containerRef}
            >
                <div
                    ref={containerRef}
                    className={classnames('bc-modal-container', bodyClass)}
                    style={{ ...bodyStyle }}
                >
                    {/* <RemoveScroll enabled={!!isIn}>{children}</RemoveScroll> */}
                    {children}
                </div>
            </CSSTransition>
        </div>,
        container,
    );
}
