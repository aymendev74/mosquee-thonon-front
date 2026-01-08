import { FunctionComponent } from 'react';
import { Button, Card, Col, Collapse, Divider, Form, Row, Select, Tag, Tooltip } from 'antd';
import { AddCircleOutline, AddOutlined } from '@mui/icons-material';
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, EyeOutlined, FileExcelOutlined } from '@ant-design/icons';
import { MaClasseViewProps } from './types';
import { SelectFormItem } from '../../../common/SelectFormItem';
import { getResultatOptions } from '../../../common/commoninputs';
import dayjs from 'dayjs';
import { APPLICATION_DATE_FORMAT, firstLettertoUpperCase } from '../../../../utils/FormUtils';
import { CollapseProps } from 'antd/lib';

export const MaClasseMobileView: FunctionComponent<MaClasseViewProps> = ({
    classe,
    elevesEnriched,
    feuillesPresence,
    bulletins,
    selectedEleveId,
    bulletinsPdf,
    onCreateFeuillePresence,
    onViewFeuille,
    onDeleteFeuille,
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
    const getInformationGeneralesContent = () => {
        return (
            <div style={{ padding: '16px' }}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <div style={{ marginBottom: '12px' }}>
                            <strong>Enseignant:</strong>
                            <Tag color="geekblue" style={{ marginLeft: '8px' }}>{classe?.nomPrenomEnseignant ?? "-"}</Tag>
                        </div>
                    </Col>
                    <Col span={24}>
                        <div style={{ marginBottom: '12px' }}>
                            <strong>Jour de classe:</strong>
                            <Tag color="geekblue" style={{ marginLeft: '8px' }}>{getJourClasse()}</Tag>
                        </div>
                    </Col>
                    <Col span={24}>
                        <div style={{ marginBottom: '12px' }}>
                            <strong>Nombre d'élèves:</strong>
                            <Tag color="geekblue" style={{ marginLeft: '8px' }}>{elevesEnriched.length}</Tag>
                        </div>
                    </Col>
                    <Col span={24}>
                        <div style={{ marginBottom: '12px' }}>
                            <strong>Taux de réussite:</strong>
                            <Tag color="geekblue" style={{ marginLeft: '8px' }}>{getTauxReussite()}</Tag>
                        </div>
                    </Col>
                </Row>

                <Divider orientation="left">Effectif</Divider>
                <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                    <Col span={24}>
                        <Button type="primary" icon={<FileExcelOutlined />} onClick={exportData} block>
                            Exporter la liste
                        </Button>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    {elevesEnriched.map((eleve) => (
                        <Col span={24} key={eleve.id}>
                            <Card size="small" style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>{eleve.nom} {eleve.prenom}</strong>
                                        <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                                            <span><strong>Niveau:</strong> {eleve.niveauInterne}</span>
                                            <br />
                                            <span><strong>Né(e) le:</strong> {eleve.dateNaissance}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        );
    };

    const getFeuillePresenceContent = () => {
        return (
            <div style={{ padding: '16px' }}>
                <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                    <Col span={24}>
                        <Button type="primary" icon={<AddCircleOutline />} onClick={onCreateFeuillePresence} block>
                            Nouvelle feuille
                        </Button>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    {feuillesPresence.map((feuille) => {
                        const elevesAbsents = feuille.presenceEleves.filter((p) => !p.present);
                        const elevesPresents = feuille.presenceEleves.filter((p) => p.present);
                        
                        return (
                            <Col span={24} key={feuille.id}>
                                <Card 
                                    size="small" 
                                    style={{ marginBottom: '8px' }}
                                    title={dayjs(feuille.date, APPLICATION_DATE_FORMAT).format(APPLICATION_DATE_FORMAT)}
                                    extra={
                                        <Button 
                                            type="primary" 
                                            icon={<EyeOutlined />} 
                                            onClick={() => onViewFeuille(feuille, true)}
                                            size="small"
                                        />
                                    }
                                >
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div>
                                            <strong>Présents:</strong>
                                            <Tag color="green" style={{ marginLeft: '8px' }}>{elevesPresents.length}</Tag>
                                        </div>
                                        <div>
                                            <strong>Absents:</strong>
                                            <Tag color="red" style={{ marginLeft: '8px' }}>{elevesAbsents.length}</Tag>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        );
    };

    const getResultatAnnuelContent = () => {
        return (
            <div style={{ padding: '16px' }}>
                <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                    <Col span={24}>
                        <Button type="primary" icon={<CheckCircleOutlined />} onClick={onEnregistrerResultat} block>
                            Enregistrer les résultats
                        </Button>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    {elevesEnriched.map((eleve) => (
                        <Col span={24} key={eleve.id}>
                            <Card size="small" style={{ marginBottom: '8px' }}>
                                <div style={{ marginBottom: '8px' }}>
                                    <strong>{eleve.nom} {eleve.prenom}</strong>
                                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                        Niveau: {eleve.niveauInterne}
                                    </div>
                                </div>
                                <Select 
                                    style={{ width: '100%' }} 
                                    value={eleve.resultat} 
                                    options={getResultatOptions()} 
                                    onChange={(value) => onModifierResultat(eleve.id, value)} 
                                    placeholder="Sélectionner un résultat"
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        );
    };

    const getBulletinsContent = () => {
        return (
            <div style={{ padding: '16px' }}>
                <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                    <Col span={24}>
                        <SelectFormItem 
                            name="eleveid" 
                            label="Élève" 
                            options={elevesEnriched.map(eleve => ({ 
                                value: eleve.id, 
                                label: `${eleve.prenom} ${eleve.nom}` 
                            }))}
                            onChange={loadBulletinsEleve} 
                        />
                    </Col>
                    <Col span={24}>
                        <Button 
                            icon={<AddOutlined />} 
                            type="primary" 
                            disabled={!selectedEleveId} 
                            onClick={onCreerBulletin}
                            block
                        >
                            Créer un bulletin
                        </Button>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    {bulletins.map((bulletin) => (
                        <Col span={24} key={bulletin.id}>
                            <Card 
                                size="small" 
                                style={{ marginBottom: '8px' }}
                                title={`${firstLettertoUpperCase(dayjs().month(bulletin.mois! - 1).format("MMMM"))} ${bulletin.annee}`}
                            >
                                <div style={{ marginBottom: '12px' }}>
                                    <strong>Absences:</strong>
                                    <Tag color="orange" style={{ marginLeft: '8px' }}>{bulletin.nbAbsences}</Tag>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button 
                                        type="primary" 
                                        icon={<EditOutlined />} 
                                        onClick={() => onModifierBulletin(bulletin.id!)}
                                        size="small"
                                    />
                                    <Button 
                                        type="primary" 
                                        icon={<DeleteOutlined />} 
                                        onClick={() => onDeleteBulletin(bulletin.id!)} 
                                        danger
                                        size="small"
                                    />
                                    {getBulletinPdfButton(bulletin.id!)}
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        );
    };

    const collapseItems: CollapseProps["items"] = [
        {
            key: "1",
            label: "Informations générales",
            children: getInformationGeneralesContent(),
        },
        {
            key: "2",
            label: "Feuilles de présence",
            children: getFeuillePresenceContent(),
        },
        {
            key: "3",
            label: "Bulletins",
            children: getBulletinsContent(),
        },
        {
            key: "4",
            label: "Résultats annuels",
            children: getResultatAnnuelContent(),
        }
    ];

    return (
        <div style={{ padding: '16px' }}>
            <div style={{ 
                backgroundColor: '#001529', 
                color: 'white', 
                padding: '16px',
                marginBottom: '16px',
                borderRadius: '8px'
            }}>
                <h2 style={{ margin: 0, color: 'white', fontSize: '16px' }}>
                    {classe?.libelle} - {classe?.niveau}
                </h2>
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                    {classe?.debutAnneeScolaire} / {classe?.finAnneeScolaire}
                </div>
            </div>

            <Collapse accordion defaultActiveKey={["1"]} items={collapseItems} />
        </div>
    );
};
