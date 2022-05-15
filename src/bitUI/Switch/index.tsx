import RcSwitch from 'rc-switch';

import './Switch.module.less';

export type Props = {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean, event: Event) => void;
    disabled?: boolean;
};

export default function Switch(props: any) {
    return <RcSwitch checkedChildren="ON" unCheckedChildren="OFF" {...props} />;
}
