import { Button, Col, Divider, Form, Modal, notification, Row, Spin, Tag } from "antd";
import { FunctionComponent, useEffect, useState } from "react"
import useApi from "../../hooks/useApi";
import { ApiCallbacks, buildUrlWithParams, BULLETIN_ENDPOINT, BULLETIN_EXISTING_ENDPOINT, BULLETINS_ELEVE_ENDPOINT, handleApiCall, MATIERES_ENDPOINT } from "../../services/services";
import dayjs from "dayjs";
import { BulletinDto, BulletinDtoB, BulletinDtoF, MatiereDto, MatiereNoteEnum } from "../../services/classe";
import { SelectFormItem } from "../common/SelectFormItem";
import { EleveEnrichedDto } from "../../services/eleve";
import { InputFormItem } from "../common/InputFormItem";
import TextArea from "antd/es/input/TextArea";
import { InputNumberFormItem } from "../common/InputNumberFormItem";
import { firstLettertoUpperCase, prepareBulletinBeforeSave } from '../../utils/FormUtils';
import { useMatieresStore } from "../stores/useMatieresStore";
import { DatePickerFormItem } from "../common/DatePickerFormItem";


export type ModalBulletinProps = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isCreation: boolean,
    bulletin?: BulletinDtoF,
    annees: number[],
    eleve?: EleveEnrichedDto,
}

export const ModalBulletin: FunctionComponent<ModalBulletinProps> = ({ open, setOpen, isCreation, bulletin, annees, eleve }) => {
    const { isLoading, result, setApiCallDefinition, apiCallDefinition, resetApi } = useApi();
    const [form] = Form.useForm();
    const { matieres } = useMatieresStore();

    const close = () => {
        form.resetFields();
        setOpen(false);
    };

    const onValider = (values: any) => {
        const { notes, remarques, ...otherFields } = values;
        const bulletinMatieres = Object.keys(notes || {}).map((idMatiere) => ({
            idMatiere: Number(idMatiere),
            note: notes[idMatiere],
            remarque: remarques?.[idMatiere]
        }));
        const bulletinToSave: BulletinDtoB = prepareBulletinBeforeSave({
            ...bulletin,
            ...otherFields,
            bulletinMatieres
        });
        if (isCreation) {
            setApiCallDefinition({ method: "POST", url: BULLETIN_ENDPOINT, data: bulletinToSave });
        } else {
            setApiCallDefinition({ method: "PUT", url: buildUrlWithParams(BULLETIN_EXISTING_ENDPOINT, { id: bulletin?.id }), data: bulletinToSave });
        }
    }

    const getTitre = () => {
        return isCreation ? "Création d'un nouveau bulletin" : "Modification d'un bulletin";
    }

    useEffect(() => {
        if (bulletin) {
            const notes: Record<string, string> = {};
            const remarques: Record<string, string> = {};
            bulletin.bulletinMatieres?.forEach((matiere) => {
                notes[matiere.idMatiere] = matiere.note;
                remarques[matiere.idMatiere] = matiere.remarque;
            });
            form.setFieldsValue({ ...bulletin, notes, remarques });
        }
    }, [bulletin]);

    function confirmSaveSuccess() {
        notification.success({ message: "Le bulletin a bien été enregistré" });
        close();
        resetApi();
    }

    const apiCallbacks: ApiCallbacks = {
        [`POST:${BULLETIN_ENDPOINT}`]: (result: any) => {
            if (result) {
                confirmSaveSuccess();
                setOpen(false);
            }
        },
        [`PUT:${BULLETIN_ENDPOINT}`]: (result: any) => {
            if (result) {
                confirmSaveSuccess();
                setOpen(false);
            }
        },
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

    return (<Modal title={getTitre()} open={open} width={1000} onCancel={close}
        footer={<>
            <Button onClick={close} type="primary">Annuler</Button>
            <Button htmlType="submit" type="primary" onClick={() => form.submit()} >Valider</Button>
        </>} >
        <Form
            name="periode"
            autoComplete="off"
            form={form}
            onFinish={onValider}
        >
            <Spin spinning={isLoading}>
                <Divider orientation="left">Informations générales</Divider>
                <div>Nom de l'élève: <Tag color="orange" className="m-left-10">{eleve?.prenom} {eleve?.nom}</Tag></div><br />
                <Row gutter={[16, 32]}>
                    <Col span={8}>
                        <SelectFormItem label="Mois" name="mois"
                            options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(mois => ({ value: mois, label: firstLettertoUpperCase(dayjs().month(mois - 1).format("MMMM")) }))}
                            rules={[{ required: true, message: "Veuillez sélectionner le mois" }]} />
                    </Col>
                    <Col span={12}>
                        <SelectFormItem label="Annee" name="annee" options={annees.map(annee => ({ value: annee, label: annee }))}
                            rules={[{ required: true, message: "Veuillez sélectionner l'année" }]} />
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={8}>
                        <InputNumberFormItem name="nbAbsences" label="Nombre d'absences" rules={[{ required: true, message: "Veuillez indiquer le nombre d'absences" }]}
                            min={0} />
                    </Col>
                </Row>
                <Divider orientation="left">Notes</Divider>
                {matieres?.map((matiere) => (
                    <Row key={matiere.id} gutter={[32, 32]}>
                        <Col span={4}>
                            <Tag color="geekblue">{matiere.libelle}</Tag>
                        </Col>
                        <Col span={9}>
                            <SelectFormItem name={"notes." + matiere.id} label="Sélectionnez une note" options={getNotesOptions()}
                                rules={[{ required: true, message: "Veuillez sélectionner une note" }]} />
                        </Col>
                        <Col span={11}>
                            <InputFormItem name={"remarques." + matiere.id} label="Remarques" />
                        </Col>
                    </Row>
                ))}
                <Divider orientation="left">Appréciation générale</Divider>
                <Row gutter={[16, 32]}>
                    <Col span={6}>
                        <DatePickerFormItem name="dateBulletin" label="Date" rules={[{ required: true, message: "Veuillez indiquer la date du bulletin (apparaîtra sur le document PDF)" }]} />
                    </Col>
                    <Col span={18}>
                        <Form.Item
                            label="Appréciation"
                            name="appreciation"
                            rules={[{ required: true, message: "Veuillez indiquer votre appréciation générale" }]}
                        >
                            <TextArea rows={4} placeholder="Veuillez saisir votre appréciation générale ici..." />
                        </Form.Item>
                    </Col>
                </Row>
            </Spin>
        </Form>
    </Modal>);

}