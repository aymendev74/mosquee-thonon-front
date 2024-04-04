import { Button, Col, Divider, Form, Popover, Row, Select, Spin, Tag, Tooltip, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { PERIODES_ENDPOINT, TARIFS_ADMIN_ENDPOINT, TARIFS_ENDPOINT } from "../../services/services";
import useApi from "../../hooks/useApi";
import { PeriodeInfoDto } from "../../services/periode";
import { DefaultOptionType } from "antd/es/select";
import moment from "moment";
import { EditOutlined, EuroCircleTwoTone, PlusCircleOutlined } from "@ant-design/icons";
import { InfosTarif } from "../admin/InfosTarif";
import { ModalPeriode } from "../modals/ModalPeriode";
import { SelectFormItem } from "../common/SelectFormItem";
import { InfoTarifDto } from "../../services/tarif";
import { formatPeriodeLibelle, getPeriodeOptions } from "../common/CommonComponents";

export const AdminTarifs: FunctionComponent = () => {

    const [form] = Form.useForm();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const [periodesDto, setPeriodesDto] = useState<PeriodeInfoDto[]>();
    const [modalPeriodeOpen, setModalPeriodeOpen] = useState<boolean>(false);
    const [createPeriode, setCreatePeriode] = useState<boolean>(false);
    const [periodeToEdit, setPeriodeToEdit] = useState<PeriodeInfoDto>();
    const [periodesOptions, setPeriodesOptions] = useState<DefaultOptionType[]>();
    const [selectedIdPeriode, setSelectedIdPeriode] = useState(form.getFieldValue("id"));
    const [viewTarif, setViewTarif] = useState<boolean>(false);
    const [openPopOver, setOpenPopOver] = useState<boolean>(false);

    useEffect(() => {
        // On reload les périodes dès lors que la modal permettant leur modification se referme, afin récupérer les modifications
        if (!modalPeriodeOpen) {
            setApiCallDefinition({ method: "GET", url: PERIODES_ENDPOINT });
        }
    }, [modalPeriodeOpen]);

    useEffect(() => {
        if (apiCallDefinition?.url === PERIODES_ENDPOINT && apiCallDefinition.method === "GET" && result) {
            const resultAsPeriodeDto = result as PeriodeInfoDto[];
            setPeriodesDto(resultAsPeriodeDto);
            setPeriodesOptions(getPeriodeOptions(resultAsPeriodeDto));
            resetApi();
        }
        if (apiCallDefinition?.url?.startsWith(TARIFS_ADMIN_ENDPOINT) && result) {
            setViewTarif(true);
            if (apiCallDefinition?.url === TARIFS_ADMIN_ENDPOINT && apiCallDefinition.method === "POST" && result) {
                notification.open({ message: "Les nouveaux tarifs ont bien été enregistrés", type: "success" });
                form.setFieldsValue(result);
            } else if (!apiCallDefinition.url.endsWith(selectedIdPeriode)) {
                // Si l'appel ne vas pas rechercher les tarifs de la période sélectionnée c'est que le user demande la copie des
                // tarifs de la période active
                const resultAsInfoTarifDto = result as InfoTarifDto;
                const { idPeriode, ...rest } = resultAsInfoTarifDto;
                form.setFieldsValue({ idPeriode: selectedIdPeriode, ...rest });
                notification.open({ message: "Les tarifs de la période sélectionnée ont bien été copiés", type: "success" });
            } else {
                form.setFieldsValue(result);
            }
            console.log("resetAPI");
            resetApi();
        }
    }, [result]);

    const onEditTarif = () => {
        setApiCallDefinition({ method: "GET", url: TARIFS_ADMIN_ENDPOINT + "/" + selectedIdPeriode });
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

    const copierTarif = (value: any) => {
        setApiCallDefinition({ method: "GET", url: TARIFS_ADMIN_ENDPOINT + "/" + value });
    }

    const onFinish = (infoTarif: InfoTarifDto) => {
        console.log("onFinish");
        setApiCallDefinition({ method: "POST", url: TARIFS_ADMIN_ENDPOINT, data: infoTarif });
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

    return (<>
        <Form
            name="basic"
            autoComplete="off"
            className="container-full-width"
            onFinish={onFinish}
            form={form}
        >
            <Spin spinning={isLoading}>
                <h2>Administration des tarifs</h2>
                <Row gutter={[16, 32]}>
                    <Col span={24}>
                        <Divider orientation="left">Période</Divider>
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={6}>
                        <SelectFormItem name="idPeriode" label="Période" options={periodesOptions} onChange={onPeriodeSelected} />
                    </Col>
                    <Col span={4}>
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
                {viewTarif && (<InfosTarif readOnly={isSelectedPeriodeReadOnly()} />)}
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
                <ModalPeriode open={modalPeriodeOpen} setOpen={setModalPeriodeOpen} isCreation={createPeriode} periode={periodeToEdit} />
            </Spin>
        </Form >
    </>);
}