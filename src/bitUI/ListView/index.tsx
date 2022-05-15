import classNames from 'classnames';
import { useEffect, useRef } from 'react';

import { isEmpty } from './utils';

export type Props = {
    className?: string;
    dataSource: any[];
    onEndReached: () => void;
    onEndReachedThreshold?: number;
    itemRender: (item: any, index: number) => JSX.Element;
    loading: boolean;
    end: boolean;
    scrollRef?: React.MutableRefObject<HTMLDivElement | undefined>;
    disableEndReached?: boolean;
    footerRender?: () => JSX.Element | null;
    emptyRender?: () => JSX.Element | null;
};
export function ListView({
    onEndReachedThreshold,
    itemRender,
    footerRender,
    dataSource,
    onEndReached,
    loading,
    end,
    emptyRender,
    className,
    scrollRef,
    disableEndReached = false,
}: Props) {
    const timeOutRef = useRef<number>();
    const onEndReachedRef = useRef<() => void>();
    onEndReachedThreshold =
        onEndReachedThreshold === undefined ? 10 : onEndReachedThreshold;

    useEffect(() => {
        onEndReachedRef.current = () => {
            onEndReached?.();
        };
    }, [onEndReached]);

    useEffect(() => {
        if (disableEndReached) {
            return;
        }
        const ele = scrollRef?.current;
        const fn = () => {
            if (end || loading) {
                return;
            }
            if (ele) {
                if (
                    ele.scrollHeight - ele.clientHeight <
                    ele.scrollTop + (onEndReachedThreshold as number)
                ) {
                    onEndReachedRef.current?.();
                }
                return;
            }
            if (
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight - (onEndReachedThreshold as number)
            ) {
                onEndReachedRef.current?.();
            }
        };
        clearTimeout(timeOutRef.current);
        timeOutRef.current = setTimeout(() => {
            fn();
        }, 500) as unknown as number;

        if (ele) {
            ele.addEventListener('scroll', fn, { passive: false });
        } else {
            window.addEventListener('scroll', fn, { passive: false });
        }
        return () => {
            if (ele) {
                ele.removeEventListener('scroll', fn);
            } else {
                window.removeEventListener('scroll', fn);
            }
        };
    }, [end, loading, disableEndReached, onEndReachedThreshold, scrollRef]);

    return (
        <>
            <div
                className={classNames('bit-list', className, {
                    'bit-list-view-empty': isEmpty(dataSource),
                })}
            >
                {!isEmpty(dataSource)
                    ? dataSource.map((item, index) => itemRender(item, index))
                    : emptyRender?.()}
                {footerRender?.()}
            </div>
        </>
    );
}
