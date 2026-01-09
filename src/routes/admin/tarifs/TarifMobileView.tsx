import { FunctionComponent } from "react";
import { Button, Card, Col, Divider, Form, Modal, Pagination, Popover, Row, Select, Tag, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, EuroCircleTwoTone, PlusCircleOutlined } from "@ant-design/icons";
import { TarifViewProps } from "./types";
import { SelectFormItem } from "../../../components/common/SelectFormItem";
import { InfosTarifEnfant } from "../../../components/admin/InfosTarifEnfant";
import { InfosTarifAdulte } from "../../../components/admin/InfosTarifAdulte";
import { ModalPeriode } from "../../../components/modals/ModalPeriode";

export const TarifMobileView: FunctionComponent<TarifViewProps> = ({
    form,
    application,
    periodesDto,
    periodesOptions,
    selectedIdPeriode,
    viewTarif,
    currentPage,
    openPopOver,
    modalPeriodeOpen,
    createPeriode,
    periodeToEdit,
    onApplicationChange,
    onSelectPeriode,
    onCreatePeriode,
    onModifierPeriode,
    onDeletePeriode,
    onFinish,
    onCopierTarif,
    setCurrentPage,
    setOpenPopOver,
    setModalPeriodeOpen,
    isSelectedPeriodeReadOnly,
}) => {
    const periodesPerPage = 3;

    const handleDeletePeriode = (periode: any) => {
        Modal.confirm({
            title: 'Supprimer la période',
            content: `Êtes-vous sûr de vouloir supprimer la période ${periode.anneeDebut}/${periode.anneeFin} ?`,
            okText: 'Supprimer',
            okType: 'danger',
            cancelText: 'Annuler',
            onOk: () => onDeletePeriode(periode)
        });
    };

    const getPopOverCopierTarifContent = () => {
        return (
            <Row>
                <Col span={24}>
                    <Select 
                        className="popover-content" 
                        options={periodesOptions} 
                        onChange={(value) => {
                            onCopierTarif(value);
                            setOpenPopOver(false);
                        }} 
                    />
                </Col>
            </Row>
        );
    };

    const getPeriodeContent = () => {
        const startIndex = (currentPage - 1) * periodesPerPage;
        const endIndex = startIndex + periodesPerPage;
        const currentPeriodes = periodesDto?.slice(startIndex, endIndex) || [];

        return (
            <>
                <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                    <Col span={24}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Périodes</h3>
                            <Button icon={<PlusCircleOutlined />} type="primary" onClick={onCreatePeriode} size="small">
                                Nouvelle période
                            </Button>
                        </div>
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    {currentPeriodes.map((periode) => (
                        <Col xs={24} key={periode.id}>
                            <Card
                                hoverable
                                bordered
                                title={<><EuroCircleTwoTone style={{ marginRight: 8 }} />{periode.anneeDebut}/{periode.anneeFin}</>}
                                extra={
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <Tooltip title="Modifier">
                                            <Button
                                                icon={<EditOutlined />}
                                                size="small"
                                                type="primary"
                                                style={{ color: '#fff' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onModifierPeriode();
                                                }}
                                            />
                                        </Tooltip>
                                        {!periode.existInscription && <Tooltip title="Supprimer">
                                            <Button
                                                icon={<DeleteOutlined />}
                                                size="small"
                                                type="primary"
                                                danger
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeletePeriode(periode);
                                                }}
                                            />
                                        </Tooltip>
                                        }
                                    </div>
                                }
                                className={selectedIdPeriode === periode.id ? 'periode-card-selected' : 'periode-card'}
                                onClick={() => onSelectPeriode(periode)}
                                style={{
                                    border: selectedIdPeriode === periode.id ? '2px solid #1890ff' : undefined,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '8px' }}>
                                    {periode.dateDebut} - {periode.dateFin}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {periode.existInscription && (
                                        <Tag color="orange">Inscriptions existantes</Tag>
                                    )}
                                    <Tag color="blue">
                                        Cliquer pour voir les tarifs
                                    </Tag>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
                {periodesDto && periodesDto.length > periodesPerPage && (
                    <Row style={{ marginTop: '16px', justifyContent: 'center' }}>
                        <Col>
                            <Pagination
                                current={currentPage}
                                total={periodesDto.length}
                                pageSize={periodesPerPage}
                                onChange={(page) => setCurrentPage(page)}
                                showSizeChanger={false}
                                simple
                            />
                        </Col>
                    </Row>
                )}
            </>
        );
    };

    return (
        <>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Divider orientation="left">Type de tarifs</Divider>
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <SelectFormItem 
                        name="typeTarif" 
                        label="Type de tarif" 
                        options={[
                            { value: "COURS_ENFANT", label: "Cours enfant" }, 
                            { value: "COURS_ADULTE", label: "Cours adulte" }
                        ]}
                        onChange={(value) => onApplicationChange(value)} 
                        defaultValue="COURS_ENFANT" 
                    />
                </Col>
            </Row>
            {periodesOptions && getPeriodeContent()}
            {viewTarif && application === "COURS_ENFANT" && (
                <InfosTarifEnfant readOnly={isSelectedPeriodeReadOnly()} />
            )}
            {viewTarif && application === "COURS_ADULTE" && (
                <InfosTarifAdulte readOnly={isSelectedPeriodeReadOnly()} />
            )}
            {viewTarif && !isSelectedPeriodeReadOnly() && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                    <Button type="primary" htmlType="submit" block>
                        Enregistrer
                    </Button>
                    <Tooltip title="Copier les tarifs d'une autre période">
                        <Popover
                            content={getPopOverCopierTarifContent()}
                            title="Copier tarifs"
                            trigger="click"
                            open={openPopOver}
                            onOpenChange={setOpenPopOver}
                        >
                            <Button type="primary" block>
                                Copier
                            </Button>
                        </Popover>
                    </Tooltip>
                </div>
            )}
            <ModalPeriode 
                open={modalPeriodeOpen} 
                setOpen={setModalPeriodeOpen} 
                isCreation={createPeriode} 
                periode={periodeToEdit} 
                application={application} 
            />
        </>
    );
};
