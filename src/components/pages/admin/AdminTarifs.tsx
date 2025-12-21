import { Button, Card, Col, Divider, Form, Modal, Pagination, Popover, Row, Select, Spin, Tag, Tooltip, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { useMediaQuery } from 'react-responsive';
import { ApiCallbacks, buildUrlWithParams, handleApiCall, PERIODES_ENDPOINT, PERIODES_EXISTING_ENDPOINT, TARIFS_ADMIN_ENDPOINT, TARIFS_ADMIN_GET_ENDPOINT } from "../../../services/services";
import useApi from "../../../hooks/useApi";
import { PeriodeInfoDto } from "../../../services/periode";
import { DefaultOptionType } from "antd/es/select";
import { DeleteOutlined, EditOutlined, EuroCircleOutlined, EuroCircleTwoTone, PlusCircleOutlined } from "@ant-design/icons";
import { InfosTarifEnfant } from "../../admin/InfosTarifEnfant";
import { ModalPeriode } from "../../modals/ModalPeriode";
import { SelectFormItem } from "../../common/SelectFormItem";
import { ApplicationTarif, InfoTarifDto } from "../../../services/tarif";
import { getPeriodeOptions } from "../../common/CommonComponents";
import { InfosTarifAdulte } from "../../admin/InfosTarifAdulte";
import { useAuth } from "../../../hooks/AuthContext";
import { UnahtorizedAccess } from "../UnahtorizedAccess";

export const AdminTarifs: FunctionComponent = () => {

    const { username, roles } = useAuth();
    const [form] = Form.useForm();
    const { execute, isLoading } = useApi();
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [periodesDto, setPeriodesDto] = useState<PeriodeInfoDto[]>();
    const [modalPeriodeOpen, setModalPeriodeOpen] = useState<boolean>(false);
    const [createPeriode, setCreatePeriode] = useState<boolean>(false);
    const [periodeToEdit, setPeriodeToEdit] = useState<PeriodeInfoDto>();
    const [periodesOptions, setPeriodesOptions] = useState<DefaultOptionType[]>();
    const [selectedIdPeriode, setSelectedIdPeriode] = useState(form.getFieldValue("id"));
    const [viewTarif, setViewTarif] = useState<boolean>(false);
    const [openPopOver, setOpenPopOver] = useState<boolean>(false);
    const [application, setApplication] = useState<ApplicationTarif>("COURS_ENFANT");
    const [currentPage, setCurrentPage] = useState(1);
    const periodesPerPage = 5;

    async function loadPeriodes() {
        if (!modalPeriodeOpen) {
            const resultPeriodes = await execute<PeriodeInfoDto[]>({ method: "GET", url: PERIODES_ENDPOINT, params: { application } });
            if (resultPeriodes.success && resultPeriodes.successData) {
                setPeriodesDto(resultPeriodes.successData);
                setPeriodesOptions(getPeriodeOptions(resultPeriodes.successData));
            }
        }
    };

    useEffect(() => {
        if (!modalPeriodeOpen) {
            loadPeriodes();
        }
    }, [modalPeriodeOpen]);

    const onEditTarif = async () => {
        const resultTarifs = await execute({ method: "GET", url: buildUrlWithParams(TARIFS_ADMIN_GET_ENDPOINT, { id: selectedIdPeriode }) });
        if (resultTarifs.success && resultTarifs.successData) {
            setViewTarif(true);
            form.setFieldsValue(resultTarifs.successData);
        }
    }

    const onCreatePeriode = () => {
        setModalPeriodeOpen(true);
        setCreatePeriode(true);
        setPeriodeToEdit(undefined);
    }

    const onModifierPeriode = () => {
        setModalPeriodeOpen(true);
        setCreatePeriode(false);
        setPeriodeToEdit(periodesDto?.find(p => p.id === selectedIdPeriode));
    }

    const onDeletePeriode = (periode: PeriodeInfoDto) => {
        Modal.confirm({
            title: 'Supprimer la période',
            content: `Êtes-vous sûr de vouloir supprimer la période ${periode.anneeDebut}/${periode.anneeFin} ?`,
            okText: 'Supprimer',
            okType: 'danger',
            cancelText: 'Annuler',
            onOk: async () => {
                const result = await execute({ 
                    method: "DELETE", 
                    url: buildUrlWithParams(PERIODES_EXISTING_ENDPOINT, { id: periode.id }) 
                });
                if (result.success) {
                    notification.success({ message: 'La période a été supprimée avec succès' });
                    // Réinitialiser la sélection si la période supprimée était sélectionnée
                    if (selectedIdPeriode === periode.id) {
                        setSelectedIdPeriode(null);
                        setViewTarif(false);
                    }
                    // Recharger les périodes
                    loadPeriodes();
                }
            }
        });
    }

    const isSelectedPeriodeReadOnly = () => {
        return periodesDto?.find(p => p.id === selectedIdPeriode)?.existInscription ?? false;
    }

    const copierTarif = async (value: any) => {
        const resultTarifs = await execute<InfoTarifDto>({ method: "GET", url: buildUrlWithParams(TARIFS_ADMIN_GET_ENDPOINT, { id: value }) });
        if (resultTarifs.success && resultTarifs.successData) {
            const { idPeriode, ...rest } = resultTarifs.successData;
            form.setFieldsValue({ idPeriode: selectedIdPeriode, ...rest });
            notification.open({ message: "Les tarifs de la période sélectionnée ont bien été copiés", type: "success" });
        }
    }

    const onFinish = async (infoTarif: InfoTarifDto) => {
        const resultSavedTarifs = await execute({ method: "POST", url: TARIFS_ADMIN_ENDPOINT, data: infoTarif });
        if (resultSavedTarifs.success && resultSavedTarifs.successData) {
            setViewTarif(true);
            notification.open({ message: "Les nouveaux tarifs ont bien été enregistrés", type: "success" });
            form.setFieldsValue(resultSavedTarifs.successData);
        }
    }

    const handleOpenPopOverChange = (newValue: boolean) => {
        setOpenPopOver(newValue);
    }

    const getPopOverCopierTarifContent = () => {

        return (<Row>
            <Col span={24}><Select className="popover-content" options={periodesOptions} onChange={(value) => {
                copierTarif(value);
                setOpenPopOver(false);
            }} /></Col></Row>);
    }

    const onSelectPeriode = async (periode: PeriodeInfoDto) => {
        setSelectedIdPeriode(periode.id);
        form.setFieldValue("idPeriode", periode.id);
        // Charger automatiquement les tarifs
        const resultTarifs = await execute({ method: "GET", url: buildUrlWithParams(TARIFS_ADMIN_GET_ENDPOINT, { id: periode.id }) });
        if (resultTarifs.success && resultTarifs.successData) {
            setViewTarif(true);
            form.setFieldsValue(resultTarifs.successData);
        }
    };

    const getPeriodeContent = () => {
        const startIndex = (currentPage - 1) * periodesPerPage;
        const endIndex = startIndex + periodesPerPage;
        const currentPeriodes = periodesDto?.slice(startIndex, endIndex) || [];

        return (<>
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
                                                setPeriodeToEdit(periode);
                                                setCreatePeriode(false);
                                                setModalPeriodeOpen(true);
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
                                                onDeletePeriode(periode);
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
        </>);
    }

    const getTypeTarifContent = () => {
        return (<><Row gutter={[16, 32]}>
            <Col span={24}>
                <Divider orientation="left">Type de tarifs</Divider>
            </Col>
        </Row>
            <Row gutter={[16, 32]}>
                <Col xs={24} sm={24} md={6}>
                    <SelectFormItem name="typeTarif" label="Type de tarif" options={[{ value: "COURS_ENFANT", label: "Cours enfant" }, { value: "COURS_ADULTE", label: "Cours adulte" }]}
                        onChange={(value) => { setApplication(value) }} defaultValue="COURS_ENFANT" />
                </Col>
            </Row>
        </>);
    }

    useEffect(() => {
        setPeriodesOptions([]);
        setViewTarif(false);
        setSelectedIdPeriode(null);
        form.setFieldValue("idPeriode", null);
        loadPeriodes();
    }, [application]);

    return roles?.includes("ROLE_ADMIN") ? (
        <div className="centered-content">
            <Form
                name="basic"
                autoComplete="off"
                className="container-full-width"
                onFinish={onFinish}
                form={form}
            >
                <Spin spinning={isLoading}>
                    <h2 className="admin-tarif-title"><EuroCircleOutlined /> Administration des tarifs</h2>
                    {getTypeTarifContent()}
                    {periodesOptions && getPeriodeContent()}
                    {viewTarif && application === "COURS_ENFANT" && (<InfosTarifEnfant readOnly={isSelectedPeriodeReadOnly()} />)}
                    {viewTarif && application === "COURS_ADULTE" && (<InfosTarifAdulte readOnly={isSelectedPeriodeReadOnly()} />)}
                    {viewTarif && !isSelectedPeriodeReadOnly() && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
                            <Button type="primary" htmlType="submit">Enregistrer</Button>
                            <Tooltip color="geekblue" title="Copier les tarifs d'une autre période">
                                <Popover
                                    content={getPopOverCopierTarifContent()}
                                    title="Copier tarifs"
                                    trigger="click"
                                    open={openPopOver}
                                    onOpenChange={handleOpenPopOverChange}
                                >
                                    <Button type="primary">Copier</Button>
                                </Popover>
                            </Tooltip>
                        </div>
                    )}
                    <ModalPeriode open={modalPeriodeOpen} setOpen={setModalPeriodeOpen} isCreation={createPeriode} periode={periodeToEdit} application={application} />
                </Spin>
            </Form >
        </div>) : <UnahtorizedAccess />
};