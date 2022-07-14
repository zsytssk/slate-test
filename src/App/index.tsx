import { Button, Modal } from 'antd';
import { useState } from 'react';

import './index.module.less';

export default function App() {
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <Button onClick={() => setVisible(true)}>open</Button>
            <Modal visible={visible} onCancel={() => setVisible(false)}>
                this is a test
            </Modal>
        </div>
    );
}
