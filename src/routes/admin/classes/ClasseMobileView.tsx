import { FunctionComponent } from "react";
import { Button, Card, Col, Divider, Empty, Form, Row, Tag, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, PlusCircleOutlined, SearchOutlined, TeamOutlined } from "@ant-design/icons";
import { ClasseViewProps } from "./types";
import { InputNumberFormItem } from "../../../components/common/InputNumberFormItem";
import { ClasseDtoF } from "../../../services/classe";
import dayjs from "dayjs";

export const ClasseMobileView: FunctionComponent<ClasseViewProps> = ({
    form,
    classes,
    onCreateClasse,
    onModifierClasse,
    onDeleteClasse,
    doSearchClasses,
    handleAnneeScolaireChanged,
}) => {
    const getEnseignantsDisplay = (classe: ClasseDtoF) => {
        if (!classe.enseignants || classe.enseignants.length === 0) {
            return "-";
        }
        return classe.enseignants.map(e => e.nomPrenom).join(", ");
    };

    const getClasseCard = (classe: ClasseDtoF) => {
        return (
            <Col xs={24} key={classe.id}>
                <Card
                    hoverable
                    bordered
                    title={<><TeamOutlined style={{ marginRight: 8 }} />{classe.libelle}</>}
                    extra={
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <Tooltip title="Modifier" color="geekblue">
                                <Button
                                    icon={<EditOutlined />}
                                    size="small"
                                    type="primary"
                                    onClick={() => onModifierClasse(classe)}
                                />
                            </Tooltip>
                            <Tooltip title="Supprimer" color="red">
                                <Button
                                    icon={<DeleteOutlined />}
                                    size="small"
                                    type="primary"
                                    danger
                                    onClick={() => onDeleteClasse(classe)}
                                />
                            </Tooltip>
                        </div>
                    }
                >
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '14px' }}>Niveau</span>
                            <span style={{ fontWeight: 500 }}>{classe.niveau}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '14px' }}>Nombre d'élèves</span>
                            <Tag color="blue">{classe.liensClasseEleves?.length ?? 0} élève(s)</Tag>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                            <span style={{ color: '#8c8c8c', fontSize: '14px' }}>Enseignant(s)</span>
                            <span style={{ fontWeight: 500, textAlign: 'right' }}>
                                {getEnseignantsDisplay(classe)}
                            </span>
                        </div>
                    </div>
                </Card>
            </Col>
        );
    };

    return (
        <div style={{ padding: '16px', paddingBottom: '80px' }}>
            <Form
                form={form}
                onFinish={doSearchClasses}
                initialValues={{ anneeDebut: dayjs().year() }}
            >
                <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                    <Col span={24}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0 }}>Classes</h3>
                            <Button
                                type="primary"
                                icon={<PlusCircleOutlined />}
                                onClick={onCreateClasse}
                                size="small"
                            >
                                Nouvelle classe
                            </Button>
                        </div>
                    </Col>
                    <Col span={18}>
                        <InputNumberFormItem
                            name="anneeDebut"
                            label="Année scolaire"
                            rules={[{ required: true, message: "Veuillez saisir une année scolaire" }]}
                            onChange={handleAnneeScolaireChanged}
                        />
                    </Col>
                    <Col span={6}>
                        <Form.Item label=" " colon={false}>
                            <Tooltip title="Rechercher" color="geekblue">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SearchOutlined />}
                                    block
                                />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            <Divider orientation="left" style={{ margin: '16px 0' }}>Périodes sélectionnée</Divider>
            <Row gutter={[16, 16]}>
                {classes.map((classe) => getClasseCard(classe))}
                {classes.length === 0 && (
                    <Col span={24}>
                        <Empty description="Aucune classe pour l'année sélectionnée" style={{ marginTop: 20 }} />
                    </Col>
                )}
            </Row>
        </div>
    );
};
