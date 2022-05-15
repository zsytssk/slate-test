import classNames from 'classnames';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import SVG from 'react-inlinesvg';

import Modal from '..';
import { useUITranslateTpl } from '../../useUITranslate';

import style from './style.module.less';

type CloseType = 'confirm' | 'cancel';
type OnClose = (type: CloseType) => void;

type ShowPromptProps = {
    title?: string | false;
    tip: React.ReactNode;
    hideCancel?: boolean;
    hideConfirm?: boolean;
    confirmText?: string;
    cancelText?: string;
    visible?: boolean;
    onClose?: OnClose;
    closeCountDown?: number;
    className?: string;
};

let div: HTMLDivElement;
let localClose: any;
let closeTid: any;
let state: any, setState: any;

export const showPrompt: (props: ShowPromptProps) => void = (props) => {
    if (!div) {
        div = document.createElement('div');
        document.body.appendChild(div);
        ReactDOM.render(<Prompt {...props} visible={false} />, div);
    }
    setTimeout(() => setState?.({ ...props, visible: true }), 0);
};

export const hidePrompt = () => {
    localClose?.('cancel');
};

export const Prompt = (props: ShowPromptProps) => {
    const tpl = useUITranslateTpl();
    [state, setState] = useState<ShowPromptProps>(props);

    useEffect(() => {
        setState({ ...props });
    }, [props]);

    localClose = (type: CloseType) => {
        state.onClose?.(type);
        setState({ ...state, visible: false });
        closeTid && clearTimeout(closeTid);
    };
    return (
        <Modal
            visible={state.visible}
            className={classNames(style.closeVerify, props.className)}
            onCancel={() => localClose('cancel')}
        >
            <div
                className="close"
                onClick={() => {
                    localClose('cancel');
                }}
            >
                <SVG src={require('../../Icon/close.svg')} />
            </div>
            <div className="header">
                {state.title !== false ? state.title || tpl('tips') : null}
            </div>
            <div className="tip">{state.tip}</div>
            <div className="bottom">
                {state.hideConfirm ? null : (
                    <button
                        onClick={() => {
                            localClose('confirm');
                        }}
                    >
                        {state.confirmText || tpl('confirm')}
                    </button>
                )}

                {state.hideCancel ? null : (
                    <span
                        className="anchor"
                        onClick={() => {
                            localClose('cancel');
                        }}
                    >
                        {state.cancelText || tpl('cancel')}
                    </span>
                )}
            </div>
        </Modal>
    );
};
