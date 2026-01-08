import { FunctionComponent } from 'react';
import { Button, Card, Col, Divider, Empty, Form, Row, Tooltip } from 'antd';
import { EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { InputNumberFormItem } from '../../../common/InputNumberFormItem';
import { ClassesEnseignantViewProps } from './types';
import { ClasseDtoF } from '../../../../services/classe';

export const ClassesEnseignantMobileView: FunctionComponent<ClassesEnseignantViewProps> = ({
    form,
    classes,
    debutAnneeScolaire,
    doSearchClasses,
    onConsulterClasse,
}) => {
    const getClasseCard = (classe: ClasseDtoF) => {
        return (
            <Col xs={24} key={"col_" + classe.id}>
                <Card 
                    className="card-focus-effect" 
                    size="small" 
                    bordered
                    style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                    title={
                        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{classe.libelle}</span>                                                
                    }
                    extra={
                        <Button 
                            type="primary" 
                            icon={<EyeOutlined />} 
                            onClick={() => onConsulterClasse(classe.id!)}
                            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                        />
                    }
                >
                    <div style={{ padding: '8px 0' }}>
                        <p style={{ marginBottom: '8px' }}>
                            <b>Enseignant: </b>{classe.nomPrenomEnseignant ?? "-"}
                        </p>
                        <p style={{ marginBottom: '8px' }}>
                            <b>Niveau: </b>{classe.niveau}
                        </p>
                        <p style={{ marginBottom: 0 }}>
                            <b>Nombre d'élèves: </b>{classe.liensClasseEleves?.length ?? 0}
                        </p>
                    </div>
                </Card>
            </Col>
        );
    };

    return (
        <div style={{ padding: '16px' }}>
            <Form form={form} onFinish={doSearchClasses} initialValues={{ anneeDebut: debutAnneeScolaire }}>
                <Row gutter={[16, 16]} style={{ marginBottom: '16px', alignItems: 'flex-end' }}>
                    <Col span={18}>
                        <InputNumberFormItem
                            name="anneeDebut"
                            label="Année scolaire"
                            rules={[{ required: true, message: "Veuillez saisir une année scolaire" }]}
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

            <Divider orientation="left" style={{ marginTop: '24px' }}>Mes classes</Divider>
            
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
