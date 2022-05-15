import classnames from 'classnames';
import dayjs from 'dayjs';
import { Locale } from 'dayjs/locale/*';
import localeData from 'dayjs/plugin/localeData';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import React, { useEffect, useState } from 'react';

import { MonthView } from './MonthView';

import style from './style.module.less';

dayjs.extend(localeData);
dayjs.extend(weekday);
// dayjs.extend(timezone);
dayjs.extend(utc);

export type Props = {
    tz?: number;
    locale?: Locale;
    className?: string;
    onChange?: (value: number) => void;
    disabledDate?: (current: number) => boolean;
    value?: number;
};
export let dayNow = dayjs();
export function DatePickerPanel({
    value,
    className,
    disabledDate,
    onChange,
    locale,
    tz,
}: Props) {
    const [month, setMonth] = useState<dayjs.Dayjs>();
    const [selectDay, setSelectDay] = useState<dayjs.Dayjs>();

    useEffect(() => {
        dayNow = dayjs(dayNow).utcOffset(tz);
        if (!value) {
            setMonth(dayNow);
        } else {
            const day = dayjs(value).utcOffset(tz);
            setMonth(day);
            setSelectDay(day);
        }
    }, [value, tz]);

    const preMonth = () => {
        setMonth(month?.subtract(1, 'month'));
    };
    const nextMonth = () => {
        setMonth(month?.add(1, 'month'));
    };
    const preYear = () => {
        setMonth(month?.subtract(1, 'year'));
    };
    const nextYear = () => {
        setMonth(month?.add(1, 'year'));
    };
    const onSelect = (date: dayjs.Dayjs) => {
        setSelectDay(date);
        onChange?.(date.valueOf());
    };

    return (
        <div
            className={classnames(style.datePicker, className)}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <div className="dp-header">
                <div className="supperPreBox" onClick={preYear}>
                    <span className="icon"></span>
                </div>
                <div className="preBox" onClick={preMonth}>
                    <span className="icon"></span>
                </div>
                <div className="inner">
                    {dayjs(month as dayjs.Dayjs)
                        .utcOffset(tz)
                        ?.format('YYYY/MM')}
                </div>
                <div className="nextBox" onClick={nextMonth}>
                    <span className="icon"></span>
                </div>
                <div className="supperNextBox" onClick={nextYear}>
                    <span className="icon"></span>
                </div>
            </div>
            <div className="dp-body">
                <MonthView
                    locale={locale}
                    disabledDate={disabledDate}
                    month={month}
                    onSelect={onSelect}
                    selectDay={selectDay}
                />
            </div>
            <div className="dp-footer">
                <div
                    className="today"
                    onClick={() => onSelect(dayNow.startOf('day'))}
                >
                    {dayNow.format(`YYYY/MM/DD`)}
                </div>
            </div>
        </div>
    );
}
