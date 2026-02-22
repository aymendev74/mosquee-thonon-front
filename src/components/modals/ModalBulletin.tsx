import { Button, Col, Divider, Form, Modal, notification, Row, Spin, Tag, Tooltip } from "antd";
import { FunctionComponent, useEffect, useState } from "react"
import { ApiCallbacks, buildUrlWithParams, BULLETIN_ENDPOINT, BULLETIN_EXISTING_ENDPOINT, BULLETINS_ELEVE_ENDPOINT, handleApiCall, MATIERES_ENDPOINT } from "../../services/services";
import dayjs from "dayjs";
import { BulletinDtoB, BulletinDtoF, MatiereNoteEnum, TypeMatiereEnum } from "../../services/classe";
import { SelectFormItem } from "../common/SelectFormItem";
import { EleveEnrichedDto } from "../../services/eleve";
import { InputFormItem } from "../common/InputFormItem";
import TextArea from "antd/es/input/TextArea";
import { InputNumberFormItem } from "../common/InputNumberFormItem";
import { firstLettertoUpperCase, prepareBulletinBeforeSave } from '../../utils/FormUtils';
import { useMatieresStore } from "../stores/useMatieresStore";
import { DatePickerFormItem } from "../common/DatePickerFormItem";
import useApi, { APICallResult } from "../../hooks/useApi";
import { useLock } from "../../hooks/useLock";
import { ResourceType, LockResultDto } from "../../types/lock";
import { LockAlert } from "../common/LockAlert";

export type ModalBulletinProps = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isCreation: boolean,
    bulletin?: BulletinDtoF,
    annees: number[],
    eleve?: EleveEnrichedDto,
    nbAbsences: number,
}

