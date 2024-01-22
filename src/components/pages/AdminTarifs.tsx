import { Button, Col, Divider, Form, Row, Select, Tag, Tooltip, notification } from "antd";
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

    useEffect(() => {
        const fetchPeriodes = async () => {
            setApiCallDefinition({ method: "GET", url: PERIODES_ENDPOINT });
        }
        // On reload les périodes dès lors que la modal permettant leur modification se referme, afin récupérer les modifications
        if (!modalPeriodeOpen) {
            fetchPeriodes();
        }
    }, [modalPeriodeOpen]);

    useEffect(() => {
        if (apiCallDefinition?.url === PERIODES_ENDPOINT && apiCallDefinition.method === "GET" && result) {
            const resultAsPeriodeDto = result as PeriodeInfoDto[];
            setPeriodesDto(resultAsPeriodeDto);
            const periodesOptions: DefaultOptionType[] = [];
            resultAsPeriodeDto.forEach(periode => periodesOptions.push({ value: periode.id, label: formatPeriodeLibelle(periode) }));
            setPeriodesOptions(periodesOptions);
            resetApi();
        }
        if (apiCallDefinition?.url?.startsWith(TARIFS_ADMIN_ENDPOINT) && apiCallDefinition.method === "GET" && result) {
            setViewTarif(true);
            form.setFieldsValue(result);
        }
        if (apiCallDefinition?.url === TARIFS_ADMIN_ENDPOINT && apiCallDefinition.method === "POST" && result) {
            notification.open({ message: "Les nouveaux tarifs ont bien été enregistrés", type: "success" });
            form.setFieldsValue(result);
        }
    }, [result]);

    const formatPeriodeLibelle = (periode: PeriodeInfoDto) => {
        let libelle: string = (periode.dateDebut as string).concat(" - ").concat(periode.dateFin as string);
        if (periode.active) {
            libelle = libelle.concat(" (En cours)");
        }
        return <Tag color="blue">{libelle}</Tag>;
    }

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

    const onFinish = (infoTarif: InfoTarifDto) => {
        setApiCallDefinition({ method: "POST", url: TARIFS_ADMIN_ENDPOINT, data: infoTarif });
    }

    return (<>
        <Form
            name="basic"
            autoComplete="off"
            className="container-full-width"
            onFinish={onFinish}
            form={form}
        >
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
                    <Tooltip title="Consulter/Modifier les tarifs" color="geekblue">
                        <Button icon={<EuroCircleTwoTone />} type="primary" className="m-left-10"
                            disabled={!selectedIdPeriode} onClick={onEditTarif} />
                    </Tooltip>
                </Col>
            </Row>
            {viewTarif && (<InfosTarif readOnly={isSelectedPeriodeReadOnly()} />)}
            {viewTarif && !isSelectedPeriodeReadOnly() && (
                (<Button type="primary" htmlType="submit">Enregistrer</Button>)
            )}
            <ModalPeriode open={modalPeriodeOpen} setOpen={setModalPeriodeOpen} isCreation={createPeriode} periode={periodeToEdit} />
        </Form>
    </>);
}