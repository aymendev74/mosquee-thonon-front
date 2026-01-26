import { Button, Checkbox, Col, Divider, Form, Popover, Result, Row, Spin } from "antd";
import { useForm } from "antd/es/form/Form";
import { FunctionComponent } from "react";
import { getConsentementInscriptionCoursLibelle, validateCodePostal, validateMajorite, validatePhoneNumber } from "../../utils/FormUtils";
import { StatutInscription } from "../../services/inscription";
import { InputFormItem } from "../../components/common/InputFormItem";
import { DatePickerFormItem } from "../../components/common/DatePickerFormItem";
import { RadioGroupFormItem } from "../../components/common/RadioGroupFormItem";
import { Sexe } from "../../services/eleve";
import { SelectFormItem } from "../../components/common/SelectFormItem";
import { getNiveauInterneAdulteOptions, getStatutsProfessionnelsOptions } from "../../components/common/commoninputs";
import { SwitchFormItem } from "../../components/common/SwitchFormItem";
import { QuestionCircleOutlined, UserOutlined } from "@ant-design/icons";
import { MultiTagSelect } from "../../components/common/MultiTagSelectFormItem";
import { useCoursArabesAdulteManagement } from "./hooks/useCoursArabesAdulteManagement";
import { LockAlert } from "../../components/common/LockAlert";

