import { Item } from '../SelectMobile';
import { SelectListMobile } from './SelectListMobile';
import { SelectListPc } from './SelectListPc';

export type Props<T> = {
    title?: string;
    className?: string;
    dropDownClassName?: string;
    isMobile?: boolean;
    disabled?: boolean;
    dataSource: Item<T>[];
    onChange: (value: T, item?: any) => void;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    defaultValue?: T;
    value?: T;
    children: React.ReactNode | React.ReactNode[];
    getPopupContainer?: (triggerNode: HTMLElement | null) => HTMLElement | null;
    itemRender?: (value: Item<T>, index: number) => React.ReactNode;
    trigger?: 'mouseenter' | 'click';
};

export default function SelectList<T = any>({ isMobile, ...props }: Props<T>) {
    return (
        <>
            {isMobile ? (
                <SelectListMobile {...props} />
            ) : (
                <SelectListPc {...props} />
            )}
        </>
    );
}
