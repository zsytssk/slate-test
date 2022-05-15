import classnames from 'classnames';
import React, { useState, useContext, useEffect } from 'react';

import { GroupContext } from './CheckboxGroup';

import './style.module.less';

type Props = {
    children?: React.ReactNode;
    hideLabel?: boolean;
    checked?: boolean;
    value?: any;
    indeterminate?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    labelPos?: 'left' | 'right';
    onChange?: (checked: boolean) => void;
};

const defaultProps = {
    labelPos: 'right',
    hideLabel: false,
};

export function Checkbox(props: Props) {
    const {
        children,
        hideLabel,
        labelPos,
        onChange,
        checked,
        indeterminate,
        defaultChecked,
        value,
        disabled,
    } = {
        ...defaultProps,
        ...props,
    };
    const [localChecked, setLocalChecked] = useState<boolean>(
        Boolean(defaultChecked),
    );
    const context = useContext(GroupContext);

    const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        setLocalChecked(input.checked);
        onChange?.(input.checked);
        context?.toggleOption({ label: children as string, value });
    };

    useEffect(() => {
        context?.registerValue(value);
        return () => {
            context?.cancelValue(value);
        };
    }, [value, context]);

    let isChecked = false;
    if (checked === undefined && localChecked) {
        isChecked = true;
    } else if (checked) {
        isChecked = true;
    }
    if (context?.value?.current) {
        isChecked = context?.value?.current?.indexOf(value) !== -1;
    }
    const isDisabled = disabled || context?.disabled;

    return (
        <label className="bit-checkbox-wrapper">
            {!hideLabel && labelPos === 'left' && (
                <span className="bit-checkbox-label bit-checkbox-left">
                    {children}
                </span>
            )}
            <span
                className={classnames({
                    'bit-checkbox': true,
                    'bit-checkbox-checked': isChecked,
                    'bit-checkbox-indeterminate': indeterminate,
                })}
            >
                <input
                    type="checkbox"
                    className="bit-checkbox-input"
                    onChange={onInputChange}
                    checked={isChecked}
                    disabled={isDisabled}
                />
                <span className="bit-checkbox-inner"></span>
            </span>
            {!hideLabel && labelPos === 'right' && (
                <span className="bit-checkbox-label bit-checkbox-right">
                    {children}
                </span>
            )}
        </label>
    );
}