export const CoursArabesAdulteForm: FunctionComponent = () => {
    const [form] = useForm();

    const {
        isLoading,
        inscriptionSuccess,
        setInscriptionSuccess,
        consentementChecked,
        setConsentementChecked,
        tarifInscription,
        isInscriptionsFermees,
        isReadOnly,
        isAdmin,
        lockStatus,
        onStatutProfessionnelChanged,
        onFinish,
        getMatieresOptions,
    } = useCoursArabesAdulteManagement({ form });

    const NiveauHelpContent = (
        <div>
            <p><b>Débutant :</b> Aucune ou très peu de connaissances.</p>
            <p><b>Intermédiaire :</b> Connaissances de bases, notamment l'alphabet</p>
            <p><b>Avancé :</b> Connaissances approfondies, sait lire et parler</p>
        </div>
    );

    const getInscriptionFermeesContent = () => {
        return (
            <>
                <div className="centered-content-v">
                    <div className="inscription-closed" />
                    <div className="inscription-closed-text">Les inscriptions sont actuellement fermées</div>
                </div>
            </>
        );
    };

    const getFormContent = () => {
        return inscriptionSuccess ? (
            <div className="centered-content">
                <Result
                    status="success"
                    title="Inscription enregistrée"
                    subTitle={(<div className="result-message">Votre inscription a bien été enregistrée. Vous serez recontacté rapidement.</div>)}
                    extra={[
                        <Button type="primary" onClick={() => setInscriptionSuccess(false)}>
                            Nouvelle inscription
                        </Button>]}
                />
            </div>) :
            (<div className="centered-content">
                <Form
                    name="coursAdulte"
                    onFinish={onFinish}
                    autoComplete="off"
                    form={form}
                    className="container-form"
                >
                    <h2 className="insc-adulte-title">
                        <UserOutlined /> Inscription aux cours arabes pour adultes
                    </h2>
                    <Spin spinning={isLoading} size="large" tip="Enregistrement de votre adhésion...">
                        <LockAlert lockStatus={lockStatus} resourceName="Cette inscription" />
                        <Row>
                            <Col span={24}>
                                <Divider orientation="left">Identité</Divider>
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} md={12}>
                                <InputFormItem label="Nom" name="nom" rules={[{ required: true, message: "Veuillez saisir votre nom" }]}
                                    disabled={isReadOnly} />
                            </Col>
                            <Col xs={24} md={12}>
                                <InputFormItem disabled={isReadOnly} label="Prénom" name="prenom" rules={[{ required: true, message: "Veuillez saisir votre prénom" }]} />
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} md={12}>
                                <DatePickerFormItem label="Date de naissance" name="dateNaissance" rules={[{ required: true, message: "Veuillez saisir votre date de naissance" },
                                { validator: validateMajorite }
                                ]}
                                    placeholder="Sélectionnez une date de naissance" disabled={isReadOnly} />
                            </Col>
                            <Col xs={24} md={12}>
                                <RadioGroupFormItem label="Sexe" name="sexe" disabled={isReadOnly} radioOptions={[{ value: Sexe.MASCULIN, label: "Masculin" },
                                { value: Sexe.FEMININ, label: "Féminin" }]} rules={[{ required: true, message: "Veuillez saisir votre sexe" }]} />
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={15} md={10}>
                                <SelectFormItem label="Niveau" name="niveauInterne" disabled={isReadOnly} options={getNiveauInterneAdulteOptions()}
                                    rules={[{ required: true, message: "Veuillez saisir votre niveau" }]} />
                            </Col>
                            <Col span={3}>
                                <Popover content={NiveauHelpContent} title="Comment choisir votre niveau ?" trigger="click">
                                    <QuestionCircleOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                                </Popover>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={15} md={12} lg={10}>
                                <SelectFormItem label="Statut professionnel" name="statutProfessionnel" disabled={isReadOnly} options={getStatutsProfessionnelsOptions()}
                                    rules={[{ required: true, message: "Veuillez saisir votre statut professionel" }]} onChange={onStatutProfessionnelChanged} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Divider orientation="left">Contacts</Divider>
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} md={16} lg={12}>
                                <InputFormItem label="Numéro et rue" name="numeroEtRue" rules={[{ required: true, message: "Veuillez saisir votre numéro et rue" }]}
                                    disabled={isReadOnly} />
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={10} md={8}>
                                <InputFormItem label="Code postal" name={"codePostal"} rules={[{ validator: validateCodePostal }]} disabled={isReadOnly} required />
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} md={12}>
                                <InputFormItem label="Ville" name="ville" rules={[{ required: true, message: "Veuillez saisir votre ville" }]}
                                    disabled={isReadOnly} />
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} md={12}>
                                <InputFormItem label="Tél. mobile" name="mobile" required
                                    rules={[{ validator: validatePhoneNumber }]} disabled={isReadOnly} />
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} md={12}>
                                <InputFormItem label="E-mail" name="email" rules={[{
                                    required: true,
                                    type: "email",
                                    message:
                                        "Veuillez saisir une adresse e-mail valide",
                                }]} disabled={isReadOnly} required />
                            </Col>
                        </Row>
                        <Divider orientation="left">Domaines d'apprentissage</Divider>
                        <Row>
                            <Col span={24}>
                                <MultiTagSelect name="matieres" label="Enseignement(s) souhaité(s)" options={getMatieresOptions()} disabled={isReadOnly} rules={[
                                    {
                                        required: true,
                                        message: "Veuillez sélectionner au moins une matière",
                                        validator: (_, val) =>
                                            val && val.length > 0
                                                ? Promise.resolve()
                                                : Promise.reject("Veuillez sélectionner au moins une matière"),
                                    },
                                ]} />
                            </Col>
                        </Row>
                        {
                            tarifInscription && tarifInscription.tarif > 0 && (
                                <>
                                    <Divider orientation="left">Tarif</Divider>
                                    <div className="m-bottom-10">Votre tarif annuel : <strong>{tarifInscription.tarif} euros.</strong></div>
                                </>
                            )
                        }
                        {isAdmin && (<><Divider orientation="left">Administration</Divider>
                            <Row gutter={[16, 0]}>
                                <Col xs={24} md={12}>
                                    <RadioGroupFormItem label="Statut adhésion" name="statut" disabled={isReadOnly} radioOptions={[{ value: StatutInscription.PROVISOIRE, label: "Provisoire" },
                                    { value: StatutInscription.VALIDEE, label: "Validée" }]} />
                                </Col>
                            </Row>
                            <Divider orientation="left">Renvoi du mail de confirmation</Divider>
                            <Row gutter={[16, 0]}>
                                <Col xs={24} md={12}>
                                    <SwitchFormItem name="sendMailConfirmation" label="Renvoi automatique du mail de confirmation" disabled={isReadOnly} />
                                </Col>
                            </Row>
                        </>
                        )}
                        <Row gutter={[16, 32]}>
                            <Col span={24}>
                                {!isAdmin && (
                                    <div className="m-top-30">
                                        <Checkbox checked={consentementChecked} onChange={(e) => { setConsentementChecked(e.target.checked) }}>
                                            {getConsentementInscriptionCoursLibelle()}
                                        </Checkbox>
                                    </div>
                                )}
                            </Col>
                        </Row>
                        <div style={{ textAlign: "center", marginTop: 30 }}>
                            {isAdmin && !isReadOnly && (<Button type="primary" htmlType="submit">Enregistrer</Button>)}
                            {!isAdmin && (<Button type="primary" htmlType="submit">Valider mon inscription</Button>)}
                        </div>
                    </Spin>
                </Form >
            </div >
            );
    }

    return isInscriptionsFermees ? getInscriptionFermeesContent() : getFormContent();
}