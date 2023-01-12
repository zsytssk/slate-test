import {
    BaseEditor,
    Descendant,
    Editor,
    Node,
    NodeEntry,
    Transforms,
} from 'slate';
import { ReactEditor } from 'slate-react';

import { genRandomStr } from '../CustomTextarea/outer';

export const VALUE_TYPE = {
    ENTITY: 'entity',
    INSTANCE: 'instance',
    INNER_BOX: 'innerBox',
    TEXT: 'paragraph',
};

export const DEFAULT_STYLE = {
    width: 500,
    height: 300,
    lineHeight: '30px',
    padding: '0 11px',
    border: '1px solid #d9d9d9',
    backgroundColor: '#fff',
    overflow: 'hidden',
};

export const EMPTY_EDITOR_STATE = [
    {
        type: 'paragraph',
        children: { text: ' ' },
    },
];

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

// 实体：void节点
export const withEntity = (editor: ReactEditor) => {
    const { isVoid } = editor;
    // 重写 editor 的 isVoid 方法
    editor.isVoid = (element: any) => {
        return element.type === VALUE_TYPE.ENTITY ? true : isVoid(element);
    };
    return editor;
};

// 处理normalizeNode的自动合并，编辑instance节点后的paragraph节点，删除文本到instance节点继续删除会导致这两个节点合并，需求不应该合并
export const withInstance = (editor: ReactEditor) => {
    const { normalizeNode } = editor;
    // 重写 editor 的 normalizeNode 方法
    editor.normalizeNode = (entry: NodeEntry<Node>) => {
        const [node, path] = entry as NodeEntry<Node & CustomNode>;

        // 没有放在onchange是因为onchange获取到的matchInstance的children[0]是合并后的一个text,无法区分是slate默认合并导致的还是编辑instance节点添加内容导致的，这两种场景都需要拆分，但是slate默认合并还需要额外移动鼠标【否则，新插入节点会让鼠标定位到最后插入的paragraph节点，但实际上合并是因为删除实例节点后面的paragraph文本导致，鼠标应该定位到实例节点位置】，而编辑instance节点不需要
        if (
            node?.type === VALUE_TYPE.INSTANCE &&
            (node?.children?.length || 0) > 1
        ) {
            const pText = Node.string(node); //node?.children?.[1]?.text;
            Transforms.splitNodes(editor);
            Transforms.setNodes(editor, createNode(VALUE_TYPE.TEXT, pText), {
                at: [path[0] + 1],
            });

            return;
        }
        // 调用原始的 `normalizeNode` 以强制执行其它约束。
        normalizeNode(entry);
    };
    return editor;
};

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

    if (!str) {
        return EMPTY_EDITOR_STATE as any as CustomDescendant[];
    }

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
