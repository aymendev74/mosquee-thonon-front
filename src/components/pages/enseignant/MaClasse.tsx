import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/AuthContext';
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, FileExcelOutlined, FilePdfOutlined, FilePdfTwoTone } from '@ant-design/icons';
import useApi from '../../../hooks/useApi';
import {
    ApiCallbacks, EXISTING_CLASSES_ENDPOINT, handleApiCall, buildUrlWithParams,
    FEUILLE_PRESENCE_ENDPOINT, ELEVES_ENRICHED_ENDPOINT, ELEVES_ENDPOINT, EXISTING_FEUILLE_PRESENCE_ENDPOINT,
    BULLETINS_ELEVE_ENDPOINT,
    BULLETIN_EXISTING_ENDPOINT,
    MATIERES_ENDPOINT
} from '../../../services/services';
import { Button, Card, Col, Collapse, Divider, Form, notification, Row, Select, Table, Tag, Tooltip } from 'antd';
import { BulletinDtoB, BulletinDtoF, ClasseDtoB, ClasseDtoF, FeuillePresenceDtoB, FeuillePresenceDtoF, PresenceEleveDto, TraductionDto, TypeMatiereEnum } from '../../../services/classe';
import exportToExcel, { APPLICATION_DATE_FORMAT, ExcelColumnHeadersType, prepareClasseBeforeForm, prepareFeuillePresenceBeforeForm, firstLettertoUpperCase, prepareBulletinBeforeForm } from '../../../utils/FormUtils';
import { AddCircleOutline, AddOutlined } from '@mui/icons-material';
import { ModalFeuillePresence } from '../../modals/ModalFeuillePresence';
import { useParams } from 'react-router-dom';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { CollapseProps } from 'antd/lib';
import { EleveEnrichedDto, PatchEleve, ResultatEnum } from '../../../services/eleve';
import { SwitchFormItem } from '../../common/SwitchFormItem';
import { getJourActiviteOptions, getResultatOptions } from '../../common/commoninputs';
import { UnahtorizedAccess } from '../UnahtorizedAccess';
import { SelectFormItem } from '../../common/SelectFormItem';
import { ModalBulletin } from '../../modals/ModalBulletin';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PdfAuthContextBridge } from '../../documents/PdfContextBridge';
import { PdfBulletin } from '../../documents/PdfBulletin';
import { useMatieresStore } from '../../stores/useMatieresStore';

