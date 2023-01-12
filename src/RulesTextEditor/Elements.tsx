import { MinusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from '@whale-labs/want';
import { Button } from '@whale-labs/want';
import { useCallback, useMemo } from 'react';
import { BaseElement, Editor, Node, Transforms } from 'slate';
import { ReactEditor, RenderElementProps } from 'slate-react';

import { CustomDescendant, CustomNode, VALUE_TYPE, createNode } from './util';

/**
 * 定义具体样式如何渲染
 * @param props
 * @returns
 */
export const Element = (props: any) => {
    const { attributes, children, element } = props;

    switch (element.type) {
        case VALUE_TYPE.INSTANCE:
            return <InstanceElement {...props} />;
        case VALUE_TYPE.ENTITY:
            return (
                <span
                    style={{
                        fontFamily: 'PingFang SC',
                        fontSize: '14px',
                        color: '#505468',
                        backgroundColor: '#F0F4F7',
                        padding: '2px 4px',
                    }}
                    {...attributes}
                    contentEditable={false}
                >
                    {children}
                    {element.character}
                </span>
            );
        case VALUE_TYPE.INNER_BOX:
            return <div className="innerBox">{children}</div>;
        default:
            return (
                <span style={{ display: 'inline-block' }} {...attributes}>
                    {children}
                </span>
            );
    }
};

/**
 * 定义实例具体样式如何渲染
 * @param props
 * @returns
 */
const InstanceElement = (
    props: RenderElementProps & { editor: ReactEditor },
) => {
    const { attributes, children, element, editor } = props;
    const curNode = useMemo(
        () => element as BaseElement & CustomNode,
        [element],
    );

    const onTransform = useCallback(() => {
        for (const [node, path] of Editor.nodes(editor, {
            at: [[0], [editor.children.length + 1]],
        })) {
            const cn = node as CustomDescendant;
            if (cn?.key === curNode.key && cn?.type === VALUE_TYPE.INSTANCE) {
                Transforms.setNodes(
                    editor,
                    createNode(VALUE_TYPE.ENTITY, curNode.entity),
                    { at: path },
                );
                return;
            }
        }
    }, [editor, curNode]);

    const onIgnore = useCallback(() => {
        const text = Node.string(curNode); //curNode.children?.[0]?.text;
        for (const [node, path] of Editor.nodes(editor, {
            at: [[0], [editor.children.length + 1]],
        })) {
            const cn = node as CustomDescendant;
            if (cn?.key === curNode.key && cn?.type === VALUE_TYPE.INSTANCE) {
                Transforms.setNodes(
                    editor,
                    { ...createNode(VALUE_TYPE.TEXT, text), ignore: text }, // entity保留为了区分实例和符合实例的文本。所有忽略过的实例都会转为entity.length>0的paragraph节点。这里不能合并，合并会导致编辑马上转为实例
                    {
                        at: path,
                    },
                );

                return;
            }
        }
    }, [editor, editor.children, curNode]);

    const instanceElement = (
        <Tooltip
            title={
                <div
                    style={{
                        fontFamily: 'PingFang SC',
                        color: 'rgba(0, 0, 34, 0.85)',
                        width: '142px',
                        height: '128px',
                    }}
                >
                    <div
                        style={{
                            fontSize: '12px',
                            color: 'rgba(0, 0, 34, 0.5)',
                            padding: '7px 7px',
                        }}
                    >
                        推荐替换为实体词{'  '}
                        <Tooltip title="balabala">
                            <QuestionCircleOutlined />
                        </Tooltip>
                    </div>
                    <Button
                        type="text"
                        style={{
                            textAlign: 'left',
                            height: '36px',
                            fontSize: '16px',
                            fontWeight: 500,
                            width: '138px',
                        }}
                        onClick={onTransform}
                    >
                        {curNode.entity}
                    </Button>

                    <div
                        style={{
                            borderBottom: '1px solid rgba(0, 0, 34, 0.06)',
                            marginTop: '8px',
                            marginBottom: '8px',
                        }}
                    ></div>

                    <Button
                        type="text"
                        icon={<MinusCircleOutlined />}
                        style={{
                            textAlign: 'left',
                            fontSize: '14px',
                            width: '138px',
                            height: '36px',
                        }}
                        onClick={onIgnore}
                    >
                        忽略
                    </Button>
                </div>
            }
            color="#ffffff"
            placement="topLeft"
        >
            <span style={{ borderBottom: '1px  solid  #006BD6' }}>
                {children}
            </span>
        </Tooltip>
    );
    return <span {...attributes}>{instanceElement}</span>;
};
