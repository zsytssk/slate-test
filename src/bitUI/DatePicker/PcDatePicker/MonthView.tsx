import classnames from 'classnames';
import dayjs from 'dayjs';
import { Locale } from 'dayjs/locale/*';
import { useEffect, useMemo, useState } from 'react';

import { daysToWeeksDays } from '../datePickerUtils';
import { dayNow } from './DatePickerPanel';

type Item = {
    day: dayjs.Dayjs;
    inMonth: boolean;
    disable?: boolean;
};

type Props = {
    locale?: Locale;
    month?: dayjs.Dayjs;
    onSelect: (date: dayjs.Dayjs) => void;
    selectDay?: dayjs.Dayjs;
    disabledDate?: (current: number) => boolean;
};

export function MonthView({
    month,
    onSelect,
    selectDay,
    disabledDate,
    locale,
}: Props) {
    const [days, setDays] = useState<Item[]>([]);

    useEffect(() => {
        if (!month) {
            return;
        }
        const all = 42;
        const mStart = month.startOf('month');
        const mEnd = month.endOf('month');
        const mStartWeekDay = mStart.weekday();
        const start = mStart.subtract(mStartWeekDay, 'day');
        const dayArr: Item[] = [];
        for (let i = 0; i < all; i++) {
            const dayItem = start.add(i, 'day');
            const inMonth =
                dayItem.valueOf() >= mStart.valueOf() &&
                dayItem.valueOf() <= mEnd.valueOf();
            dayArr.push({
                day: dayItem,
                inMonth,
                disable: disabledDate?.(dayItem.valueOf()),
            });
        }
        setDays(dayArr);
    }, [month, disabledDate]);

    const weeksDays = useMemo(() => {
        return daysToWeeksDays(days);
    }, [days]);

    const weekdaysMin = dayNow
        .locale(locale?.name || 'en')
        .localeData()
        .weekdaysMin();

    return (
        <div className="inner">
            <div className="top">
                {weekdaysMin.map((item, index) => (
                    <div key={index}>{item}</div>
                ))}
            </div>
            <div className="con">
                {weeksDays.map((weekDays, index) => {
                    return (
                        <div className="line" key={index}>
                            {weekDays.map(
                                ({ day, inMonth, disable }, index) => {
                                    let cur = false;
                                    if (selectDay) {
                                        if (
                                            selectDay.valueOf() -
                                                day.valueOf() <
                                            24 * 60 * 60 * 1000
                                        ) {
                                            cur =
                                                selectDay.format('YYMMDD') ===
                                                day.format('YYMMDD');
                                        }
                                    }
                                    return (
                                        <div
                                            className={classnames({
                                                cell: true,
                                                inView: inMonth,
                                                cur,
                                                disable,
                                            })}
                                            key={index}
                                            title={
                                                disable
                                                    ? ''
                                                    : day.format('YYYY/MM/DD')
                                            }
                                            onClick={(e) => {
                                                if (!disable) {
                                                    onSelect(day);
                                                }
                                            }}
                                        >
                                            <div className="in">
                                                {day.date()}
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
