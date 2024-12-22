import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../hooks/AuthContext';
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, FileOutlined } from '@ant-design/icons';
import useApi from '../../../hooks/useApi';
import { ApiCallbacks, EXISTING_CLASSES_ENDPOINT, handleApiCall, buildUrlWithParams, FEUILLE_PRESENCE_ENDPOINT, ELEVES_ENRICHED_ENDPOINT, ELEVES_ENDPOINT, EXISTING_FEUILLE_PRESENCE_ENDPOINT } from '../../../services/services';
import { Button, Card, Col, Collapse, Divider, Form, notification, Row, Select, Splitter, Switch, Table, Tag, Tooltip } from 'antd';
import { ClasseDtoB, ClasseDtoF, FeuillePresenceDtoB, FeuillePresenceDtoF, PresenceEleveDto } from '../../../services/classe';
import exportToExcel, { APPLICATION_DATE_FORMAT, ExcelColumnHeadersType, prepareClasseBeforeForm, prepareFeuillePresenceBeforeForm } from '../../../utils/FormUtils';
import { AddCircleOutline } from '@mui/icons-material';
import { ModalFeuillePresence } from '../../modals/ModalFeuillePresence';
import { useParams } from 'react-router-dom';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { CollapseProps } from 'antd/lib';
import { EleveEnrichedDto, PatchEleve, ResultatEnum } from '../../../services/eleve';
import { SwitchFormItem } from '../../common/SwitchFormItem';
import { getJourActiviteOptions, getResultatOptions } from '../../common/commoninputs';

