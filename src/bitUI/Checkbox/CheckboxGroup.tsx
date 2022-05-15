import React, { useState, useRef, useEffect } from 'react';

type ToggleVal = {
    label: string;
    value: any;
};
export interface CheckboxGroupContext {
    value?: any;
    disabled?: boolean;
    toggleOption: (value: ToggleVal) => void;
    registerValue: (value: any) => void;
    cancelValue: (value: any) => void;
}

export const GroupContext = React.createContext<CheckboxGroupContext | null>(
    null,
);
type CheckboxGroupProps<T = any> = {
    defaultValue?: T[];
    value?: T[];
    onChange?: (value: T[]) => void;
    disabled?: boolean;
    children: React.ReactNode | React.ReactNode[];
};

export function CheckboxGroup(props: CheckboxGroupProps) {
    const { children, disabled, defaultValue, value, onChange } = props;
    const groupValue = useRef(defaultValue || []);
    const registeredValues = useRef(defaultValue || []);
    /** 数据使用ref记录，改变时索引不会改变，用下面这个来记录状态改变 */
    const [stateIndex, setStateIndex] = useState(0);

    const toggleOption = (info: ToggleVal) => {
        const { value, label } = info;
        const index = groupValue.current.indexOf(value);
        let new_value: any[];
        if (index === -1) {
            new_value = [...groupValue.current, value];
        } else {
            groupValue.current.splice(index, 1);
            new_value = [...groupValue.current];
        }
        groupValue.current = [...new_value];
        onChange?.(new_value);

        setStateIndex(stateIndex + 1);
    };

    const registerValue = (value: string) => {
        registeredValues.current.push(value);
    };

    const cancelValue = (value: string) => {
        registeredValues.current = registeredValues.current.filter((_value) => {
            return _value !== value;
        });
    };

    useEffect(() => {
        groupValue.current = value || [];
        setStateIndex(stateIndex + 1);
    }, [value, stateIndex]);

    const context = {
        value: groupValue,
        disabled,
        toggleOption,
        registerValue,
        cancelValue,
    };

    return (
        <GroupContext.Provider value={context}>
            {children}
        </GroupContext.Provider>
    );
}
