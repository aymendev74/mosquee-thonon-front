import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 15,
        },
      }}
    >
      <App />
    </ConfigProvider>
  </BrowserRouter>
);
