import type { ThemeConfig } from 'antd';

/**
 * Configuration du thème Ant Design pour l'application
 * 
 * Documentation des tokens : https://ant.design/docs/react/customize-theme
 * 
 * Structure :
 * - token : Tokens globaux appliqués à tous les composants
 * - components : Tokens spécifiques par composant
 */
export const antdTheme: ThemeConfig = {
  token: {
    // === COULEURS PRINCIPALES ===
    colorPrimary: '#1890ff',           // Bleu principal
    colorSuccess: '#52c41a',           // Vert succès
    colorWarning: '#faad14',           // Orange warning
    colorError: '#ff4d4f',             // Rouge erreur
    colorInfo: '#1890ff',              // Bleu info
    
    // === COULEURS DE FOND ===
    colorBgBase: '#ffffff',            // Fond blanc de base
    colorBgContainer: '#ffffff',       // Fond des containers (Cards, etc.)
    colorBgLayout: '#f5f5f5',          // Fond du layout principal
    
    // === COULEURS DE TEXTE ===
    colorText: 'rgba(0, 0, 0, 0.85)',  // Texte principal
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)', // Texte secondaire
    
    // === BORDURES ===
    colorBorder: '#d9d9d9',            // Couleur des bordures
    borderRadius: 10,                   // Border radius global (10px)
    
    // === TYPOGRAPHIE ===
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // === ESPACEMENTS ===
    padding: 16,
    margin: 16,
    
    // === OMBRES ===
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    boxShadowSecondary: '0 4px 12px rgba(0, 0, 0, 0.10)',
  },
  
  components: {
    // === CARD ===
    Card: {
      headerBg: '#001529',                    // Header bleu foncé
      colorBgContainer: '#ffffff',            // Fond blanc pour le body
      colorTextHeading: '#f5f5f5',           // Texte du header en blanc
      borderRadiusLG: 13,                     // Border radius des cards (13px pour matcher .card-focus-effect)
      boxShadow: '0 5px 15px #001529',        // Ombre bleu foncé accentuée
      colorBorder: '#001529',                 // Bordure bleu foncé      
    },
    
    // === COLLAPSE ===
    Collapse: {
      headerBg: '#001529',                    // Header bleu foncé
      contentBg: '#f5f5f5',                   // Fond du contenu
      borderRadiusLG: 20,                     // Border radius des collapse
      colorText: '#ffffff',                   // Texte du header en blanc
      colorTextHeading: '#ffffff',            // Titre du header en blanc
    },
    
    // === MENU ===
    Menu: {
      itemBg: '#001529',                      // Fond des items
      itemColor: 'rgba(255, 255, 255, 0.65)', // Couleur du texte
      itemHoverBg: 'rgba(255, 255, 255, 0.1)', // Fond au survol
      itemHoverColor: '#ffffff',              // Texte au survol
      itemSelectedBg: '#1890ff',              // Fond de l'item sélectionné
      itemSelectedColor: '#ffffff',           // Texte de l'item sélectionné
      subMenuItemSelectedColor: '#ffffff',    // Texte du sous-menu sélectionné
    },
    
    // === BUTTON ===
    Button: {
      borderRadius: 10,
      controlHeight: 32,
      fontWeight: 500,
    },
    
    // === INPUT ===
    Input: {
      borderRadius: 10,
      controlHeight: 32,
      colorBgContainer: '#ffffff',      // Fond blanc pour les inputs
    },
    
    // === SELECT ===
    Select: {
      borderRadius: 10,
      controlHeight: 32,
    },
    
    // === TABLE ===
    Table: {
      headerBg: '#fafafa',
      headerColor: 'rgba(0, 0, 0, 0.85)',
      borderColor: '#f0f0f0',
      rowHoverBg: '#fafafa',
    },
    
    // === FORM ===
    Form: {
      labelColor: 'rgba(0, 0, 0, 0.85)',
      labelFontSize: 14,
    },
    
    // === DRAWER ===
    Drawer: {
      colorBgElevated: '#ffffff',
      colorText: 'rgba(0, 0, 0, 0.85)',
    },
    
    // === MODAL ===
    Modal: {
      borderRadiusLG: 10,
      headerBg: '#ffffff',
    },
    
    // === STEPS ===
    Steps: {
      colorPrimary: '#4FC3F7',              // Couleur du step actif (bleu clair)
      colorSuccess: '#52c41a',              // Couleur du step terminé (vert)
    },
  },
};
