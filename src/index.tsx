import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './hooks/UseAuth';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import frFR from 'antd/locale/fr_FR';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Europe/Paris");

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
      locale={frFR}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </ConfigProvider>
  </BrowserRouter>
);
