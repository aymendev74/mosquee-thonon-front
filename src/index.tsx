import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
//import { AuthProvider } from './hooks/UseAuth';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import frFR from 'antd/locale/fr_FR';
import { Font } from '@react-pdf/renderer';
import { AuthProvider } from './hooks/AuthContext';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Europe/Paris");

// react-pdf
Font.register({
  family: 'Roboto',
  fonts: [
    { src: './polices/roboto/Roboto-Regular.ttf' },
    { src: './polices/roboto/Roboto-Bold.ttf', fontWeight: "bold" }
  ]
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <BrowserRouter>
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 15,
          fontFamily: 'Roboto, sans-serif',
        },
        components: {
          Collapse: {
            borderRadiusLG: 20,
            contentBg: "#f5f5f5",
            headerBg: "#001529",
          },
        }
      }}
      locale={frFR}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </ConfigProvider>
  </BrowserRouter>


);
