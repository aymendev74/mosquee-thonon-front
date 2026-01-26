import { FunctionComponent } from 'react';
import { Button, Card, Col, Divider, Empty, Form, Row, Tooltip } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { InputNumberFormItem } from '../../../components/common/InputNumberFormItem';
import { ClassesEnseignantViewProps } from './types';
import { ClasseDtoF } from '../../../services/classe';

export const ClassesEnseignantDesktopView: FunctionComponent<ClassesEnseignantViewProps> = ({
    form,
    classes,
    debutAnneeScolaire,
    doSearchClasses,
    onConsulterClasse,
}) => {
    const getActionsClasseButtons = (classe: ClasseDtoF) => {
        return (
            <Tooltip title="Consulter la classe" color="geekblue">
                <Button type="primary" icon={<EyeOutlined />} onClick={() => onConsulterClasse(classe.id!)} />
            </Tooltip>
        );
    };

    const getEnseignantsDisplay = (classe: ClasseDtoF) => {
        if (!classe.enseignants || classe.enseignants.length === 0) {
            return "-";
        }
        return classe.enseignants.map(e => e.nomPrenom).join(", ");
    };

    const getClasseCard = (classe: ClasseDtoF) => {
        return (
            <Col xs={24} sm={12} md={8} lg={6} key={"col_" + classe.id}>
                <Card
                    className="card-focus-effect"
                    size="small"
                    title={classe.libelle}
                    extra={getActionsClasseButtons(classe)}
                    hoverable
                    bordered
                >
                    <p><b>Enseignant(s): </b>{getEnseignantsDisplay(classe)}</p>
                    <p><b>Niveau: </b>{classe.niveau}</p>
                    <p><b>Nombre d'élèves: </b>{classe.liensClasseEleves?.length ?? 0}</p>
                </Card>
            </Col>
        );
    };

    return (
        <div className="main-content-classes">
            <Form form={form} onFinish={doSearchClasses} initialValues={{ anneeDebut: debutAnneeScolaire }}>
                <Row gutter={[16, 16]} style={{ marginBottom: '24px', alignItems: 'flex-end' }}>
                    <Col xs={24} sm={8} md={6} lg={4}>
                        <InputNumberFormItem
                            name="anneeDebut"
                            label="Année scolaire"
                            rules={[{ required: true, message: "Veuillez saisir une année scolaire" }]}
                        />
                    </Col>
                    <Col xs={12} sm={4} md={3} lg={2}>
                        <Form.Item label=" " colon={false}>
                            <Tooltip title="Rechercher les classes" color="geekblue">
                                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
            <Divider orientation="left">Mes classes</Divider>
            <Row gutter={[16, 16]}>
                {classes && classes.map((classe: ClasseDtoF) => getClasseCard(classe))}
                {classes.length === 0 && (
                    <Col span={24}>
                        <Empty description="Aucune classe pour l'année sélectionnée" style={{ marginTop: 20 }} />
                    </Col>
                )}
            </Row>
        </div>
    );
};
