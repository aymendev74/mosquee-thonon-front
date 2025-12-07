import { Button, Card, Col, Divider, Form, Popover, Row, Select, Spin, Tooltip, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { ApiCallbacks, buildUrlWithParams, handleApiCall, PERIODES_ENDPOINT, TARIFS_ADMIN_ENDPOINT, TARIFS_ADMIN_GET_ENDPOINT } from "../../../services/services";
import useApi from "../../../hooks/useApi";
import { PeriodeInfoDto } from "../../../services/periode";
import { DefaultOptionType } from "antd/es/select";
import { EditOutlined, EuroCircleOutlined, EuroCircleTwoTone, PlusCircleOutlined } from "@ant-design/icons";
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
    const [periodesDto, setPeriodesDto] = useState<PeriodeInfoDto[]>();
    const [modalPeriodeOpen, setModalPeriodeOpen] = useState<boolean>(false);
    const [createPeriode, setCreatePeriode] = useState<boolean>(false);
    const [periodeToEdit, setPeriodeToEdit] = useState<PeriodeInfoDto>();
    const [periodesOptions, setPeriodesOptions] = useState<DefaultOptionType[]>();
    const [selectedIdPeriode, setSelectedIdPeriode] = useState(form.getFieldValue("id"));
    const [viewTarif, setViewTarif] = useState<boolean>(false);
    const [openPopOver, setOpenPopOver] = useState<boolean>(false);
    const [application, setApplication] = useState<ApplicationTarif>("COURS_ENFANT");

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

    const onPeriodeSelected = (value: any) => {
        setSelectedIdPeriode(value);
        setViewTarif(false);
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

    const getPeriodeContent = () => {
        return (<><Row gutter={[16, 32]}>
            <Col span={24}>
                <Divider orientation="left">Période</Divider>
            </Col>
        </Row>
            <Row gutter={[16, 32]}>
                <Col span={6}>
                    <SelectFormItem name="idPeriode" label="Période" options={periodesOptions} onChange={onPeriodeSelected} />
                </Col>
                <Col span={6}>
                    <Tooltip title="Modifier les données de la période sélectionnée" color="geekblue"><Button icon={<EditOutlined />}
                        type="primary" disabled={!selectedIdPeriode} onClick={onModifierPeriode}>Modifier</Button>
                    </Tooltip>
                    <Tooltip title="Créer une nouvelle période" color="geekblue">
                        <Button icon={<PlusCircleOutlined />} type="primary" className="m-left-10" onClick={onCreatePeriode}>Créer</Button>
                    </Tooltip>
                    <Tooltip title="Consulter/Modifier les tarifs de la période sélectionnée" color="geekblue">
                        <Button icon={<EuroCircleTwoTone />} type="primary" className="m-left-10"
                            disabled={!selectedIdPeriode} onClick={onEditTarif} />
                    </Tooltip>
                </Col>
            </Row>
        </>);
    }

    const getTypeTarifContent = () => {
        return (<><Row gutter={[16, 32]}>
            <Col span={24}>
                <Divider orientation="left">Type de tarifs</Divider>
            </Col>
        </Row>
            <Row gutter={[16, 32]}>
                <Col span={6}>
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
                        (<Button type="primary" htmlType="submit">Enregistrer</Button>)
                    )}
                    {viewTarif && !isSelectedPeriodeReadOnly() && (
                        (<Tooltip color="geekblue" title="Copier les tarifs d'une autre période">
                            <Popover
                                content={getPopOverCopierTarifContent()}
                                title="Copier tarifs"
                                trigger="click"
                                open={openPopOver}
                                onOpenChange={handleOpenPopOverChange}
                            >
                                <Button className="m-left-10" type="primary">Copier</Button>
                            </Popover>
                        </Tooltip>
                        )
                    )}
                    <ModalPeriode open={modalPeriodeOpen} setOpen={setModalPeriodeOpen} isCreation={createPeriode} periode={periodeToEdit} application={application} />
                </Spin>
            </Form >
        </div>) : <UnahtorizedAccess />

};