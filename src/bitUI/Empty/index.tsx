import classNames from 'classnames';
import SVG from 'react-inlinesvg';

import { useUITranslate } from '../useUITranslate';

import emptySvg from './empty.svg';
import styles from './style.module.less';

type Props = {
    tip?: React.ReactNode;
    className?: string;
};

export function Empty(props: Props) {
    const langInfo = useUITranslate();
    const { tip, className } = props;

    return (
        <div className={classNames(styles.empty, className)}>
            <SVG src={emptySvg} />
            <div className="tip">{tip || langInfo.emptyTip}</div>
        </div>
    );
}
