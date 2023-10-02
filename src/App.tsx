import { Layout, Button, Row, Col } from 'antd';
import {
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Link, Route, Routes } from 'react-router-dom';
import { Home } from './components/pages/Home';
import { InscriptionForm } from './components/pages/InscriptionForm';
import { Authenticate } from './components/pages/Authenticate';
import { Administration } from './components/pages/Administration';
import { MyMenu } from './components/MyMenu';
import { useAuth } from './hooks/UseAuth';

const { Header, Content, Footer } = Layout;

function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <Layout>
      <Header>
        <Row justify="space-between">
          <Col span={8} style={{ marginTop: "5px" }}>
            <div className="d-flex">
              <div className="logo" />
              <div className="logo-title">Association musulmane du Chablais</div>
            </div>
          </Col>
          <Col span={8}>
            <MyMenu />
          </Col>
          <Col span={8} style={{ textAlign: "right" }}>
            {isAuthenticated ? (
              <Button
                type="primary"
                icon={<LogoutOutlined />}
                onClick={logout}
              >
                Déconnexion
              </Button>
            ) : (
              <Link to="/login"><Button
                type="primary"
                icon={<LoginOutlined />}
              >
                Connexion
              </Button></Link>
            )}
          </Col>
        </Row>
      </Header>
      <Content style={{ padding: '50px', minHeight: "600px" }}>
        <div className="centered-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inscription" element={<InscriptionForm />} />
            <Route path="/login" element={<Authenticate />} />
            <Route path="/administration" element={<Administration />} />
          </Routes>
        </div>
      </Content>
      <Footer>
        <div className="footer">
          <p>Copyright © 2023 | MOSQUEE-THONON</p>
          <strong>Association Musulmane du Chablais</strong><br />
          5 chemin des Epinanches<br />
          74200 THONON LES BAINS<br />
          Tel: (+33)4 50 70 64 78<br />
        </div>
      </Footer>
    </Layout>
  );
}

export default App;
