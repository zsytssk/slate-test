import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useRenderTime = (format = 'YYYY/MM/DD') => {
    return (time: number) => {
        return dayjs(time).format(format);
    };
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const throttle = (fn: Function, threshHold = 250, scope?: any) => {
    let last: number, deferTimer: number;
    return function () {
        const context = scope || this;
        const now = +new Date(),
            // eslint-disable-next-line prefer-rest-params
            args = arguments;
        if (last && now < last + threshHold) {
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function () {
                last = now;
                fn.apply(context, args);
            }, threshHold);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
};

export function useStateId() {
    const [stateId, setStateId] = useState(0);
    const stateIdRef = useRef(stateId);

    const updateFn = useCallback(() => {
        stateIdRef.current += 1;
        setStateId(stateIdRef.current);
    }, []);

    return [stateId, updateFn] as const;
}

export const useClickInside = (
    ref: React.RefObject<any>,
    callback: (e: Event) => void,
    stopPropagation = false,
) => {
    const handleClick = (e: Event) => {
        if (stopPropagation) {
            e.stopPropagation();
        }
        if (ref.current && ref.current.contains(e.target)) {
            callback(e);
        }
    };
    useEffect(() => {
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('click', handleClick);
        };
    });
};

/* hooks */
export const useClickOutside = (
    ref: React.RefObject<any>,
    callback: (e: Event) => void,
) => {
    const handleClick = (e: Event) => {
        if (ref.current && !ref.current.contains(e.target)) {
            callback(e);
        }
    };
    useEffect(() => {
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('click', handleClick);
        };
    });
};

export const useWindowResize = () => {
    const [innerWidth, setInnerWidth] = useState(window.innerWidth);
    const [innerHeight, setInnerHeight] = useState(window.innerHeight);

    useEffect(() => {
        const updateWidthAndHeight = throttle(() => {
            setInnerWidth(window.innerWidth);
            setInnerHeight(window.innerHeight);
        });

        window.addEventListener('resize', updateWidthAndHeight);
        return () => window.removeEventListener('resize', updateWidthAndHeight);
    }, []);

    return { innerWidth, innerHeight };
};

export const useMouseenter = (
    ref: React.RefObject<any>,
    callback: (e: Event) => void,
    stopPropagation = false,
) => {
    const handleClick = (e: Event) => {
        if (stopPropagation) {
            e.stopPropagation();
        }
        if (ref.current && ref.current.contains(e.target)) {
            callback(e);
        }
    };
    useEffect(() => {
        const dom = ref.current;
        dom?.addEventListener('mouseenter', handleClick);
        return () => {
            dom?.removeEventListener('mouseenter', handleClick);
        };
    });
};

export const useMouseleave = (
    ref: React.RefObject<any>,
    callback: (e: Event) => void,
    stopPropagation = false,
) => {
    const handleClick = (e: Event) => {
        if (stopPropagation) {
            e.stopPropagation();
        }
        if (ref.current && ref.current.contains(e.target)) {
            callback(e);
        }
    };
    useEffect(() => {
        const dom = ref.current;
        dom?.addEventListener('mouseleave', handleClick);
        return () => {
            dom?.removeEventListener('mouseleave', handleClick);
        };
    });
};
