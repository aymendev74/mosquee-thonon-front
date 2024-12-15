import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/AuthContext';
import { EditOutlined } from '@ant-design/icons';
import useApi from '../../../hooks/useApi';
import { ApiCallbacks, EXISTING_CLASSES_ENDPOINT, handleApiCall, buildUrlWithParams, FEUILLE_PRESENCE_ENDPOINT } from '../../../services/services';
import { Button, Col, Collapse, Divider, Row, Table, Tag, Tooltip } from 'antd';
import { ClasseDtoB, ClasseDtoF, FeuillePresenceDtoB, FeuillePresenceDtoF, PresenceEleveDto } from '../../../services/classe';
import { APPLICATION_DATE_FORMAT, prepareClasseBeforeForm, prepareFeuillePresenceBeforeForm } from '../../../utils/FormUtils';
import { AddCircle, AddCircleOutline, AddOutlined } from '@mui/icons-material';
import { ModalFeuillePresence } from '../../modals/ModalFeuillePresence';
import { useParams } from 'react-router-dom';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { get } from 'lodash';
import { CollapseProps } from 'antd/lib';

const MaClasse = () => {
    const { isAuthenticated } = useAuth();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi } = useApi();
    const [modalFeuillePresenceOpen, setModalFeuillePresenceOpen] = useState(false);
    const [classe, setClasse] = useState<ClasseDtoF | undefined>();
    const [feuillesPresence, setFeuillesPresence] = useState<FeuillePresenceDtoF[]>([]);
    const [feuilleToEdit, setFeuilleToEdit] = useState<FeuillePresenceDtoF | undefined>();
    const { id } = useParams();

    function onCreateFeuillePresence() {
        setFeuilleToEdit(undefined);
        setModalFeuillePresenceOpen(true);
    }

    useEffect(() => {
        if (!modalFeuillePresenceOpen) {
            setApiCallDefinition({ method: "GET", url: buildUrlWithParams(EXISTING_CLASSES_ENDPOINT, { id }) });
        }
    }, [modalFeuillePresenceOpen]);

    const apiCallbacks: ApiCallbacks = {
        [`GET:${EXISTING_CLASSES_ENDPOINT}`]: (result: any) => {
            const classesF = prepareClasseBeforeForm(result as ClasseDtoB);
            setClasse(classesF);
            setApiCallDefinition({ method: "GET", url: buildUrlWithParams(FEUILLE_PRESENCE_ENDPOINT, { id }) });
        },
        [`GET:${FEUILLE_PRESENCE_ENDPOINT}`]: (result: any) => {
            const feuillesPresencesB = result as FeuillePresenceDtoB[];
            setFeuillesPresence(feuillesPresencesB.map((feuillePresence) => prepareFeuillePresenceBeforeForm(feuillePresence)));
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

    function getListeEleves(elevesAbsents: PresenceEleveDto[]) {
        return elevesAbsents.map((eleve) =>
            classe?.liensClasseEleves?.filter((liensEleve) => liensEleve.eleve.id === eleve.idEleve)
                .map((liensEleve, index) => (
                    <span key={index}>
                        {liensEleve.eleve.prenom} {liensEleve.eleve.nom}
                        <br />
                    </span>
                )
                )
        );
    };

    function onModifierFeuille(feuillePresence: FeuillePresenceDtoF) {
        setFeuilleToEdit(feuillePresence);
        setModalFeuillePresenceOpen(true);
    }

    const columnsTableFeuillesPresence: ColumnsType<FeuillePresenceDtoF> = [
        {
            title: "Date",
            key: "date",
            render: (value, record, index) => {
                return dayjs(record.date, APPLICATION_DATE_FORMAT).format(APPLICATION_DATE_FORMAT);
            }
        },
        {
            title: "Elèves absents",
            key: "absents",
            render: (value, record, index) => {
                const elevesAbsents = record.presenceEleves.filter((presenceEleve) => !presenceEleve.present);
                return (
                    <Tooltip title={getListeEleves(elevesAbsents)} color="geekblue">
                        <Tag color="red">{elevesAbsents.length}</Tag>
                    </Tooltip>
                );
            }
        },
        {
            title: "Elèves présent",
            key: "presents",
            render: (value, record, index) => {
                const elevesPresents = record.presenceEleves.filter((presenceEleve) => presenceEleve.present);
                return (
                    <Tag color="green">{elevesPresents.length}</Tag>
                )
            }
        },
        {
            title: "",
            key: "modifier",
            render: (value, record, index) => {
                return (
                    <Button type="primary" icon={<EditOutlined />} onClick={() => onModifierFeuille(record)} />
                )
            }
        },
    ];

    function getFeuillePresenceContent() {
        return (
            <div style={{ textAlign: "center" }}>
                <Button type="primary" icon={<AddCircleOutline />} className="m-bottom-10" onClick={onCreateFeuillePresence}>Nouvelle feuille</Button>
                <div style={{ width: "50%", margin: "0 auto", textAlign: "center" }}>
                    <Table dataSource={feuillesPresence}
                        columns={columnsTableFeuillesPresence}
                        pagination={{ pageSize: 10 }}
                        rowKey={record => record.date?.millisecond.toString()} />
                </div>
            </div>
        );
    };

    function getResultatAnnuelContent() {
        return (
            <>
            </>
        );
    };

    const collapseItems: CollapseProps["items"] = [
        {
            key: "1",
            label: "Feuilles de présence",
            children: getFeuillePresenceContent(),
        },
        {
            key: "2",
            label: "Résultats annuels",
            children: getResultatAnnuelContent(),
        }
    ];


    return isAuthenticated ? (
        <>
            <div className="centered-content">
                <div className="container-full-width">
                    <h2 className="classes-title">
                        {<EditOutlined />} {classe?.libelle}
                    </h2>
                </div>
            </div>
            <div>
                <ModalFeuillePresence open={modalFeuillePresenceOpen} setOpen={setModalFeuillePresenceOpen} classe={classe}
                    feuilleToEdit={feuilleToEdit} />
                <Collapse defaultActiveKey={['1']} bordered={false} items={collapseItems} />
            </div>
        </>
    ) : <div className="centered-content">Vous n'êtes pas autorisé à accéder à ce contenu. Veuillez vous connecter.</div>;
};

export default MaClasse;