import classnames from 'classnames';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import SVG from 'react-inlinesvg';

import Modal from '../Modal';
import { useUITranslateTpl } from '../useUITranslate';
import { selectMobilePxToRem } from './utils';

import closeIcon from './close.svg';
import style from './style.module.less';

export type Item<T> = {
    label: string | number;
    value: T;
};
export type Props<T> = {
    visible: boolean;
    onClose: () => void;
    onChange?: (value: T, item?: any) => void;
    onMultiUpdate?: (value: T, index: number, item?: any) => void;
    onMultiChange?: (value: T[], item?: any) => void;
    value?: any;
    data?: Item<T>[];
    mulValue?: T[];
    mulData?: Item<T>[][];
    title: string;
    confirmTxt?: string;
    isEqual?: (value: T, item: T) => boolean;
    itemRender?: (value: Item<T>, index?: number) => React.ReactNode;
    bottomRender?: (onConfirm: () => void) => React.ReactNode;
    className?: string;
};

export default function SelectMobile<T>({
    visible,
    onClose,
    itemRender,
    value,
    data,
    onChange,
    onMultiUpdate,
    onMultiChange,
    title,
    confirmTxt,
    mulData,
    mulValue,
    isEqual,
    className,
    bottomRender,
}: Props<T>) {
    const tpl = useUITranslateTpl();
    confirmTxt = confirmTxt || tpl('confirm');

    const [localValue, setLocalValue] = useState<T>();
    const [localMultiValue, setLocalMulValue] = useState<T[]>([]);
    const [localItem, setLocalItem] = useState(null);

    const onCloseRef = useRef<typeof onClose>();
    const onChangeRef = useRef<typeof onChange>();
    const onMultiUpdateRef = useRef<typeof onMultiUpdate>();
    const onMultiChangeRef = useRef<typeof onMultiChange>();

    useEffect(() => {
        onCloseRef.current = onClose;
        onChangeRef.current = onChange;
        onMultiChangeRef.current = onMultiChange;
        onMultiUpdateRef.current = onMultiUpdate;
    }, [onClose, onChange, onMultiUpdate, onMultiChange]);

    useEffect(() => {
        setLocalMulValue([...(mulValue || [])]);
    }, [mulValue]);

    const setMultiUpdate = useCallback(
        (val: T, index: number, item: any) => {
            if (onMultiUpdateRef.current) {
                onMultiUpdateRef.current(val, index, item);
            } else {
                localMultiValue[index] = val;
                setLocalMulValue([...localMultiValue]);
            }
        },
        [localMultiValue],
    );

    const setLocalValueUpdate = useCallback((val: T, item: any) => {
        setLocalValue(val);
        setLocalItem(item);
    }, []);

    const isMulti = Boolean(mulData);
    const onConfirm = useCallback(() => {
        onCloseRef.current?.();
        if (isMulti) {
            onMultiChangeRef.current?.([...localMultiValue]);
        } else {
            onChangeRef.current?.(localValue as T, localItem);
        }
    }, [isMulti, localValue, localItem, localMultiValue]);

    useEffect(() => {
        if (isMulti) {
            setLocalMulValue([...(mulValue as T[])]);
        } else {
            setLocalValue(value);
        }
    }, [isMulti, value, mulValue]);

    if (!data?.length && !mulData?.length) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            onCancel={onClose}
            className={style.selectModalWrap}
            transClass="bottom_slide_up"
        >
            <div
                className={classnames({
                    selectModal: true,
                    show: visible,
                    [className as string]: Boolean(className),
                })}
            >
                <div className="header">
                    <div className="title">{title}</div>
                    <div className="cancel" onClick={onClose}>
                        <SVG src={closeIcon} />
                    </div>
                </div>
                <div className="panel">
                    <div className="fixWidth">
                        <div className="wheels">
                            {mulData ? (
                                mulData.map((item, index) => {
                                    return (
                                        <div className="wheel" key={index}>
                                            <List
                                                visible={visible}
                                                isEqual={isEqual}
                                                itemRender={itemRender}
                                                value={mulValue?.[index]}
                                                data={item}
                                                onChange={(value, _item) => {
                                                    setMultiUpdate(
                                                        value,
                                                        index,
                                                        _item,
                                                    );
                                                }}
                                            />
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="wheel">
                                    <List
                                        visible={visible}
                                        itemRender={itemRender}
                                        value={value}
                                        data={data}
                                        isEqual={isEqual}
                                        onChange={(value, item) => {
                                            setLocalValueUpdate(value, item);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="selectLine"></div>
                        <div className="shadowMask"></div>
                    </div>
                </div>
                {bottomRender ? (
                    bottomRender(onConfirm)
                ) : (
                    <div className="confirmBox" onClick={onConfirm}>
                        <div className="btnConfirm">{confirmTxt}</div>
                    </div>
                )}
            </div>
        </Modal>
    );
}

type ListProps<T> = {
    test?: boolean;
    visible?: boolean;
    value?: T;
    data?: Item<T>[];
    onChange: Props<T>['onChange'];
    itemRender?: Props<T>['itemRender'];
    isEqual?: (value: T, item: T) => boolean;
};
type Pos = {
    x: number;
    y: number;
};
type Status = 'normal' | 'start' | 'move' | 'end';
function List<T>({
    test,
    value,
    data,
    onChange,
    itemRender,
    isEqual,
    visible,
}: ListProps<T>) {
    const [curIndex, setCurIndex] = useState(-1);
    const ref = useRef<HTMLUListElement>(null);
    const onChangeRef = useRef<(index: number) => void>();

    useEffect(() => {
        onChangeRef.current = (_index: number) => {
            if (!data?.length) {
                return;
            }
            onChange?.(data[_index].value, data[_index]);
        };
    }, [onChange, data]);

    const index = useMemo(() => {
        const calcIndex = data?.findIndex((item) => {
            if (isEqual) {
                return isEqual(item.value, value as T);
            } else {
                return item.value === value;
            }
        });

        const new_index = calcIndex === -1 ? 0 : calcIndex;
        setCurIndex(new_index as number);
        return new_index;
    }, [value, data]);

    useEffect(() => {
        if (!visible) {
            return;
        }
        const dom = ref.current;

        let endMove = 0;
        let status: Status = 'normal';
        let dist = 0;
        let lastPos = {} as Pos;

        if (!dom || !data?.length) {
            return;
        }

        const moveDom = (n: number, ani = false) => {
            if (ani) {
                dom.classList.add('ani');
                dom.addEventListener(
                    'animationend',
                    () => {
                        dom.classList.remove('ani');
                    },
                    false,
                );
            }
            const val = selectMobilePxToRem(n);
            dom.setAttribute('style', `transform: translateY(${val})`);
        };
        const start = (e: TouchEvent | MouseEvent) => {
            e.preventDefault();
            const pos = getEventPosInDom(e);
            lastPos = pos;
            status = 'start';
        };
        const move = (e: TouchEvent | MouseEvent) => {
            if (status !== 'start' && status !== 'move') {
                return;
            }
            e.preventDefault();
            status = 'move';
            const newPos = getEventPosInDom(e);
            const distPos = {
                x: newPos.x - lastPos.x,
                y: newPos.y - lastPos.y,
            };
            lastPos = newPos;
            if (Math.abs(distPos.x) > Math.abs(distPos.y)) {
                return;
            }
            let nextDist = dist + distPos.y;
            if (isOut(nextDist + endMove)) {
                nextDist = dist + distPos.y / 3;
            }
            dist = nextDist;
            moveDom(nextDist + endMove);
        };

        const end = () => {
            if (status !== 'move') {
                return;
            }
            calcCurIndex(dist + endMove);
            status = 'end';
            dist = 0;
            lastPos = {} as Pos;
        };

        const isOut = (move = 0) => {
            const parentHeight =
                dom.parentElement?.getBoundingClientRect()?.height;
            if (!parentHeight) {
                return false;
            }

            const itemHeight = dom.children[0]?.getBoundingClientRect()?.height;
            const len = dom.children.length;
            const middle = parentHeight / 2;

            let min: number;
            let newIndex = 0;
            for (let i = 0; i < len; i++) {
                const itemMiddle = i * itemHeight + itemHeight / 2 + move;
                const itemSpace = Math.abs(itemMiddle - middle);
                if (min === undefined || min > itemSpace) {
                    min = itemSpace;
                    newIndex = i;
                }
            }

            if (newIndex === 0 && min > itemHeight / 2) {
                return true;
            }
            if (newIndex === len - 1 && min > itemHeight / 2) {
                return true;
            }
            return false;
        };

        const calcCurIndex = (move = 0) => {
            const parentHeight =
                dom.parentElement?.getBoundingClientRect()?.height;
            const itemHeight = dom.children[0]?.getBoundingClientRect()?.height;
            const middle = parentHeight / 2;

            let min: number;
            let newIndex = 0;
            for (let i = 0; i < dom.children.length; i++) {
                const itemMiddle = i * itemHeight + itemHeight / 2 + move;
                const itemSpace = Math.abs(itemMiddle - middle);
                if (min === undefined || min > itemSpace) {
                    min = itemSpace;
                    newIndex = i;
                }
            }
            setCurIndex(newIndex);
            moveToIndex(newIndex, true);
        };

        const moveToIndex = (index: number, ani = false) => {
            const parentHeight =
                dom.parentElement?.getBoundingClientRect()?.height;
            const itemHeight = dom.children[0]?.getBoundingClientRect()?.height;
            const middle = parentHeight / 2;
            endMove = middle - (index * itemHeight + itemHeight / 2);

            /** 初始化时改动不需要触发改变事件 */
            if (ani) {
                onChangeRef.current?.(index);
            }
            moveDom(endMove, ani);
        };

        dom.addEventListener('touchstart', start, { passive: false });
        dom.addEventListener('mousedown', start, { passive: false });
        document.body.addEventListener('touchmove', move, { passive: false });
        document.body.addEventListener('mousemove', move, { passive: false });
        document.body.addEventListener('touchend', end, { passive: false });
        document.body.addEventListener('mouseup', end, { passive: false });
        document.body.addEventListener('touchcancel', end, { passive: false });

        setTimeout(() => {
            moveToIndex(index as number);
        });
        return () => {
            dom.removeEventListener('touchstart', start);
            dom.removeEventListener('mousedown', start);
            document.body.removeEventListener('touchmove', move);
            document.body.removeEventListener('mousemove', move);
            document.body.removeEventListener('mouseup', end);
            document.body.removeEventListener('touchend', end);
            document.body.removeEventListener('touchcancel', end);
        };
    }, [index, data, visible]);

    if (!data?.length || !visible) {
        return null;
    }

    return (
        <ul ref={ref}>
            {data?.map((item, _index) => {
                return (
                    <li
                        key={_index}
                        className={classnames('item', {
                            cur: curIndex === _index,
                            selected: index === _index,
                        })}
                    >
                        {itemRender ? (
                            itemRender(item, _index)
                        ) : (
                            <div className="inner">{item.label}</div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}

function getEventPosInDom(event: TouchEvent | MouseEvent): {
    x: number;
    y: number;
} {
    const myLocation =
        (event as TouchEvent)?.changedTouches?.[0] || (event as MouseEvent);
    return {
        x: myLocation.clientX,
        y: myLocation.clientY,
    };
}