const MaClasse = () => {
    const { username } = useAuth();
    const { execute } = useApi();
    const [modalFeuillePresenceOpen, setModalFeuillePresenceOpen] = useState(false);
    const [modalBulletinOpen, setModalBulletinOpen] = useState(false);
    const [classe, setClasse] = useState<ClasseDtoF | undefined>();
    const [feuillesPresence, setFeuillesPresence] = useState<FeuillePresenceDtoF[]>([]);
    const [feuilleToEdit, setFeuilleToEdit] = useState<FeuillePresenceDtoF | undefined>();
    const [elevesEnriched, setElevesEnriched] = useState<EleveEnrichedDto[]>([]);
    const [vueDetaille, setVueDetaille] = useState(false);
    const [bulletins, setBulletins] = useState<BulletinDtoF[]>([]);
    const [selectedEleveId, setSelectedEleveId] = useState<number | undefined>();
    const [bulletin, setBulletin] = useState<BulletinDtoF | undefined>();
    const [bulletinsPdf, setBulletinsPdf] = useState<number[]>([]);
    const { id } = useParams();
    const { getMatieresByType } = useMatieresStore();

    function onCreateFeuillePresence() {
        setFeuilleToEdit(undefined);
        setModalFeuillePresenceOpen(true);
    }

    async function loadClasse() {
        const { successData: classe } = await execute<ClasseDtoB>({ method: "GET", url: buildUrlWithParams(EXISTING_CLASSES_ENDPOINT, { id }) });
        if (classe) {
            const classesF = prepareClasseBeforeForm(classe);
            setClasse(classesF);
        }
    };

    async function loadFeuillesPresence() {
        const { successData: feuillesPresence } = await execute<FeuillePresenceDtoB[]>({ method: "GET", url: buildUrlWithParams(FEUILLE_PRESENCE_ENDPOINT, { id }) });
        if (feuillesPresence) {
            const feuillesPresenceF = feuillesPresence.map(feuille => prepareFeuillePresenceBeforeForm(feuille));
            setFeuillesPresence(feuillesPresenceF);
        }
    };

    async function loadElevesEnriched() {
        const { successData: elevesEnriched } = await execute<EleveEnrichedDto[]>({ method: "GET", url: ELEVES_ENRICHED_ENDPOINT, params: { idClasse: id } });
        if (elevesEnriched) {
            setElevesEnriched(elevesEnriched);
        }
    };

    useEffect(() => {
        if (!modalFeuillePresenceOpen) {
            loadClasse();
            loadFeuillesPresence();
            loadElevesEnriched();
        }
    }, [modalFeuillePresenceOpen]);

    useEffect(() => {
        const loadBulletinsEleve = async () => {
            const { successData: bulletins } = await execute<BulletinDtoB[]>({ method: "GET", url: buildUrlWithParams(BULLETINS_ELEVE_ENDPOINT, { id: selectedEleveId }) });
            if (bulletins) {
                let bulletinsF = bulletins.map((bulletin) => prepareBulletinBeforeForm(bulletin));
                setBulletins(bulletinsF);
            }
        }
        if (!modalBulletinOpen && selectedEleveId) {
            loadBulletinsEleve();
        }
    }, [modalBulletinOpen])

    function getJourClasse() {
        if (classe?.activites) {
            const jour = classe.activites[0].jour;
            return getJourActiviteOptions().find((option) => option.value === jour)?.label;
        }
        return "";
    }

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

    async function onDeleteFeuille(feuillePresence: FeuillePresenceDtoF) {
        const { success } = await execute({ method: "DELETE", url: buildUrlWithParams(EXISTING_FEUILLE_PRESENCE_ENDPOINT, { id: feuillePresence.id }) });
        if (success) {
            notification.success({ message: "La feuille de temps a bien été supprimée" });
            const { successData: feuillesPresencesB } = await execute<FeuillePresenceDtoB[]>({ method: "GET", url: buildUrlWithParams(FEUILLE_PRESENCE_ENDPOINT, { id: classe?.id }) });
            if (feuillesPresencesB) {
                setFeuillesPresence(feuillesPresencesB.map((feuillePresence) => prepareFeuillePresenceBeforeForm(feuillePresence)));
            }
            const { successData: elevesEnriched } = await execute<EleveEnrichedDto[]>({ method: "GET", url: ELEVES_ENRICHED_ENDPOINT, params: { idClasse: id } });
            if (elevesEnriched) {
                setElevesEnriched(elevesEnriched);
            }
        }
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

    async function onEnregistrerResultat() {
        if (elevesEnriched.length > 0) {
            const patchesEleves: PatchEleve[] = elevesEnriched.map(eleve => ({ id: eleve.id, resultat: eleve.resultat }));
            const { success } = await execute({ method: "PATCH", url: ELEVES_ENDPOINT, data: { eleves: patchesEleves } });
            if (success) {
                notification.success({ message: "Les résultats des élèves ont bien été enregistrés" });
            }
            loadClasse();
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
    };

    async function loadBulletinsEleve(eleveId: number) {
        setSelectedEleveId(eleveId);
        if (eleveId) {
            const { successData: bulletinsEleve } = await execute<BulletinDtoB[]>({ method: "GET", url: buildUrlWithParams(BULLETINS_ELEVE_ENDPOINT, { id: eleveId }) });
            if (bulletinsEleve) {
                let bulletinsF = bulletinsEleve.map((bulletin) => prepareBulletinBeforeForm(bulletin));
                setBulletins(bulletinsF);
            }

        } else {
            setBulletins([]);
        }
    }

    function getInformationGeneralesContent() {
        return (
            <div style={{ textAlign: "center" }}>
                <Divider orientation="left">Informations générales</Divider>
                <Row>
                    <Col span={8}>
                        <Form.Item label="Enseignant">
                            <Tag color="geekblue">{classe?.nomPrenomEnseignant ?? "-"}</Tag>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={8}>
                        <Form.Item label="Jour de classe">
                            <Tag color="geekblue">{getJourClasse()}</Tag>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={6}>
                        <Form.Item label="Nombre d'élèves">
                            <Tag color="geekblue">{elevesEnriched.length}</Tag>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={7}>
                        <Form.Item label="Taux de réussite">
                            <Tag color="geekblue">{getTauxReussite()}</Tag>
                        </Form.Item>
                    </Col>
                </Row>
                <Divider orientation="left">Effectif</Divider>
                <Row>
                    <Col span={6}>
                        <SwitchFormItem name="vueDetaille" value={vueDetaille} onChange={onVueDetailleSwitch} label="Vue détaillée" />
                    </Col>
                    <Col span={3}>
                        <Tooltip title="Exporter la listes des élèves au format Excel" color="geekblue">
                            <Button type="primary" icon={<FileExcelOutlined />} onClick={exportData}>Exporter</Button>
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

    function onModifierBulletin(bulletinId: number) {
        setModalBulletinOpen(true);
        setBulletin(bulletins.find(bulletin => bulletin.id === bulletinId));
    };

    async function onDeleteBulletin(bulletinId: number) {
        const { success } = await execute({ method: "DELETE", url: buildUrlWithParams(BULLETIN_EXISTING_ENDPOINT, { id: bulletinId }) });
        if (success) {
            notification.success({ message: "Le bulletin a bien été supprimé" });
        }
        if (selectedEleveId) {
            loadBulletinsEleve(selectedEleveId);
        }
    };

    const getBulletinById = (id: number) => bulletins.find(bulletin => bulletin.id === id);

    const getBulletinPdfButton = (id: number) => {
        return bulletinsPdf.some(idBulletin => idBulletin === id) ?
            (
                <PDFDownloadLink className="m-left-10" document={<PdfAuthContextBridge>
                    <PdfBulletin bulletin={getBulletinById(id)!}
                        eleve={elevesEnriched.find(eleve => eleve.id === getBulletinById(id)?.idEleve)!} matieres={getMatieresByType(TypeMatiereEnum.ENFANT)}
                        nomPrenomEnseignant={classe?.nomPrenomEnseignant ?? ""} nomClasse={classe?.libelle ?? ""} />
                </PdfAuthContextBridge>}
                    fileName="bulletin">
                    {({ blob, url, loading, error }) => {
                        return loading ? "Génération Pdf..." : <FilePdfTwoTone />
                    }
                    }
                </PDFDownloadLink>) : (<Button className="m-left-10" type="primary" onClick={() => { setBulletinsPdf([...bulletinsPdf, id]) }} icon={<FilePdfTwoTone />} />)
    }

    function onCreerBulletin() {
        setModalBulletinOpen(true);
        setBulletin({ idEleve: selectedEleveId! });
    }

    const columnsTableBulletins: ColumnsType<BulletinDtoF> = [
        {
            title: "Mois",
            key: "nom",
            render: (value, record, index) => {
                return (
                    <span>{firstLettertoUpperCase(dayjs().month(record.mois! - 1).format("MMMM"))}</span>
                )
            },
        },
        {
            title: "Année",
            key: "annee",
            dataIndex: "annee",
        },
        {
            title: "Absences",
            key: "nbAbsences",
            dataIndex: "nbAbsences",
        },
        {
            title: "",
            key: "actions",
            render: (value, record, index) => {
                return <>
                    <Button type="primary" icon={<EditOutlined />} onClick={() => onModifierBulletin(record.id!)} />
                    <Button type="primary" icon={<DeleteOutlined />} onClick={() => onDeleteBulletin(record.id!)} danger className="m-left-10" />
                    <Tooltip color="geekblue" title="Générer le bulletin au format PDF">
                        {getBulletinPdfButton(record.id!)}
                    </Tooltip>
                </>;
            }
        }
    ];

    function getBulletinsContent() {
        return (
            <div style={{ textAlign: "center" }}>
                <div style={{ width: "80%", margin: "0 auto", textAlign: "center" }}>
                    <Row>
                        <Col span={8}>
                            <SelectFormItem name="eleveid" label="Elève" options={elevesEnriched.map(eleve => ({ value: eleve.id, label: `${eleve.prenom} ${eleve.nom}` }))}
                                onChange={loadBulletinsEleve} />
                        </Col>
                        <Col span={2}>
                            <Tooltip title="Créer un nouveau bulletin pour cet élève" color="geekblue">
                                <Button icon={<AddOutlined />} type="primary" className="m-left-10" disabled={!selectedEleveId} onClick={onCreerBulletin} />
                            </Tooltip>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Table dataSource={bulletins}
                                columns={columnsTableBulletins}
                                pagination={{ pageSize: 5, showTotal: formatTotal }}
                                rowKey={record => record.mois! + record.annee!} />
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }

    const collapseItems: CollapseProps["items"] = [
        {
            key: "1",
            label: "Feuilles de présence",
            children: getFeuillePresenceContent(),
        },
        {
            key: "2",
            label: "Bulletins",
            children: getBulletinsContent(),
        },
        {
            key: "3",
            label: "Résultats annuels",
            children: getResultatAnnuelContent(),
        }
    ];

    function getSelectedEleve() {
        return elevesEnriched.find(eleve => eleve.id === selectedEleveId);
    }

    return username ? (
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
                    <ModalBulletin open={modalBulletinOpen} setOpen={setModalBulletinOpen} isCreation={bulletin?.id === undefined}
                        annees={[classe?.debutAnneeScolaire!, classe?.finAnneeScolaire!]} eleve={getSelectedEleve()}
                        bulletin={bulletin} />
                    <Collapse accordion defaultActiveKey={["1"]} items={collapseItems} />
                </div>
            </div>
        </>
    ) : <UnahtorizedAccess />
};

export default MaClasse;