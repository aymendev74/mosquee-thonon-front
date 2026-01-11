import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import { EditOutlined } from '@ant-design/icons';
import useApi from '../../hooks/useApi';
import { CLASSES_ENDPOINT } from '../../services/services';
import { useForm } from 'antd/es/form/Form';
import { useMediaQuery } from 'react-responsive';
import dayjs from 'dayjs';
import { ClasseDtoB, ClasseDtoF } from '../../services/classe';
import { prepareClasseBeforeForm } from '../../utils/FormUtils';
import { useNavigate } from 'react-router-dom';
import { UnahtorizedAccess } from '../public/UnahtorizedAccess';
import { ClassesEnseignantDesktopView } from './classes-enseignant/ClassesEnseignantDesktopView';
import { ClassesEnseignantMobileView } from './classes-enseignant/ClassesEnseignantMobileView';

const MesClasses = () => {
    const { roles } = useAuth();
    const { execute } = useApi();
    const [classes, setClasses] = useState<ClasseDtoF[]>([]);
    const [form] = useForm();
    const [debutAnneeScolaire] = useState<number>(dayjs().year());
    const navigate = useNavigate();
    const isMobile = useMediaQuery({ maxWidth: 768 });

    const doSearchClasses = async (values: any) => {
        const params = { anneeDebut: values.anneeDebut, anneeFin: values.anneeFin ?? values.anneeDebut + 1 };
        const { successData: classesB } = await execute<ClasseDtoB[]>({ method: "GET", url: CLASSES_ENDPOINT, params });
        if (classesB) {
            const classesF = classesB.map(classe => prepareClasseBeforeForm(classe));
            setClasses(classesF);
        }
    };

    const onConsulterClasse = (classeId: number) => {
        navigate(`/classes/${classeId}`);
    };

    useEffect(() => {
        doSearchClasses({ anneeDebut: debutAnneeScolaire, anneeFin: debutAnneeScolaire + 1 });
    }, []);

    const viewProps = {
        form,
        classes,
        debutAnneeScolaire,
        doSearchClasses,
        onConsulterClasse,
    };

    return roles?.includes("ROLE_ADMIN") || roles?.includes("ROLE_ENSEIGNANT") ? (
        <>
            <div className="centered-content">
                <div className="container-full-width">
                    <h2 className="classes-title">
                        <EditOutlined style={{ marginRight: 8 }} /> Gestion de mes classes
                    </h2>
                </div>
            </div>
            {isMobile ? <ClassesEnseignantMobileView {...viewProps} /> : <ClassesEnseignantDesktopView {...viewProps} />}
        </>
    ) : <UnahtorizedAccess />
};

export default MesClasses;