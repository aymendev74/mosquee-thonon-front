import { useAuth } from '../../hooks/AuthContext';
import { EditOutlined } from '@ant-design/icons';
import { useForm } from 'antd/es/form/Form';
import { useMediaQuery } from 'react-responsive';
import { ModalClasse } from '../../components/modals/ModalClasse';
import { ModaleConfirmSuppression } from '../../components/modals/ModalConfirmSuppression';
import { UnahtorizedAccess } from '../public/UnahtorizedAccess';
import { useClasseManagement } from './classes/hooks/useClasseManagement';
import { ClasseDesktopView } from './classes/ClasseDesktopView';
import { ClasseMobileView } from './classes/ClasseMobileView';

const CreateUpdateClasse = () => {
    const { roles } = useAuth();
    const [form] = useForm();
    const isMobile = useMediaQuery({ maxWidth: 768 });

    const {
        enseignants,
        classes,
        modalClasseOpen,
        debutAnneeScolaire,
        classeToEdit,
        modalDeleteClasseOpen,
        setModalClasseOpen,
        setModalDeleteClasseOpen,
        doSearchClasses,
        onCreateClasse,
        onModifierClasse,
        onDeleteClasse,
        onConfirmDeleteClasse,
        handleAnneeScolaireChanged,
    } = useClasseManagement(form);

    const viewProps = {
        form,
        enseignants,
        classes,
        debutAnneeScolaire,
        onCreateClasse,
        onModifierClasse,
        onDeleteClasse,
        doSearchClasses,
        handleAnneeScolaireChanged,
    };

    return roles?.includes("ROLE_ADMIN") ? (
        <>
            <ModalClasse
                open={modalClasseOpen}
                setOpen={setModalClasseOpen}
                enseignants={enseignants}
                debutAnneeScolaire={debutAnneeScolaire}
                finAnneeScolaire={debutAnneeScolaire + 1}
                classeToEdit={classeToEdit}
            />
            <ModaleConfirmSuppression 
                open={modalDeleteClasseOpen} 
                setOpen={setModalDeleteClasseOpen} 
                title="Supprimer une classe" 
                onConfirm={onConfirmDeleteClasse} 
            />
            <div className="centered-content">
                <div className="container-full-width">
                    <h2 className="classes-title">
                        <EditOutlined style={{ marginRight: 8 }} /> Administration des classes
                    </h2>
                </div>
            </div>            
            {isMobile ? <ClasseMobileView {...viewProps} /> : <ClasseDesktopView {...viewProps} />}
        </>
    ) : <UnahtorizedAccess />
};

export default CreateUpdateClasse;