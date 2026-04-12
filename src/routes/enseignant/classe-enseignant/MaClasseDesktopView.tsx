import { FunctionComponent } from 'react';
import { Button, Card, Col, Collapse, Divider, Form, Row, Select, Table, Tag, Tooltip } from 'antd';
import { AddCircleOutline, AddOutlined } from '@mui/icons-material';
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, EyeOutlined, FileExcelOutlined } from '@ant-design/icons';
import { MaClasseViewProps } from './types';
import { SwitchFormItem } from '../../../components/common/SwitchFormItem';
import { SelectFormItem } from '../../../components/common/SelectFormItem';
import { getResultatOptions } from '../../../components/common/commoninputs';
import { ColumnsType } from 'antd/es/table';
import { EleveEnrichedDto } from '../../../services/eleve';
import { FeuillePresenceDtoF } from '../../../services/classe';
import dayjs from 'dayjs';
import { APPLICATION_DATE_FORMAT, firstLettertoUpperCase } from '../../../utils/FormUtils';
import { CollapseProps } from 'antd/lib';
import { BulletinDtoF } from '../../../services/classe';

export const MaClasseDesktopView: FunctionComponent<MaClasseViewProps> = ({
    classe,
    elevesEnriched,
    feuillesPresence,
    bulletins,
    selectedEleveId,
    vueDetaille,
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
}) => {
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
            render: (value) => {
                return value ? <Tag color="green">Oui</Tag> : <Tag color="red">Non</Tag>;
            }
        },
        {
            title: "Rentre seul",
            key: "autorisationAutonomie",
            dataIndex: "autorisationAutonomie",
            render: (value) => {
                return value ? <Tag color="green">Oui</Tag> : <Tag color="red">Non</Tag>;
            }
        },
    ];

    const getListeEleves = (elevesAbsents: any[]) => {
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

    const columnsTableFeuillesPresence: ColumnsType<FeuillePresenceDtoF> = [
        {
            title: "Date",
            key: "date",
            render: (value, record) => {
                return dayjs(record.date, APPLICATION_DATE_FORMAT).format(APPLICATION_DATE_FORMAT);
            }
        },
        {
            title: "Elèves absents",
            key: "absents",
            render: (value, record) => {
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
            render: (value, record) => {
                const elevesPresents = record.presenceEleves.filter((presenceEleve) => presenceEleve.present);
                return (
                    <Tag color="green">{elevesPresents.length}</Tag>
                )
            }
        },
        {
            title: "",
            key: "actions",
            render: (value, record) => {
                return (
                    <>
                        <Button type="primary" icon={<EditOutlined />} onClick={() => onViewFeuille(record, false)} />
                        <Button className="m-left-10" type="primary" icon={<DeleteOutlined />} onClick={() => onDeleteFeuille(record)} danger />
                    </>
                );
            }
        },
    ];

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
            render: (value, record) => {
                return (
                    <Select style={{ width: "100%" }} value={record.resultat} options={getResultatOptions()} onChange={(value) => onModifierResultat(record.id, value)} />
                )
            }
        }
    ];

    const columnsTableBulletins: ColumnsType<BulletinDtoF> = [
        {
            title: "Mois",
            key: "nom",
            render: (value, record) => {
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
            render: (value, record) => {
                return <>
                    <Button type="primary" icon={<EditOutlined />} onClick={() => onModifierBulletin(record.id!)} />
                    <Button type="primary" icon={<DeleteOutlined />} onClick={() => onDeleteBulletin(record.id!)} danger className="m-left-10" />
                    {getBulletinPdfButton(record.id!)}
                </>;
            }
        }
    ];

    function formatTotal(total: number) {
        return (<Tag color="geekblue">Total : <strong>{total}</strong></Tag>);
    }

    const getInformationGeneralesContent = () => {
        return (
            <div style={{ textAlign: "center" }}>
                <Divider orientation="left">Informations générales</Divider>
                <Row>
                    <Col span={8}>
                        <Form.Item label="Enseignant(s)">
                            {classe?.enseignants && classe.enseignants.length > 0
                                ? classe.enseignants.map((e, idx) => (
                                    <Tag color="geekblue" key={idx}>{e.nomPrenom}</Tag>
                                ))
                                : <Tag color="geekblue">-</Tag>
                            }
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

    const getFeuillePresenceContent = () => {
        return (
            <div style={{ textAlign: "center" }}>
                <h3 style={{ color: 'rgba(0, 0, 0, 0.85)' }}>Listes des feuilles de présences pour cette classe</h3>
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

    const getResultatAnnuelContent = () => {
        return (
            <div style={{ textAlign: "center" }}>
                <h3 style={{ color: 'rgba(0, 0, 0, 0.85)' }}>Résultats annuels</h3>
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

    const getBulletinsContent = () => {
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
    };

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

    return (
        <div className="classe-container">
            <div>
                <Card title="Informations générales" bordered={false} style={{ width: "100%" }} size="small">
                    {getInformationGeneralesContent()}
                </Card>
            </div>
            <div>
                <Collapse accordion defaultActiveKey={["1"]} items={collapseItems} />
            </div>
        </div>
    );
};
