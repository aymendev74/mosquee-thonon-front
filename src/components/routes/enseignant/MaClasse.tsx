import { useAuth } from '../../../hooks/AuthContext';
import { useMediaQuery } from 'react-responsive';
import { ModalFeuillePresence } from '../../modals/ModalFeuillePresence';
import { ModalBulletin } from '../../modals/ModalBulletin';
import { UnahtorizedAccess } from '../public/UnahtorizedAccess';
import { MaClasseDesktopView } from './classe-enseignant/MaClasseDesktopView';
import { MaClasseMobileView } from './classe-enseignant/MaClasseMobileView';
import { useMaClasseManagement } from './classe-enseignant/hooks/useMaClasseManagement';

const MaClasse = () => {
    const { roles } = useAuth();
    const isMobile = useMediaQuery({ maxWidth: 768 });
    
    const {
        classe,
        elevesEnriched,
        feuillesPresence,
        bulletins,
        selectedEleveId,
        vueDetaille,
        bulletinsPdf,
        modalFeuillePresenceOpen,
        setModalFeuillePresenceOpen,
        feuilleToView,
        feuilleToViewReadOnly,
        modalBulletinOpen,
        setModalBulletinOpen,
        bulletin,
        onCreateFeuillePresence,
        onViewFeuille,
        onDeleteFeuille,
        onVueDetailleSwitch,
        exportData,
        onModifierResultat,
        onEnregistrerResultat,
        loadBulletinsEleve,
        onCreerBulletin,
        onModifierBulletin,
        onDeleteBulletin,
        getBulletinPdfButton,
        getTauxReussite,
        getJourClasse,
        getSelectedEleve,
    } = useMaClasseManagement();

    const viewProps = {
        classe,
        elevesEnriched,
        feuillesPresence,
        bulletins,
        selectedEleveId,
        vueDetaille,
        bulletinsPdf,
        onCreateFeuillePresence,
        onViewFeuille,
        onDeleteFeuille,
        onVueDetailleSwitch,
        exportData,
        onModifierResultat,
        onEnregistrerResultat,
        loadBulletinsEleve,
        onCreerBulletin,
        onModifierBulletin,
        onDeleteBulletin,
        getBulletinPdfButton,
        getTauxReussite,
        getJourClasse,
    };

    return roles?.includes("ROLE_ADMIN") || roles?.includes("ROLE_ENSEIGNANT") ? (
        <>
            <ModalFeuillePresence open={modalFeuillePresenceOpen} setOpen={setModalFeuillePresenceOpen} classe={classe}
                feuilleToEdit={feuilleToView} readOnly={feuilleToViewReadOnly} />
            <ModalBulletin open={modalBulletinOpen} setOpen={setModalBulletinOpen} isCreation={bulletin?.id === undefined}
                annees={[classe?.debutAnneeScolaire!, classe?.finAnneeScolaire!]} eleve={getSelectedEleve()}
                bulletin={bulletin} />
            {isMobile ? <MaClasseMobileView {...viewProps} /> : <MaClasseDesktopView {...viewProps} />}
        </>
    ) : <UnahtorizedAccess />
};

export default MaClasse;