export const ModalBulletin: FunctionComponent<ModalBulletinProps> = ({ open, setOpen, isCreation, bulletin, annees, eleve, nbAbsences }) => {
    const { execute, isLoading } = useApi();
    const [form] = Form.useForm();
    const { getMatieresByType } = useMatieresStore();

    // Gestion du verrou pour l'édition de bulletin (uniquement en modification)
    const { lockStatus, acquireLock, releaseLock, updateLockStatus, isLocked } = useLock(
        ResourceType.BULLETIN,
        !isCreation && bulletin?.id ? bulletin.id : null
    );

    // Forcer le mode lecture seule si le verrou est en conflit
    const isReadOnly = lockStatus.status === 'conflict';

    const close = async () => {
        if (!isCreation && lockStatus.status === 'acquired') {
            await releaseLock();
        }
        form.resetFields();
        setOpen(false);
    };

    const onValider = async (values: any) => {
        const { notes, remarques, ...otherFields } = values;
        const bulletinMatieres = Object.keys(notes || {}).map((code) => ({
            code,
            note: notes[code],
            remarque: remarques?.[code]
        }));
        const bulletinToSave: BulletinDtoB = prepareBulletinBeforeSave({
            ...bulletin,
            ...otherFields,
            bulletinMatieres
        });
        let result = null;
        if (isCreation) {
            result = await execute<BulletinDtoB>({ method: "POST", url: BULLETIN_ENDPOINT, data: bulletinToSave });
        } else {
            result = await execute<BulletinDtoB>({ method: "PUT", url: buildUrlWithParams(BULLETIN_EXISTING_ENDPOINT, { id: bulletin?.id }), data: bulletinToSave });
        }

        if (result.success) {
            if (!isCreation) {
                await releaseLock();
            }
            confirmSaveSuccess();
            setOpen(false);
        } else if (result.errorData && !isCreation) {
            // Vérifier si c'est une erreur de conflit de verrou (409)
            const lockData = result.errorData as LockResultDto;
            if (lockData && typeof lockData.acquired !== 'undefined' && !lockData.acquired) {
                // Le verrou a été perdu pendant l'édition
                updateLockStatus({
                    status: 'conflict',
                    expiresAt: lockData.expiresAt,
                    username: lockData.username
                });
                notification.error({
                    message: "Verrou expiré",
                    description: `Votre verrou a expiré. Ce bulletin est maintenant modifié par ${lockData.username} jusqu'à ${new Date(lockData.expiresAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}. Vos modifications n'ont pas été enregistrées.`,
                    duration: 8
                });
            }
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
                notes[matiere.code.toString()] = matiere.note;
                remarques[matiere.code.toString()] = matiere.remarque;
            });
            form.setFieldsValue({ ...bulletin, notes, remarques });

            // Tenter d'acquérir le verrou si on est en mode modification
            if (!isCreation) {
                acquireLock();
            } else { // en cration, on set le nombre d'absences calculés automatiquement (feuilles présence)
                form.setFieldValue("nbAbsences", nbAbsences);
            }
        }
    }, [bulletin, isCreation]);

    function confirmSaveSuccess() {
        notification.success({ message: "Le bulletin a bien été enregistré" });
        close();
    }

    function getNotesOptions() {
        return [{ value: MatiereNoteEnum.A, label: <Tag color="green">Acquis</Tag> },
        { value: MatiereNoteEnum.EA, label: <Tag color="orange">En cours d'acquisition</Tag> },
        { value: MatiereNoteEnum.NA, label: <Tag color="red">Non acquis</Tag> }];
    }

    return (<Modal title={getTitre()} open={open} width={1000} onCancel={close}
        footer={<>
            <Button onClick={close} type="primary">Annuler</Button>
            <Button htmlType="submit" type="primary" onClick={() => form.submit()} disabled={isReadOnly}>Valider</Button>
        </>} >
        <Form
            name="periode"
            autoComplete="off"
            form={form}
            onFinish={onValider}
        >
            <Spin spinning={isLoading}>
                {!isCreation && <LockAlert lockStatus={lockStatus} resourceName="Ce bulletin" />}
                <Divider orientation="left">Informations générales</Divider>
                <div>Nom de l'élève: <Tag color="orange" className="m-left-10">{eleve?.prenom} {eleve?.nom}</Tag></div><br />
                <Row gutter={[16, 32]}>
                    <Col xs={24} sm={8}>
                        <SelectFormItem label="Mois" name="mois" disabled={isReadOnly}
                            options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(mois => ({ value: mois, label: firstLettertoUpperCase(dayjs().month(mois - 1).format("MMMM")) }))}
                            rules={[{ required: true, message: "Veuillez sélectionner le mois" }]} />
                    </Col>
                    <Col xs={24} sm={12}>
                        <SelectFormItem label="Annee" name="annee" disabled={isReadOnly} options={annees.map(annee => ({ value: annee, label: annee }))}
                            rules={[{ required: true, message: "Veuillez sélectionner l'année" }]} />
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col xs={24} sm={8}>
                        <Tooltip title="Le nombre d'absences est calculé automatiquement sur la base des feuilles de présence" color="geekblue">
                            <InputNumberFormItem name="nbAbsences" label="Nombre d'absences" disabled={isReadOnly}
                                min={0} />
                        </Tooltip>
                    </Col>
                </Row>
                <Divider orientation="left">Notes</Divider>
                {getMatieresByType(TypeMatiereEnum.ENFANT).map((matiere) => (
                    <Row key={matiere.code} gutter={[32, 32]}>
                        <Col xs={24} sm={4}>
                            <Tag color="geekblue">{matiere.fr}</Tag>
                        </Col>
                        <Col xs={24} sm={9}>
                            <SelectFormItem name={"notes." + matiere.code} label="Sélectionnez une note" disabled={isReadOnly} options={getNotesOptions()} />
                        </Col>
                        <Col xs={24} sm={11}>
                            <InputFormItem name={"remarques." + matiere.code} label="Remarques" disabled={isReadOnly} />
                        </Col>
                    </Row>
                ))}
                <Divider orientation="left">Appréciation générale</Divider>
                <Row gutter={[16, 32]}>
                    <Col xs={24} sm={6}>
                        <DatePickerFormItem name="dateBulletin" label="Date" disabled={isReadOnly} />
                    </Col>
                    <Col xs={24} sm={18}>
                        <Form.Item
                            label="Appréciation"
                            name="appreciation"
                        >
                            <TextArea rows={4} placeholder="Veuillez saisir votre appréciation générale ici..." disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                </Row>
            </Spin>
        </Form>
    </Modal>);

}