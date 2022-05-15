import classnames from 'classnames';
import React, { useRef, useState } from 'react';

import { Props } from '.';
import SelectMobile from '../SelectMobile';
import { useClickInside } from '../hooks';

export function SelectListMobile<T = any>({
    dataSource,
    onChange,
    onClick,
    value,
    defaultValue,
    children,
    itemRender,
    className,
    dropDownClassName,
    title,
    disabled = false,
}: Props<T>) {
    const [visible, setVisible] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement>(null);

    useClickInside(
        ref,
        (e: any) => {
            onClick?.(e);
            setVisible?.(!visible);
        },
        true,
    );

    return (
        <>
            <div
                className={classnames(className, {
                    'select-open': visible,
                    disabled,
                })}
                ref={ref}
            >
                {children}
            </div>

            {!disabled ? (
                <SelectMobile<T>
                    visible={visible}
                    onClose={() => {
                        setVisible(false);
                    }}
                    data={dataSource}
                    className={dropDownClassName}
                    value={value || defaultValue || ''}
                    title={title as string}
                    onChange={(val, item) => {
                        onChange(val, item);
                    }}
                    itemRender={itemRender}
                />
            ) : null}
        </>
    );
}
