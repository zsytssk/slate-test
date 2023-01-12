import { MinusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Tooltip } from '@whale-labs/want';
import { useCallback, useMemo } from 'react';
import { BaseEditor, Descendant, Editor, Node } from 'slate';
import { BaseElement, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { RenderElementProps } from 'slate-react';

import { VALUE_TYPE } from './const';

/**
 * 匹配当前编辑的节点类型
 * @param editor
 * @param type
 */
export const matchNodeType = (
    editor: BaseEditor & ReactEditor,
    type: string,
): any => {
    const [match] = Editor.nodes(editor, {
        match: (n: any) => {
            return n.type === type;
        },
    });

    return match;
};

/**
 * 字符串标记出 实例词
 * @example  '亲爱的${观众称谓}，早上好，${instance-小老妹}们！ ${instance-小老弟}们！'
 * @param value string
 * @param entityDict
 * @returns string
 */
export function handleInstance(value: string, entityDict: any) {
    Object.keys(entityDict).forEach((key) => {
        const instanceWord = key.split('').join('^^^'); // 如果'家人们'和'家人'都属于实例，则匹配完'家人们'还会继续匹配'家人'；解决办法：将'家人们'替换为'家---人---们'，防止后面碰到实例'家人'再次匹配到
        value = value
            .split(key)
            .join('${instance-' + entityDict[key] + '--' + instanceWord + '}');
    });

    return value.split('^^^').join('');
}

export interface Children {
    text: string;
}

export interface CustomNode {
    key: string;
    type?: string;
    label?: string;
    text?: string;
    children?: Children[];
    character?: string; // void节点
    entity?: string; // 实例对应的实体
    ignore?: string;
}

export type CustomDescendant = CustomNode & Descendant;

/**
   * 字符串转Descendant【slate组件value的类型】
   * @example [
      {
          "type": "paragraph",
          "children": [
              {
                  "text": "亲爱的"
              }
          ]
      },
      ...
  ]
   * @param str
   */
export function strToDescendant(str: string): CustomDescendant[] {
    const regex = /(\$\{[^\}]+\})/;
    const textArray = str.split(regex);

    return textArray
        .filter((text) => !!text) // 过滤掉空字符串
        .map((item, index) => {
            if (!regex.test(item)) {
                return createNode(VALUE_TYPE.TEXT, item);
            }

            if (item.startsWith('${instance-')) {
                const instanceMap = item.slice(11, -1).split('--');
                return createNode(
                    VALUE_TYPE.INSTANCE,
                    instanceMap[1],
                    instanceMap[0],
                );
            }

            return createNode(VALUE_TYPE.ENTITY, item.slice(2, -1));
        });
}

/**
 * 创建各种类型的节点对象
 */
export function createNode(
    type: string = VALUE_TYPE.TEXT,
    text: string = '',
    entity: string = '',
) {
    const baseNode = {
        key: genRandomStr(),
        type,
        children: [{ text }],
    };
    switch (type) {
        case VALUE_TYPE.INSTANCE:
            return {
                ...baseNode,
                originText: text,
                entity,
            };
        case VALUE_TYPE.ENTITY:
            return {
                ...baseNode,
                originText: text,
                character: text, // void节点
                children: [{ text: '' }], // void节点
            };
        default:
            return baseNode;
    }
}

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

/**
 * Descendant转字符串【slate组件value的类型】
 * @example
 * @param str
 */
export function toDescendantTostr(value: CustomDescendant[]) {
    return value
        .map((n) => {
            if (n.type === VALUE_TYPE.ENTITY) {
                return '${' + n.character + '}';
            }
            return Node.string(n);
        })
        .join('');
}

export function genRandomStr() {
    return Math.random().toString().replace('0.', '');
}
