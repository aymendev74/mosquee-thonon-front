import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/AuthContext';
import { EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import useApi from '../../../hooks/useApi';
import { ApiCallbacks, CLASSES_ENDPOINT, handleApiCall } from '../../../services/services';
import { Button, Card, Col, Divider, Empty, Form, Row, Tooltip } from 'antd';
import { InputNumberFormItem } from '../../common/InputNumberFormItem';
import { useForm } from 'antd/es/form/Form';
import dayjs from 'dayjs';
import { ClasseDtoB, ClasseDtoF } from '../../../services/classe';
import { prepareClasseBeforeForm } from '../../../utils/FormUtils';
import { useNavigate } from 'react-router-dom';

const MesClasses = () => {
    const { isAuthenticated } = useAuth();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi } = useApi();
    const [classes, setClasses] = useState<ClasseDtoF[]>([]);
    const [form] = useForm();
    const [debutAnneeScolaire, setDebutAnneeScolaire] = useState<number>(dayjs().year());
    const navigate = useNavigate();


    function doSearchClasses(values: any) {
        const anneeDebut: number = values.anneeDebut;
        const anneeFin: number = anneeDebut + 1;
        setApiCallDefinition({ method: "GET", url: CLASSES_ENDPOINT, params: { anneeDebut, anneeFin } });
    }

    function getActionsClasseButtons(classe: ClasseDtoF) {
        return (
            <>
                <Tooltip title="Consulter la classe" color="geekblue">
                    <Button type="primary" icon={<EyeOutlined />} onClick={() => navigate(`/classes/${classe.id}`)} />
                </Tooltip>
            </>
        );
    }

    const getClasseView = (classe: ClasseDtoF) => {
        return (
            <Col span={6} key={"col_" + classe.id}>
                <Card size="small" title={classe.libelle} extra={getActionsClasseButtons(classe)} style={{ width: 350 }} key={classe.id} bordered={false}>
                    <p><b>Niveau: </b>{classe.niveau}</p>
                    <p><b>Nombre d'élèves: </b>{classe.liensClasseEleves?.length ?? 0}</p>
                </Card>
            </Col>
        );
    };

    function getClassesContent() {
        return (
            <>
                <Divider orientation="left">Mes classes</Divider>
                <Row gutter={[16, 32]}>
                    {classes && classes.map((classe: ClasseDtoF) => getClasseView(classe))}
                    {classes.length === 0 && <Empty description="Aucune classe pour l'année sélectionnée" style={{ marginTop: 20 }}></Empty>}
                </Row>
            </>
        );
    }

    useEffect(() => {
        setApiCallDefinition({ method: "GET", url: CLASSES_ENDPOINT, params: { anneeDebut: debutAnneeScolaire, anneeFin: debutAnneeScolaire + 1 } });
    }, []);

    const apiCallbacks: ApiCallbacks = {
        [`GET:${CLASSES_ENDPOINT}`]: (result: any) => {
            const classesB = result as ClasseDtoB[];
            const classesF = classesB.map(classe => prepareClasseBeforeForm(classe));
            setClasses(classesF);
        },
    };

    useEffect(() => {
        const { method, url } = { ...apiCallDefinition };
        if (method && url) {
            const callBack = handleApiCall(method, url, apiCallbacks);
            if (callBack) {
                callBack(result);
            }
        }
    }, [result]);

    return isAuthenticated ? (
        <>
            <div className="centered-content">
                <div className="container-full-width">
                    <h2 className="classes-title">
                        {<EditOutlined />} Gestions de mes classes
                    </h2>
                </div>
            </div>
            <div className="main-content-classes">
                <Form form={form}
                    onFinish={doSearchClasses}
                    initialValues={{ anneeDebut: dayjs().year() }}>
                    <Row gutter={[16, 32]}>
                        <Col span={4}>
                            <InputNumberFormItem
                                name="anneeDebut"
                                label="Année scolaire"
                                rules={[{ required: true, message: "Veuillez saisir une année scolaire" }]}
                            />
                        </Col>
                        <Col span={1}>
                            <Tooltip title="Rechercher les classes" color="geekblue"><Button type="primary" htmlType="submit" icon={<SearchOutlined />} /></Tooltip>
                        </Col>
                    </Row>
                </Form>
                {getClassesContent()}
            </div>
        </>
    ) : <div className="centered-content">Vous n'êtes pas autorisé à accéder à ce contenu. Veuillez vous connecter.</div>;
};

export default MesClasses;