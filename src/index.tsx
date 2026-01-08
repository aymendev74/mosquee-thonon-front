import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import frFR from 'antd/locale/fr_FR';
import { Font } from '@react-pdf/renderer';
import { AuthProvider } from './hooks/AuthContext';
import { antdTheme } from './theme/antdTheme';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Europe/Paris");
dayjs.locale("fr");

// react-pdf
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: '/polices/roboto/Roboto-Regular.ttf',
      fontWeight: 'normal',
      fontStyle: 'normal',
    },
    {
      src: '/polices/roboto/Roboto-Bold.ttf',
      fontWeight: 'bold',
      fontStyle: 'normal',
    },
    {
      src: '/polices/roboto/Roboto-Italic.ttf',
      fontWeight: 'normal',
      fontStyle: 'italic',
    },
    {
      src: '/polices/roboto/Roboto-BoldItalic.ttf',
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ]
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <BrowserRouter>
    <ConfigProvider
      theme={antdTheme}
      locale={frFR}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </ConfigProvider>
  </BrowserRouter>
);
