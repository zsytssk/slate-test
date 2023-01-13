import classNames from 'classnames';
import React, {
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Descendant, Transforms, createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';

import { useDebounce } from './hooks';
import styles from './index.module.less';
import {
    Element,
    getEditorString,
    insertMention,
    strToEditorValue,
    withMentions,
    withTextLimit,
} from './utils';

export type CustomTextareaCtrlRef = {
    insertTag: (text: string) => void;
};
type Props = {
    disabled?: boolean;
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    maxLength?: number;
    ctrlRef?: React.MutableRefObject<CustomTextareaCtrlRef | undefined>;
};

export function CustomTextarea({
    disabled,
    value,
    onChange,
    className,
    placeholder,
    maxLength = 200,
    ctrlRef,
}: Props) {
    const [stateId, setStateId] = useState(0);
    const [editorValue, setEditorValue] = useState<Descendant[]>([
        {
            // @ts-ignore
            type: 'paragraph',
            children: [{ text: '' }],
        },
    ]);
    const textRef = useRef('');
    const editor = useMemo(
        () =>
            withReact(
                withHistory(
                    withTextLimit(maxLength)(
                        withMentions(createEditor()),
                    ) as ReactEditor,
                ),
            ),
        [maxLength],
    );
    const renderElement = useCallback(
        (props: any) => <Element {...props} />,
        [],
    );

    const onPaste = useCallback(
        (event: any) => {
            const curStr = getEditorString(editor);
            const str = event.clipboardData.getData('text');

            if (str.length + curStr.length > maxLength) {
                event.preventDefault();
            }
        },
        [maxLength, editor],
    );

    const onLocalChange = useDebounce((newEditorValue) => {
        const newStr = getEditorString(editor);
        if (textRef.current === newStr) {
            return;
        }

        textRef.current = newStr;
        onChange(newStr);
        setEditorValue(newEditorValue);
    }, 30);

    useEffect(() => {
        if (textRef.current === value) {
            return;
        }
        textRef.current = value;
        const newEditorValue = strToEditorValue(value) as Descendant[];
        setEditorValue(newEditorValue);
        setStateId((old) => old + 1);
    }, [value]);

    return (
        <div
            className={classNames(className, styles.customTextareaWrap, {
                disabled,
            })}
        >
            <div className="inner">
                {/* stateId让state强制更新，不然setEditorValue设置不起作用 */}
                <Slate
                    key={`customTextareaWrap` + stateId}
                    editor={editor}
                    value={editorValue}
                    onChange={onLocalChange}
                >
                    <Editable
                        onPaste={onPaste}
                        readOnly={disabled}
                        placeholder={placeholder}
                        renderElement={renderElement}
                    />
                </Slate>
            </div>
            {maxLength ? (
                <div className="maxLength">
                    {textRef.current.length}/{maxLength}
                </div>
            ) : null}
        </div>
    );
}
