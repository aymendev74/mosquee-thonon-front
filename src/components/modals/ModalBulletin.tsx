import { Button, Col, Divider, Form, Modal, Row, Spin, Tag } from "antd";
import { FunctionComponent, useEffect, useState } from "react"
import useApi from "../../hooks/useApi";
import { ApiCallbacks, handleApiCall, MATIERES_ENDPOINT } from "../../services/services";
import dayjs from "dayjs";
import { BulletinDto, MatiereDto, MatiereNoteEnum } from "../../services/classe";
import { SelectFormItem } from "../common/SelectFormItem";
import { EleveEnrichedDto } from "../../services/eleve";
import { InputFormItem } from "../common/InputFormItem";
import TextArea from "antd/es/input/TextArea";
import { InputNumberFormItem } from "../common/InputNumberFormItem";


export type ModalBulletinProps = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isCreation: boolean,
    bulletin?: BulletinDto,
    annees: number[],
    eleve?: EleveEnrichedDto,
}

export const ModalBulletin: FunctionComponent<ModalBulletinProps> = ({ open, setOpen, isCreation, bulletin, annees, eleve }) => {
    const { isLoading, result, setApiCallDefinition, apiCallDefinition, resetApi } = useApi();
    const [matieres, setMatieres] = useState<MatiereDto[]>([]);
    const [form] = Form.useForm();

    const close = () => {
        form.resetFields();
        setOpen(false);
    };

    const onValider = () => {

    }

    const getTitre = () => {
        return isCreation ? "Création d'un nouveau bulletin" : "Modification d'un bulletin";
    }

    useEffect(() => {
        if (bulletin) {
            form.setFieldsValue(bulletin);
        }
        setApiCallDefinition({ method: "GET", url: MATIERES_ENDPOINT });
    }, []);

    const apiCallbacks: ApiCallbacks = {
        [`GET:${MATIERES_ENDPOINT}`]: (result: any) => {
            setMatieres(result as MatiereDto[]);
            resetApi();
        }
    };

    useEffect(() => {
        const { method, url } = { ...apiCallDefinition };
        if (method && url) {
            const callBack = handleApiCall(method, url, apiCallbacks);
            if (callBack) {
                callBack(result);
            }
        }
    }, [result]);

    function getNotesOptions() {
        return [{ value: MatiereNoteEnum.A, label: <Tag color="green">Acquis</Tag> },
        { value: MatiereNoteEnum.EA, label: <Tag color="orange">En cours d'acquisition</Tag> },
        { value: MatiereNoteEnum.NA, label: <Tag color="red">Non acquis</Tag> }];
    }

    return (<Modal title={getTitre()} open={open} width={800} onCancel={close}
        footer={<><Button onClick={close}>Annuler</Button><Button onClick={onValider} danger>Valider</Button></>}>
        <Form
            name="periode"
            autoComplete="off"
            form={form}
        >
            <Spin spinning={isLoading}>
                <Divider orientation="left">Informations générales</Divider>
                <div>Nom de l'élève: <Tag color="orange" className="m-left-10">{eleve?.prenom} {eleve?.nom}</Tag></div><br />
                <Row gutter={[16, 32]}>
                    <Col span={8}>
                        <SelectFormItem label="Mois" name="mois" options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(mois => ({ value: mois, label: dayjs().month(mois - 1).format("MMMM") }))} />
                    </Col>
                    <Col span={12}>
                        <SelectFormItem label="Annee" name="annee" options={annees.map(annee => ({ value: annee, label: annee }))} />
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={8}>
                        <InputNumberFormItem name="nbAbsences" label="Nombre d'absences" />
                    </Col>
                </Row>
                <Divider orientation="left">Notes</Divider>
                {matieres?.map((matiere) => (
                    <Row key={matiere.id} gutter={[16, 32]}>
                        <Col span={8}>
                            <Tag color="geekblue">{matiere.libelle}</Tag>
                        </Col>
                        <Col span={12}>
                            <SelectFormItem name={"notes" + matiere.id} label="Sélectionnez une note" options={getNotesOptions()} />
                        </Col>
                    </Row>
                ))}
                <Divider orientation="left">Appréciation générale</Divider>
                <Form.Item
                    label="Appréciation"
                    name="appreciation"
                >
                    <TextArea rows={4} placeholder="Veuillez saisir votre appréciation générale ici..." />
                </Form.Item>
            </Spin>
        </Form>
    </Modal>);

}