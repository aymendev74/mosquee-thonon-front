import { FunctionComponent } from "react";
import { Button, Card, Col, Divider, Empty, Form, Row, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, PlusCircleOutlined, SearchOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { ClasseViewProps } from "./types";
import { InputNumberFormItem } from "../../../components/common/InputNumberFormItem";
import { ClasseDtoF } from "../../../services/classe";
import dayjs from "dayjs";

export const ClasseDesktopView: FunctionComponent<ClasseViewProps> = ({
    form,
    enseignants,
    classes,
    debutAnneeScolaire,
    onCreateClasse,
    onModifierClasse,
    onDeleteClasse,
    doSearchClasses,
    handleAnneeScolaireChanged,
}) => {
    const getClasseCard = (classe: ClasseDtoF) => {
        const enseignant = enseignants.find(e => e.id === classe.idUtilisateur);
        
        return (
            <Col xs={24} sm={12} md={8} lg={6} key={classe.id}>
                <Card
                    hoverable
                    bordered
                    className="card-focus-effect"
                    title={<><TeamOutlined style={{ marginRight: 8 }} />{classe.libelle}</>}
                    extra={
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <Tooltip title="Modifier la classe" color="geekblue">
                                <Button
                                    icon={<EditOutlined />}
                                    size="small"
                                    type="primary"
                                    onClick={() => onModifierClasse(classe)}
                                />
                            </Tooltip>
                            <Tooltip title="Supprimer la classe" color="red">
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
                    <div style={{ marginBottom: '8px' }}>
                        <strong>Niveau:</strong> {classe.niveau}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        <strong>Nombre d'élèves:</strong> {classe.liensClasseEleves?.length ?? 0}
                    </div>
                    <div>
                        <strong>Enseignant:</strong> {enseignant ? `${enseignant.prenom} ${enseignant.nom}` : "-"}
                    </div>
                </Card>
            </Col>
        );
    };

    return (
        <div className="main-content-classes">
            <Form
                form={form}
                onFinish={doSearchClasses}
                initialValues={{ anneeDebut: dayjs().year() }}
            >
                <Row gutter={[16, 16]} style={{ marginBottom: '24px', alignItems: 'flex-end' }}>
                    <Col xs={24} sm={8} md={6} lg={4}>
                        <InputNumberFormItem
                            name="anneeDebut"
                            label="Année scolaire"
                            rules={[{ required: true, message: "Veuillez saisir une année scolaire" }]}
                            onChange={handleAnneeScolaireChanged}
                        />
                    </Col>
                    <Col xs={12} sm={4} md={3} lg={2}>
                        <Form.Item label=" " colon={false}>
                            <Tooltip title="Rechercher les classes" color="geekblue">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SearchOutlined />}
                                />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={8} lg={6}>
                        <Form.Item label=" " colon={false}>
                            <Button
                                type="primary"
                                icon={<PlusCircleOutlined />}
                                onClick={onCreateClasse}
                            >
                                Nouvelle classe
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            <Divider orientation="left">Les classes de la période sélectionnée</Divider>
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
