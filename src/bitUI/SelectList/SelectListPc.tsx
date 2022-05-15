import classnames from 'classnames';
import { useEffect, useState } from 'react';

import { Props } from '.';
import Dropdown from '../Dropdown';

import style from './style.module.less';

export function SelectListPc<T>({
    dataSource,
    onChange,
    onClick,
    value,
    defaultValue,
    children,
    itemRender,
    dropDownClassName,
    getPopupContainer,
    className,
    disabled = false,
    trigger,
}: Props<T>) {
    const [visible, setVisible] = useState<boolean>(false);
    const [localValue, setLocalValue] = useState(defaultValue || '');

    const onSelected = (value: T, item?: any) => {
        if (onChange) {
            onChange?.(value, item);
        }
        setVisible(false);
        setLocalValue(value);
    };

    useEffect(() => {
        if (value === undefined) {
            return;
        }

        setLocalValue(value as T);
    }, [value]);

    return (
        <>
            {disabled ? (
                <div
                    className={classnames({
                        'select-open': visible,
                        [className as string]: Boolean(className),
                        disabled,
                    })}
                    onClick={(e) => onClick?.(e)}
                >
                    {children}
                </div>
            ) : (
                <Dropdown
                    getPopupContainer={getPopupContainer}
                    visible={visible}
                    trigger={trigger}
                    onVisibleChange={(visible) => setVisible(visible)}
                    overlay={(ref) => {
                        const width =
                            ref?.current?.getBoundingClientRect()?.width;

                        return (
                            <div
                                className={classnames(
                                    style.selectListPc,
                                    dropDownClassName,
                                )}
                                style={{ width: `${width}px` }}
                            >
                                {dataSource.map((item, index) => {
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                onSelected(item.value, item);
                                            }}
                                            className={classnames({
                                                item: true,
                                                cur:
                                                    item.value ===
                                                    (value || localValue),
                                            })}
                                        >
                                            {itemRender ? (
                                                itemRender(item, index)
                                            ) : (
                                                <div className="inner">
                                                    {item.label}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    }}
                >
                    <div
                        className={classnames({
                            'select-open': visible,
                            [className as string]: Boolean(className),
                        })}
                        onClick={(e) => onClick?.(e)}
                    >
                        {children}
                    </div>
                </Dropdown>
            )}
        </>
    );
}
