import { FunctionComponent } from "react";
import { Button, Card, Col, Divider, Form, Modal, Pagination, Popover, Row, Select, Tag, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, EuroCircleTwoTone, PlusCircleOutlined } from "@ant-design/icons";
import { TarifViewProps } from "./types";
import { SelectFormItem } from "../../../common/SelectFormItem";
import { InfosTarifEnfant } from "../../../admin/InfosTarifEnfant";
import { InfosTarifAdulte } from "../../../admin/InfosTarifAdulte";
import { ModalPeriode } from "../../../modals/ModalPeriode";

export const TarifDesktopView: FunctionComponent<TarifViewProps> = ({
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
    const periodesPerPage = 5;

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
                            <Button icon={<PlusCircleOutlined />} type="primary" onClick={onCreatePeriode}>
                                Nouvelle période
                            </Button>
                        </div>
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    {currentPeriodes.map((periode) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={periode.id}>
                            <Card
                                hoverable
                                className={selectedIdPeriode === periode.id ? 'periode-card-selected' : 'periode-card'}
                                onClick={() => onSelectPeriode(periode)}
                                style={{
                                    border: selectedIdPeriode === periode.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                bodyStyle={{ padding: '16px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>
                                            {periode.anneeDebut}/{periode.anneeFin}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                            {periode.dateDebut} - {periode.dateFin}
                                        </div>
                                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {periode.existInscription && (
                                                <Tag color="orange">Inscriptions existantes</Tag>
                                            )}
                                            <Tag color="blue" icon={<EuroCircleTwoTone />}>
                                                Cliquer pour voir les tarifs
                                            </Tag>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <Tooltip title="Modifier la période">
                                            <Button
                                                icon={<EditOutlined />}
                                                size="small"
                                                type="text"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onModifierPeriode();
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Supprimer la période">
                                            <Button
                                                icon={<DeleteOutlined />}
                                                size="small"
                                                type="text"
                                                danger
                                                disabled={periode.existInscription}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeletePeriode(periode);
                                                }}
                                            />
                                        </Tooltip>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
                {periodesDto && periodesDto.length > periodesPerPage && (
                    <Row style={{ marginTop: '24px', justifyContent: 'center' }}>
                        <Col>
                            <Pagination
                                current={currentPage}
                                total={periodesDto.length}
                                pageSize={periodesPerPage}
                                onChange={(page) => setCurrentPage(page)}
                                showSizeChanger={false}
                                showTotal={(total, range) => `${range[0]}-${range[1]} sur ${total} périodes`}
                            />
                        </Col>
                    </Row>
                )}
            </>
        );
    };

    return (
        <>
            <Row gutter={[16, 32]}>
                <Col span={24}>
                    <Divider orientation="left">Type de tarifs</Divider>
                </Col>
            </Row>
            <Row gutter={[16, 32]}>
                <Col xs={24} sm={24} md={6}>
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
                    <Button type="primary" htmlType="submit">
                        Enregistrer
                    </Button>
                    <Tooltip color="geekblue" title="Copier les tarifs d'une autre période">
                        <Popover
                            content={getPopOverCopierTarifContent()}
                            title="Copier tarifs"
                            trigger="click"
                            open={openPopOver}
                            onOpenChange={setOpenPopOver}
                        >
                            <Button type="primary">
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
