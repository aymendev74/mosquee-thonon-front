import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, Menu, theme } from 'antd';
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
dayjs.locale("fr");

// react-pdf
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: '/polices/Roboto-Regular.ttf',
      fontWeight: 'normal',
      fontStyle: 'normal',
    },
    {
      src: '/polices/Roboto-Bold.ttf',
      fontWeight: 'bold',
      fontStyle: 'normal',
    },
    {
      src: '/polices/Roboto-Italic.ttf',
      fontWeight: 'normal',
      fontStyle: 'italic',
    },
    {
      src: '/polices/Roboto-BoldItalic.ttf',
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
      theme={{
        token: {
          borderRadius: 10,
          fontFamily: 'Roboto, sans-serif',
        },
        components: {
          Collapse: {
            borderRadiusLG: 20,
            contentBg: "#f5f5f5",
            headerBg: "#001529",
          },
          Card: {
            headerBg: "#001529",
            colorBgContainer: "#f5f5f5",
          },
          Menu: {
            subMenuItemSelectedColor: "#ffff",
          }
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
