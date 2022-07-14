import ReactDom from 'react-dom/client';

import App from './App';

import 'antd/dist/antd.css';

const dom = document.getElementById('root');
const root = ReactDom.createRoot(dom as HTMLDivElement);

root.render(<App />);
