import classnames from 'classnames';
import dayjs from 'dayjs';
import { useCallback, useRef, useState } from 'react';

import { Props } from '../';
import Dropdown from '../../Dropdown';
import { useClickOutside } from '../../hooks';
import { DatePickerPanel } from './DatePickerPanel';

export default function PcDatePicker({
    tz,
    locale,
    dropClassName,
    className,
    disabledDate,
    onChange,
    customRender,
    getPopupContainer,
    value,
}: Omit<Props, 'isMobile' | 'title'>) {
    const ref = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    const localHide = useCallback(() => {
        setVisible?.(false);
    }, []);

    useClickOutside(ref, (e) => {
        if (!visible) {
            return;
        }
        if (dropdownRef.current?.contains(e.target as Node)) {
            return;
        }
        localHide();
    });

    return (
        <Dropdown
            visible={visible}
            getPopupContainer={getPopupContainer}
            overlayClassName={classnames(dropClassName)}
            overlay={() => {
                return (
                    <div ref={dropdownRef}>
                        <DatePickerPanel
                            tz={tz}
                            locale={locale}
                            value={value}
                            disabledDate={disabledDate}
                            onChange={(val: number) => {
                                onChange?.(val);
                                localHide();
                            }}
                        />
                    </div>
                );
            }}
        >
            <div
                className={classnames({
                    [className as string]: Boolean(className),
                    'date-focused': Boolean(visible),
                })}
                ref={ref}
                onClick={() => setVisible(!visible)}
            >
                {customRender ? (
                    customRender(value as number, visible)
                ) : (
                    <input
                        type="text"
                        value={
                            value
                                ? dayjs(value)
                                      .utcOffset(tz)
                                      .format('YYYY/MM/DD')
                                : ''
                        }
                        readOnly
                    />
                )}
            </div>
        </Dropdown>
    );
}
