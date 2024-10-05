import { Layout, Row, Col, MenuProps, Dropdown, Avatar } from 'antd';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Home } from './components/pages/Home';
import { CoursArabesEnfantForm } from './components/pages/CoursArabesEnfantForm';
import { Authenticate } from './components/pages/admin/Authenticate';
import { AdminCoursArabes } from './components/pages/admin/AdminCoursArabes';
import { MyMenu } from './components/MyMenu';
import { ChangePassword } from './components/pages/admin/ChangePasswordForm';
import { AdhesionForm } from './components/pages/AdhesionForm';
import { AdminAdhesion } from './components/pages/admin/AdminAdhesion';
import { AdminTarifs } from './components/pages/admin/AdminTarifs';
import { FaireUnDon } from './components/pages/FaireUnDon';
import { Parametres } from './components/pages/admin/Parametres';
import { HomeAdmin } from './components/pages/admin/HomeAdmin';
import { CoursArabesAdulteForm } from './components/pages/CoursArabesAdulteForm';
import { useAuth } from './hooks/AuthContext';
import { SignIn } from './components/pages/admin/SignIn';

const { Header, Content, Footer } = Layout;

function App() {
  const { getLoggedUser, logout } = useAuth();
  const navigate = useNavigate();

  const DropdownAuthUser = () => {
    const handleMenuClick = (e: any) => {
      if (e.key === "1" && logout) {
        logout();
      } else if (e.key === "2") {
        navigate("/changePassword");
      }
    };

    const items: MenuProps['items'] = [{ label: "Se déconnecter", key: "1" }, { label: "Modifier mot de passe", key: "2" }];

    const menu: MenuProps = { items, onClick: handleMenuClick };

    return (
      <Dropdown menu={menu}>
        <Avatar style={{ backgroundColor: "orange", verticalAlign: "middle", cursor: "pointer", color: "black" }} size="large">
          {getLoggedUser()}
        </Avatar>
      </Dropdown>
    );
  };

  return (
    <Layout>
      <Header>
        <Row justify="space-between">
          <Col span={8} style={{ marginTop: "5px" }}>
            <div className="d-flex">
              <div className="logo" />
              <div className="logo-title hidden-xs">Association musulmane du Chablais</div>
            </div>
          </Col>
          <Col span={8}>
            <MyMenu />
          </Col>
          <Col span={8} style={{ textAlign: "right" }}>
            {getLoggedUser() ? (
              <DropdownAuthUser />
            ) : (
              <></>
            )}
          </Col>
        </Row>
      </Header>
      <Content className="content">
        <div className="centered-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/coursEnfants" element={<CoursArabesEnfantForm />} />
            <Route path="/coursAdultes" element={<CoursArabesAdulteForm />} />
            <Route path="/adhesion" element={<AdhesionForm />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/admin" element={<HomeAdmin />} />
            <Route path="/adminCours" element={<AdminCoursArabes />} />
            <Route path="/adminAdhesion" element={<AdminAdhesion />} />
            <Route path="/adminTarif" element={<AdminTarifs />} />
            <Route path="/changePassword" element={<ChangePassword />} />
            <Route path="/don" element={<FaireUnDon />} />
            <Route path="/parametres" element={<Parametres />} />
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
