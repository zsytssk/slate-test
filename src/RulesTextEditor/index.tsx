import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Descendant, Node, Transforms, createEditor } from 'slate';
import { Editable, RenderElementProps, Slate, withReact } from 'slate-react';

import { Element } from './Elements';
import styles from './index.module.less';
import {
    CustomDescendant,
    CustomNode,
    DEFAULT_STYLE,
    VALUE_TYPE,
    createNode,
    handleInstance,
    matchNodeType,
    strToDescendant,
    toDescendantTostr,
    withEntity,
    withInstance,
} from './util';

interface Iprops {
    placeholder?: string;
    style?: React.CSSProperties;
    value?: string;
    onChange: (v: string) => void;
}

export const RulesTextEditor = ({
    placeholder = '',
    style,
    value = '',
    onChange,
}: Iprops) => {
    const editor = useMemo(
        () => withInstance(withEntity(withReact(createEditor()))),
        [],
    );
    const [entityDict, setEntityDict] = useState({
        小老妹们: '称谓',
        小老妹: '称谓',
        小老弟: '称谓',
        小老弟们: '称谓',
        家人们: '亲人',
        家人: '亲人',
    });
    const [stateId, setStateId] = useState(0);
    const textRef = useRef<string>();
    const [editorValue, setEditorValue] = useState<Descendant[]>([]);

    useEffect(() => {
        if (textRef.current === value) {
            return;
        }
        textRef.current = value;
        const newEditorValue = strToDescendant(
            handleInstance(value, entityDict),
        ) as Descendant[];
        console.log(`test:>newEditorValue`, newEditorValue);
        setEditorValue(newEditorValue);
        setStateId((old) => old + 1);
    }, [value, entityDict]);

    const onEditorChange = useCallback(
        (value: CustomDescendant[]) => {
            const isAstChange = editor.operations.some(
                (op) => 'set_selection' !== op.type,
            );
            if (isAstChange) {
                // 序列化值并将字符串保存到本地存储。
                console.log('-------isAstChange', toDescendantTostr(value));
                onChange(toDescendantTostr(value));
            }

            const matchInstance = matchNodeType(editor, VALUE_TYPE.INSTANCE);

            // 实例instance处理：实例被删除或者拆解需要将type=instance和前后的type=paragraph合并；
            if (matchInstance) {
                const text = Node.string(matchInstance[0]); //matchInstance[0].children[0].text;
                const at = matchInstance[1]; // [0]
                // 1、实例文本没有变化不做处理
                if (text === matchInstance[0].originText) {
                    return;
                }

                // 1、实例文本为空则删除该节点,删除之后如果前后节点都是paragraph节点需要合并
                if (!text) {
                    Transforms.removeNodes(editor, { at });

                    if (
                        value?.[at[0] - 1] &&
                        value?.[at[0] + 1] &&
                        value?.[at[0] - 1]?.type === VALUE_TYPE.TEXT &&
                        value?.[at[0] + 1]?.type === VALUE_TYPE.TEXT
                    ) {
                        Transforms.mergeNodes(editor, { at });
                    }
                    return;
                }
                // 2、实例文本没有实例，则将实例节点转成paragraph节点，并跟前后合并
                const handledText = handleInstance(text, entityDict);

                if (handledText === text) {
                    Transforms.setNodes(
                        editor,
                        createNode(VALUE_TYPE.TEXT, text),
                        { at },
                    );

                    if (
                        value?.[at[0] - 1] &&
                        value?.[at[0] - 1].type === VALUE_TYPE.TEXT
                    ) {
                        Transforms.mergeNodes(editor, { at });
                    }
                    if (
                        value?.[at[0] + 1] &&
                        value?.[at[0] + 1].type === VALUE_TYPE.TEXT
                    ) {
                        Transforms.mergeNodes(editor, { at });
                    }

                    return;
                }
                // 3、实例文本有实例，需要将paragraph节点拆分成多个节点【这里有三种情况：1、在原来实例的基础上增加文本形成两个节点；2、在原来基础上增加文本组成新的实例；3、在原来基础上减少文本组成新的实例】
                const newNodes = strToDescendant(handledText);
                Transforms.removeNodes(editor, { at });
                Transforms.insertNodes(editor, newNodes);
                return;
            }

            const matchText = matchNodeType(editor, VALUE_TYPE.TEXT);
            if (matchText) {
                const text = Node.string(matchText?.[0]); //matchText[0].children[0].text;
                const at = matchText[1]; // [0]

                // 1、文本为空则删除该节点，这里考虑到当前节点前后肯定是非paragraph节点，所以不要删除【防止两个实体节点间没办法编辑】
                if (!text) {
                    // Transforms.removeNodes(editor, { at });
                    return;
                }

                // 2.1、如果是忽略实例的文本，并且未做改变，则不处理
                if (matchText[0].ignore && matchText[0].ignore === text) {
                    return;
                }
                // 2.1、如果是忽略实例的文本，并且做改变，则ignore属性置空
                if (matchText[0].ignore) {
                    Transforms.setNodes(editor, { ignore: '' } as CustomNode);
                }

                // 3、文本没有实例，不做处理
                const handledText = handleInstance(text, entityDict);
                if (handledText === text) {
                    // if (value?.[at[0] + 1].type === VALUE_TYPE.TEXT) {
                    //   Transforms.mergeNodes(editor, { at: [at[0] + 1] });
                    // }
                    return;
                }
                // 4、文本有实例，需要将paragraph节点拆分成多个节点
                const newNodes = strToDescendant(handledText);
                Transforms.removeNodes(editor, { at });
                Transforms.insertNodes(editor, newNodes, { at });

                // 移动鼠标到编辑位置
                const lastTextLen = Node.string(
                    newNodes?.[newNodes?.length - 1],
                )?.length; //   newNodes?.[newNodes?.length - 1]?.children?.[0]?.text?.length
                if (
                    lastTextLen &&
                    newNodes[newNodes.length - 1]?.type === VALUE_TYPE.TEXT
                ) {
                    Transforms.move(editor, {
                        distance: lastTextLen + 1,
                        unit: 'offset',
                        reverse: true,
                    });
                }

                return;
            }
        },
        [editor],
    );

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            // 回车key不换行
            if (e.key === 'Enter') {
                e.preventDefault();
                return;
            }
        },
        [editor],
    );

    const renderElement = useCallback(
        (props: RenderElementProps) => <Element {...props} editor={editor} />,
        [],
    );

    return (
        <Slate
            key={`customTextareaWrap` + stateId}
            editor={editor}
            value={editorValue}
            onChange={(v: Descendant[]) =>
                onEditorChange(v as CustomDescendant[])
            }
        >
            <Editable
                className={styles.editor}
                style={{
                    ...DEFAULT_STYLE,
                    ...style,
                }}
                placeholder={placeholder}
                renderElement={renderElement}
                onKeyDown={onKeyDown}
            />
        </Slate>
    );
};