const MaClasse = () => {
    const { isAuthenticated } = useAuth();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi } = useApi();
    const [modalFeuillePresenceOpen, setModalFeuillePresenceOpen] = useState(false);
    const [classe, setClasse] = useState<ClasseDtoF | undefined>();
    const [feuillesPresence, setFeuillesPresence] = useState<FeuillePresenceDtoF[]>([]);
    const [feuilleToEdit, setFeuilleToEdit] = useState<FeuillePresenceDtoF | undefined>();
    const [elevesEnriched, setElevesEnriched] = useState<EleveEnrichedDto[]>([]);
    const [vueDetaille, setVueDetaille] = useState(false);
    const [form] = Form.useForm();
    const splitterRef = useRef<HTMLDivElement | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [infoGeneralViewSize, setInfoGeneralViewSize] = useState<number>(40);
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

    useEffect(() => {
        const updateContainerWidth = () => {
            if (splitterRef.current) {
                setContainerWidth(splitterRef.current.offsetWidth);
            }
        };
        updateContainerWidth();
        window.addEventListener("resize", updateContainerWidth); // Responsive
        return () => window.removeEventListener("resize", updateContainerWidth);
    }, []);

    function getJourClasse() {
        if (classe?.activites) {
            const jour = classe.activites[0].jour;
            return getJourActiviteOptions().find((option) => option.value === jour)?.label;
        }
        return "";
    }

    const apiCallbacks: ApiCallbacks = {
        [`GET:${EXISTING_CLASSES_ENDPOINT}`]: (result: any) => {
            const classesF = prepareClasseBeforeForm(result as ClasseDtoB);
            setClasse(classesF);
            setApiCallDefinition({ method: "GET", url: buildUrlWithParams(FEUILLE_PRESENCE_ENDPOINT, { id }) });

        },
        [`GET:${FEUILLE_PRESENCE_ENDPOINT}`]: (result: any) => {
            const feuillesPresencesB = result as FeuillePresenceDtoB[];
            setFeuillesPresence(feuillesPresencesB.map((feuillePresence) => prepareFeuillePresenceBeforeForm(feuillePresence)));
            setApiCallDefinition({ method: "GET", url: ELEVES_ENRICHED_ENDPOINT, params: { idClasse: id } });
        },
        [`GET:${ELEVES_ENRICHED_ENDPOINT}`]: (result: any) => {
            const eleves = result as EleveEnrichedDto[];
            setElevesEnriched(eleves);
            resetApi();
        },
        [`PATCH:${ELEVES_ENDPOINT}`]: (result: any) => {
            notification.success({ message: "Les résultats des élèves ont bien été enregistrés" });
            // on reload la classe entièrement pour raffraichir l'écran
            setApiCallDefinition({ method: "GET", url: buildUrlWithParams(EXISTING_CLASSES_ENDPOINT, { id }) });
        },
        [`DELETE:${EXISTING_FEUILLE_PRESENCE_ENDPOINT}`]: (result: any) => {
            notification.success({ message: "La feuille de temps a bien été supprimée" });
            setApiCallDefinition({ method: "GET", url: buildUrlWithParams(FEUILLE_PRESENCE_ENDPOINT, { id: classe?.id }) });
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
    };

    function onDeleteFeuille(feuillePresence: FeuillePresenceDtoF) {
        setApiCallDefinition({ method: "DELETE", url: buildUrlWithParams(EXISTING_FEUILLE_PRESENCE_ENDPOINT, { id: feuillePresence.id }) });
    };

    const columnsTableEffectif: ColumnsType<EleveEnrichedDto> = [
        {
            title: "Nom",
            key: "nom",
            dataIndex: "nom",
        },
        {
            title: "Prénom",
            key: "prenom",
            dataIndex: "prenom",
        },
        {
            title: "Date naissance",
            key: "dateNaissance",
            dataIndex: "dateNaissance",
        },
        {
            title: "Niveau",
            key: "niveauInterne",
            dataIndex: "niveauInterne",
        },
    ];

    const columnTableEffectifDetaille: ColumnsType<EleveEnrichedDto> = [
        ...columnsTableEffectif,
        {
            title: "Nom resp. légal",
            key: "nomResponsableLegal",
            dataIndex: "nomResponsableLegal",
        },
        {
            title: "Prénom resp. légal",
            key: "prenomResponsableLegal",
            dataIndex: "prenomResponsableLegal",
        },
        {
            title: "Mobile",
            key: "mobile",
            dataIndex: "mobile",
        },
        {
            title: "Nom contact urgence",
            key: "nomContactUrgence",
            dataIndex: "nomContactUrgence",
        },
        {
            title: "Prénom contact urgence",
            key: "prenomContactUrgence",
            dataIndex: "prenomContactUrgence",
        },
        {
            title: "Mobile",
            key: "mobileContactUrgence",
            dataIndex: "mobileContactUrgence",
        },
        {
            title: "Photos / Vidéos",
            key: "autorisationMedia",
            dataIndex: "autorisationMedia",
            render: (value, record, index) => {
                return value ? <Tag color="green">Oui</Tag> : <Tag color="red">Non</Tag>;
            }
        },
        {
            title: "Rentre seul",
            key: "autorisationAutonomie",
            dataIndex: "autorisationAutonomie",
            render: (value, record, index) => {
                return value ? <Tag color="green">Oui</Tag> : <Tag color="red">Non</Tag>;
            }
        },
    ];

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
                return elevesAbsents.length > 0 ? (
                    <Tooltip title={getListeEleves(elevesAbsents)} color="geekblue">
                        <Tag color="red">{elevesAbsents.length}</Tag>
                    </Tooltip>
                ) : (
                    <Tag color="red">{elevesAbsents.length}</Tag>
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
            key: "actions",
            render: (value, record, index) => {
                return (
                    <>
                        <Button type="primary" icon={<EditOutlined />} onClick={() => onModifierFeuille(record)} />
                        <Button className="m-left-10" type="primary" icon={<DeleteOutlined />} onClick={() => onDeleteFeuille(record)} danger />
                    </>
                )
            }
        },
    ];

    function onModifierResultat(eleveId: number, resultat: ResultatEnum) {
        setElevesEnriched(elevesEnriched.map((eleveEnriched) => eleveEnriched.id === eleveId ? { ...eleveEnriched, resultat } : eleveEnriched));
    }

    const columnsTableResultats: ColumnsType<EleveEnrichedDto> = [
        {
            title: "Nom",
            key: "nom",
            dataIndex: "nom",
        },
        {
            title: "Prénom",
            key: "prenom",
            dataIndex: "prenom",
        },
        {
            title: "Niveau",
            key: "niveauInterne",
            dataIndex: "niveauInterne",
        },
        {
            title: "Résultat",
            key: "resultat",
            render: (value, record, index) => {
                return (
                    <Select style={{ width: "100%" }} value={record.resultat} options={getResultatOptions()} onChange={(value) => onModifierResultat(record.id, value)} />
                )
            }
        }
    ];

    const excelColumnHeaders: ExcelColumnHeadersType<EleveEnrichedDto> = { // commun aux cours adultes et enfant
        nom: "Nom",
        prenom: "Prénom",
        dateNaissance: "Date naissance",
        niveauInterne: "Niveau",
        nomResponsableLegal: "Nom resp. légal",
        prenomResponsableLegal: "Prrenom resp. légal",
        mobile: "Tél.",
        nomContactUrgence: "Nom contact urgence",
        prenomContactUrgence: "Prrenom contact urgence",
        mobileContactUrgence: "Tél. contact urgence",
        autorisationMedia: "Autor. photos/vidéos",
        autorisationAutonomie: "Autor. à rentrer seul",
    };

    const exportData = () => {
        if (elevesEnriched) {
            exportToExcel<EleveEnrichedDto>(elevesEnriched, excelColumnHeaders, `eleves_${classe?.libelle}`);
        }
    };

    function formatTotal(total: number) {
        return (<Tag color="geekblue">Total : <strong>{total}</strong></Tag>);
    }

    function onEnregistrerResultat() {
        if (elevesEnriched.length > 0) {
            const patchesEleves: PatchEleve[] = elevesEnriched.map(eleve => ({ id: eleve.id, resultat: eleve.resultat }));
            setApiCallDefinition({ method: "PATCH", url: ELEVES_ENDPOINT, data: { eleves: patchesEleves } });
        }
    };

    function onVueDetailleSwitch(checked: boolean) {
        setVueDetaille(checked);
        const classeContainerDiv = document.querySelector('.classe-container') as HTMLDivElement;
        if (classeContainerDiv) {
            if (checked) {
                classeContainerDiv.style.gridTemplateColumns = '70% 1fr';
            } else {
                classeContainerDiv.style.gridTemplateColumns = '40% 1fr';
            }
        }
    };

    function getTauxReussite() {
        const eleveSansResultat = elevesEnriched.find(eleve => !eleve.resultat);
        if (eleveSansResultat) {
            return <Tooltip title="Le taux de réussite est calculé lorsque les résultats de tous les élèves sont saisis">Pas disponible</Tooltip>
        } else {
            const eleveNiveauAcquis = elevesEnriched.filter(eleve => eleve.resultat == ResultatEnum.ACQUIS).length;
            const eleveNiveauNonAcquis = elevesEnriched.filter(eleve => eleve.resultat == ResultatEnum.NON_ACQUIS).length;
            return `${(eleveNiveauAcquis / (eleveNiveauAcquis + eleveNiveauNonAcquis) * 100).toFixed(2)}%`;
        }
    }

    function getInformationGeneralesContent() {
        return (
            <div style={{ textAlign: "center" }}>
                <Divider orientation="left">Informations générales</Divider>
                <Row gutter={[16, 32]}>
                    <Col span={8}>
                        <Form.Item label="Jour de classe">
                            <Tag color="geekblue">{getJourClasse()}</Tag>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={6}>
                        <Form.Item label="Nombre d'élèves">
                            <Tag color="geekblue">{elevesEnriched.length}</Tag>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={7}>
                        <Form.Item label="Taux de réussite">
                            <Tag color="geekblue">{getTauxReussite()}</Tag>
                        </Form.Item>
                    </Col>
                </Row>
                <Divider orientation="left">Effectif</Divider>
                <Row gutter={[16, 32]}>
                    <Col span={6}>
                        <SwitchFormItem name="vueDetaille" value={vueDetaille} onChange={onVueDetailleSwitch} label="Vue détaillée" />
                    </Col>
                    <Col span={3}>
                        <Tooltip title="Exporter la listes des élèves au format Excel" color="geekblue">
                            <Button type="primary" icon={<FileOutlined />} onClick={exportData}>Exporter</Button>
                        </Tooltip>
                    </Col>
                </Row>
                <div>
                    <Table dataSource={elevesEnriched}
                        columns={vueDetaille ? columnTableEffectifDetaille : columnsTableEffectif}
                        pagination={{ pageSize: 5, showTotal: formatTotal }}
                        rowKey={record => record.id} />
                </div>
            </div>
        );
    };

    function getFeuillePresenceContent() {
        return (
            <div style={{ textAlign: "center" }}>
                <h3>Listes des feuilles de présences pour cette classe</h3>
                <div style={{ width: "50%", margin: "0 auto", textAlign: "center" }}>
                    <Table dataSource={feuillesPresence}
                        columns={columnsTableFeuillesPresence}
                        pagination={{ pageSize: 5, showTotal: formatTotal }}
                        rowKey={record => record.date?.millisecond.toString()} />
                </div>
                <Button type="primary" icon={<AddCircleOutline />} className="m-bottom-15 m-top-15" onClick={onCreateFeuillePresence}>Nouvelle feuille</Button>
            </div>
        );
    };

    function getResultatAnnuelContent() {
        return (
            <div style={{ textAlign: "center" }}>
                <h3>Résultats annuels</h3>
                <div style={{ width: "50%", margin: "0 auto", textAlign: "center" }}>
                    <Table dataSource={elevesEnriched}
                        columns={columnsTableResultats}
                        pagination={{ pageSize: 5, showTotal: formatTotal }}
                        rowKey={record => record.id} />
                </div>
                <Button type="primary" icon={<CheckCircleOutlined />} className="m-bottom-15 m-top-15" onClick={onEnregistrerResultat}>Enregistrer</Button>
            </div>
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
                        {<EditOutlined />} {classe?.libelle} - {classe?.niveau} - {classe?.debutAnneeScolaire} / {classe?.finAnneeScolaire}
                    </h2>
                </div>
            </div>
            <div className="classe-container">
                <div>
                    <Card title="Informations générales" bordered={false} style={{ width: "100%" }} size="small">
                        {getInformationGeneralesContent()}
                    </Card>
                </div>
                <div>
                    <ModalFeuillePresence open={modalFeuillePresenceOpen} setOpen={setModalFeuillePresenceOpen} classe={classe}
                        feuilleToEdit={feuilleToEdit} />
                    <Collapse accordion defaultActiveKey={["1"]} items={collapseItems} />
                </div>
            </div>
        </>
    ) : <div className="centered-content">Vous n'êtes pas autorisé à accéder à ce contenu. Veuillez vous connecter.</div>;
};

export default MaClasse;