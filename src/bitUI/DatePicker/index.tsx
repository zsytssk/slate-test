import { Locale } from 'dayjs/locale/*';
import EnLocale from 'dayjs/locale/en';
import JaLocale from 'dayjs/locale/ja';
import KoLocale from 'dayjs/locale/ko';
import TrLocale from 'dayjs/locale/tr';
import ViLocale from 'dayjs/locale/vi';
import ZhLocale from 'dayjs/locale/zh-cn';
import TwLocale from 'dayjs/locale/zh-tw';
import { useMemo } from 'react';

import MobileDatePicker from './MobileDatePicker';
import PcDatePicker from './PcDatePicker';

export type Props = {
    locale?: Locale;
    tz?: number;
    value?: number;
    isMobile: boolean;
    onChange: (current: number) => void;
    disabledDate?: (current: number) => boolean;
    customRender?: (
        current: number,
        visible: boolean,
    ) => React.ReactNode | React.ReactNode[];
    dropClassName?: string;
    className?: string;
    getPopupContainer?: (triggerNode: HTMLElement | null) => HTMLElement | null;
    title?: string;
    lang?: string;
};

export default function DatePicker({
    className,
    dropClassName,
    isMobile,
    disabledDate,
    onChange,
    value,
    title,
    customRender,
    getPopupContainer,
    tz = 0,
    lang = 'zh-Hans',
}: Props) {
    const locale = useMemo(() => {
        if (lang === 'zh-Hans') {
            return ZhLocale;
        }
        if (lang === 'zh-Hant') {
            return TwLocale;
        }
        if (lang === 'vi') {
            return ViLocale;
        }
        if (lang === 'ko') {
            return KoLocale;
        }
        if (lang === 'ja') {
            return JaLocale;
        }
        if (lang === 'tr') {
            return TrLocale;
        }

        return EnLocale;
    }, [lang]);

    return (
        <>
            {isMobile ? (
                <MobileDatePicker
                    tz={tz}
                    value={value}
                    title={title}
                    dropClassName={dropClassName}
                    className={className}
                    disabledDate={disabledDate}
                    customRender={customRender}
                    onChange={(val: number) => {
                        onChange?.(val);
                    }}
                />
            ) : (
                <PcDatePicker
                    locale={locale}
                    tz={tz}
                    value={value}
                    dropClassName={dropClassName}
                    className={className}
                    disabledDate={disabledDate}
                    customRender={customRender}
                    getPopupContainer={getPopupContainer}
                    onChange={(val: number) => {
                        onChange?.(val);
                    }}
                />
            )}
        </>
    );
}
