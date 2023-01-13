import { useState } from 'react';

import { CustomTextarea } from './CustomTextarea';
import { RulesTextEditor } from './RulesTextEditor';

let timer: any;
export default function App() {
    const [value, setValue] = useState('');
    // const [value, setValue] = useState(
    //     '亲爱${观众称谓}，早上好，小老妹们，早上！这是一段 小老弟们！小老妹和小老弟这个什小老弟们么家人们什么的',
    // );

    return (
        <div>
            <div className="wrap" style={{ margin: '100px 0 0 100px' }}>
                <CustomTextarea
                    value={value}
                    onChange={(val) => setValue(val)}
                />
                {/* <RulesTextEditor
                    value={value}
                    onChange={(val) => setValue(val)}
                /> */}
            </div>
        </div>
    );
}
