import { Layout, Row, Col, MenuProps, Dropdown, Avatar } from 'antd';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Home } from './components/pages/Home';
import { CoursArabesEnfantForm } from './components/pages/CoursArabesEnfantForm';
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
import Enseignants from './components/pages/admin/Enseignants';
import CreateUpdateClasse from './components/pages/admin/CreateUpdateClasse';
import MesClasses from './components/pages/enseignant/MesClasses';
import MaClasse from './components/pages/enseignant/MaClasse';
import { NotFound } from './components/pages/NotFound';
import AdhesionInfos from './components/pages/AdhesionInfos';
import { useEffect } from 'react';

const { Header, Content, Footer } = Layout;

function App() {
  const { username, logout, getLoggedUser } = useAuth();
  const navigate = useNavigate();

  const DropdownAuthUser = () => {
    const handleMenuClick = (e: any) => {
      if (e.key === "1" && logout) {
        logout();
      } else if (e.key === "2") {
        navigate("/changePassword");
      }
    };

    const items: MenuProps['items'] = [
      {
        label: "Se déconnecter",
        key: "1",
        className: "dropdown-item"
      },
      {
        label: "Modifier mot de passe",
        key: "2",
        className: "dropdown-item"
      }
    ];

    const menu: MenuProps = {
      items,
      onClick: handleMenuClick,
      className: "user-dropdown"
    };

    return (
      <Dropdown menu={menu}>
        <Avatar style={{ backgroundColor: "orange", verticalAlign: "middle", cursor: "pointer", color: "black" }} size="large">
          {username}
        </Avatar>
      </Dropdown>
    );
  };

  useEffect(() => {
    getLoggedUser();
  }, []);

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
            {username ? (
              <DropdownAuthUser />
            ) : (
              <></>
            )}
          </Col>
        </Row>
      </Header>
      <Content className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/coursEnfants" element={<CoursArabesEnfantForm />} />
          <Route path="/coursAdultes" element={<CoursArabesAdulteForm />} />
          <Route path="/adhesion" element={<AdhesionForm />} />
          <Route path="/adhesionInfos" element={<AdhesionInfos />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/admin" element={<HomeAdmin />} />
          <Route path="/adminCours" element={<AdminCoursArabes />} />
          <Route path="/adminAdhesion" element={<AdminAdhesion />} />
          <Route path="/adminTarif" element={<AdminTarifs />} />
          <Route path="/enseignants" element={<Enseignants />} />
          <Route path="/creerModifierClasse" element={<CreateUpdateClasse />} />
          <Route path="/classes" element={<MesClasses />} />
          <Route path="/classes/:id" element={<MaClasse />} />
          <Route path="/changePassword" element={<ChangePassword />} />
          <Route path="/don" element={<FaireUnDon />} />
          <Route path="/parametres" element={<Parametres />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Content>
      <Footer className="footer">
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} md={8} className="footer-section">
            <h3 className="footer-title">Association Musulmane du Chablais</h3>
            <p>5 chemin des Epinanches</p>
            <p>74200 Thonon-les-Bains</p>
            <p>
              Tel: <a href="tel:+33450706478" className="footer-link">(+33) 4 50 70 64 78</a><br />
              Email: <a href="mailto:amcinscription@gmail.com" className="footer-link">amcinscription@gmail.com</a>
            </p>
          </Col>
          <Col xs={24} md={8} className="footer-section">
            <h3 className="footer-title">Navigation</h3>
            <p><a href="/coursEnfants" className="footer-link">Cours enfants</a></p>
            <p><a href="/coursAdultes" className="footer-link">Cours adultes</a></p>
            <p><a href="/adhesionInfos" className="footer-link">Adhésion</a></p>
          </Col>
          <Col xs={24} md={8} className="footer-section">
            <h3 className="footer-title">Suivez-nous</h3>
            <div className="social-icons">
              <a href="https://www.facebook.com/100012969094800" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
            </div>
          </Col>
        </Row>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p>© 2023 Association Musulmane du Chablais. Tous droits réservés.</p>
        </div>
      </Footer>
    </Layout>
  );
}

export default App;