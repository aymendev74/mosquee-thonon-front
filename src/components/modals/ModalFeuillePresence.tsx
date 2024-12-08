import { Button, Col, Divider, Form, Input, Modal, notification, Row, Spin, Table, Tag, Tooltip } from "antd";
import { FunctionComponent, useEffect, useState } from "react"
import useApi from "../../hooks/useApi";
import _, { get } from "lodash";
import { ApiCallbacks, buildUrlWithParams, CLASSES_ENDPOINT, ELEVES_ENDPOINT, ENSEIGNANT_ENDPOINT, EXISTING_CLASSES_ENDPOINT, FEUILLE_PRESENCE_ENDPOINT, handleApiCall } from "../../services/services";
import { ClasseDtoF, FeuillePresenceDtoB, LienClasseEleveDto, PresenceEleveDto } from "../../services/classe";
import { EnseignantDto } from "../../services/enseignant";
import { EleveFront } from "../../services/eleve";
import { APPLICATION_DATE_FORMAT } from "../../utils/FormUtils";
import { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { DatePickerFormItem } from "../common/DatePickerFormItem";


export type ModalFeuillePresenceProps = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    classe: ClasseDtoF,
}

export const ModalFeuillePresence: FunctionComponent<ModalFeuillePresenceProps> = ({ open, setOpen, classe }) => {
    const { isLoading, result, setApiCallDefinition, apiCallDefinition, resetApi } = useApi();
    const [form] = Form.useForm();
    const [eleves, setEleves] = useState<EleveFront[]>([]);
    const [selectedEleves, setSelectedEleves] = useState<EleveFront[]>([]);

    function close() {
        form.resetFields();
        setOpen(false);
    };

    function onFinish() {
        const dateFeuille = form.getFieldValue("dateFeuille");
        const elevesPresents: PresenceEleveDto[] = selectedEleves.map((eleve) => ({ idEleve: eleve.id!, present: true }));
        const elevesAbsents: PresenceEleveDto[] = eleves.filter((eleve) => !selectedEleves.map((eleve) => eleve.id).includes(eleve.id)).map((eleve) => ({ idEleve: eleve.id!, present: false }));
        const feuillePresence: FeuillePresenceDtoB = {
            date: dayjs(dateFeuille).format(APPLICATION_DATE_FORMAT),
            presenceEleves: [...elevesPresents, ...elevesAbsents],
        }
        setApiCallDefinition({ method: "POST", url: buildUrlWithParams(FEUILLE_PRESENCE_ENDPOINT, { id: classe.id }), data: feuillePresence });
    }

    const getTitre = () => {
        return "Feuille de temps";
    }

    const apiCallbacks: ApiCallbacks = {
        [`POST:${FEUILLE_PRESENCE_ENDPOINT}`]: (result: any) => {
            if (result) {
                notification.success({ message: "La feuille de présence a bien été enregistrée" });
                setOpen(false);
                setEleves([]);
                setSelectedEleves([]);
            }
        },
    };

    useEffect(() => {
        if (open && classe && classe.liensClasseEleves) {
            setEleves(classe?.liensClasseEleves?.map((lien) => lien.eleve));
        } else {
            form.resetFields();
            setEleves([]);
            setSelectedEleves([]);
        }
    }, [open]);

    useEffect(() => {
        const { method, url } = { ...apiCallDefinition };
        if (method && url) {
            const callBack = handleApiCall(method, url, apiCallbacks);
            if (callBack) {
                callBack(result);
            }
        }
    }, [result]);

    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: EleveFront[]) => {
            setSelectedEleves(selectedRows);
        }
    };

    const columnsTableEleves: ColumnsType<EleveFront> = [
        {
            title: "Nom",
            dataIndex: "nom",
            key: "nom",
        },
        {
            title: "Prénom",
            dataIndex: "prenom",
            key: "prenom",
        },
        {
            title: "Niveau",
            dataIndex: "niveauInterne",
            key: "niveauInterne",
        },
        {
            title: "Date naissance",
            dataIndex: "dateNaissance",
            key: "dateNaissance",
            render: (value, record, index) => {
                return dayjs(record.dateNaissance, APPLICATION_DATE_FORMAT).format(APPLICATION_DATE_FORMAT);
            }
        },
    ];

    function formatTotal(total: number) {
        return (<Tag color="geekblue">Total : <strong>{total} élève(s)</strong></Tag>);
    }

    return (<Modal title={getTitre()} open={open} width={500} onCancel={close} footer={<></>}>
        <Form
            name="feuillePresence"
            autoComplete="off"
            form={form}
            onFinish={onFinish}
        >
            <Spin spinning={isLoading}>
                <Divider orientation="left">Date du cours</Divider>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <DatePickerFormItem name="dateFeuille" label="Date" rules={[{ required: true, message: "Veuillez saisir la date de la feuille de présence" }]} />
                    </Col>
                </Row>
                <Divider orientation="left">Liste des élèves</Divider>
                <Table dataSource={eleves}
                    columns={columnsTableEleves}
                    rowSelection={{ type: "checkbox", selectedRowKeys: selectedEleves.map(eleve => eleve.id!), ...rowSelection }}
                    pagination={{ pageSize: 10, showTotal: formatTotal }}
                    rowKey={record => record.id!} />
            </Spin>
            <Row gutter={[16, 32]}>
                <Col span={24} style={{ textAlign: "right" }}>
                    <Button onClick={close} icon={<CloseOutlined />}>Annuler</Button>
                    <Button className="m-left-10" htmlType="submit" icon={<CheckOutlined />} danger>Valider</Button>
                </Col>
            </Row>
        </Form>
    </Modal>);

}