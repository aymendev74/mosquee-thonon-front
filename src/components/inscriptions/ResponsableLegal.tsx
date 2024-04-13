import { Button, Col, Divider, Row } from "antd";
import { FunctionComponent } from "react";
import { onNumericFieldChanged, validatePhoneNumber } from "../../utils/FormUtils";
import { InputFormItem } from "../common/InputFormItem";
import { SwitchFormItem } from "../common/SwitchFormItem";
import { RadioGroupFormItem } from "../common/RadioGroupFormItem";
import { FormInstance } from "antd/lib";

export type ResponsableLegalProps = {
    isReadOnly: boolean;
    isAdmin: boolean;
    doCalculTarif: () => void;
    onNextStep: React.MouseEventHandler<HTMLElement>;
    form: FormInstance;
}

export const ResponsableLegal: FunctionComponent<ResponsableLegalProps> = ({ isReadOnly, doCalculTarif, onNextStep, form }) => {

    const validatePhoneNumbers = (_: any, value: any) => {
        const telephone = form.getFieldValue(["responsableLegal", "telephone"]);
        const mobile = form.getFieldValue(["responsableLegal", "mobile"]);
        return validatePhoneNumber(mobile, telephone);
    };

    return (<>
        <InputFormItem name="responsableLegal.id" formStyle={{ display: "none" }} type="hidden" />
        <InputFormItem name="responsableLegal.signature" formStyle={{ display: "none" }} type="hidden" />
        <InputFormItem name="responsableLegal.idTarif" formStyle={{ display: "none" }} type="hidden" />
        <Row>
            <Col span={24}>
                <Divider orientation="left">Identité</Divider>
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <InputFormItem label="Nom"
                    name="responsableLegal.nom"
                    rules={[{ required: true, message: "Veuillez saisir votre nom" }]} disabled={isReadOnly} />
            </Col>
            <Col span={12}>
                <InputFormItem label="Prénom"
                    name="responsableLegal.prenom"
                    rules={[{ required: true, message: "Veuillez saisir votre prénom" }]} disabled={isReadOnly} />
            </Col>
        </Row>
        <Row>
            <Col span={24}>
                <Divider orientation="left">Contacts</Divider>
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <InputFormItem label="Numéro et rue"
                    name="responsableLegal.numeroEtRue"
                    rules={[{ required: true, message: "Veuillez saisir votre numéro et rue" }]} disabled={isReadOnly} />
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <InputFormItem label="Code postal" name="responsableLegal.codePostal"
                    rules={[{ required: true, message: "Veuillez saisir votre code postal" },
                    { pattern: /^\d{5}$/, message: "Veuillez saisir un code postale valide", validateTrigger: "onSubmit" }]} disabled={isReadOnly} onKeyDown={onNumericFieldChanged} />
            </Col>
            <Col span={12}>
                <InputFormItem label="Ville" name="responsableLegal.ville" rules={[{ required: true, message: "Veuillez saisir votre ville" }]} disabled={isReadOnly} />
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <InputFormItem label="Téléphone fixe" name="responsableLegal.telephone" rules={[{ validator: validatePhoneNumbers },
                { pattern: /^\d{10}$/, message: "Veuillez saisir un numéro de téléphone valide", validateTrigger: "onSubmit" }
                ]} disabled={isReadOnly} onKeyDown={onNumericFieldChanged} />
            </Col>
            <Col span={12}>
                <InputFormItem label="Mobile" name="responsableLegal.mobile" rules={[{ validator: validatePhoneNumbers },
                { pattern: /^\d{10}$/, message: "Veuillez saisir un numéro de téléphone valide", validateTrigger: "onSubmit" }]}
                    disabled={isReadOnly} onKeyDown={onNumericFieldChanged} />
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <InputFormItem label="E-mail" name="responsableLegal.email" rules={[{ required: true, message: "Veuillez saisir votre adresse e-mail" },
                { type: "email", message: "Veuillez saisir une adresse e-mail valide", validateTrigger: "onSubmit" }
                ]} disabled={isReadOnly} />
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <SwitchFormItem label="Je suis adhérent" name="responsableLegal.adherent" disabled={isReadOnly} onChange={() => doCalculTarif()} />
            </Col>
        </Row>
        <Row>
            <Col span={24}>
                <Divider orientation="left">Autre contact (en cas d'urgence)</Divider>
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <InputFormItem label="Nom" name="responsableLegal.nomAutre" rules={[{ required: true, message: "Veuillez saisir le nom" }]} disabled={isReadOnly} />
            </Col>
            <Col span={12}>
                <InputFormItem label="Prénom" name="responsableLegal.prenomAutre" rules={[{ required: true, message: "Veuillez saisir le prénom" }]} disabled={isReadOnly} />
            </Col>
        </Row >
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <InputFormItem label="Lien de parenté" name="responsableLegal.lienParente" rules={[{ required: true, message: "Veuillez saisir le lien de parenté" }]}
                    disabled={isReadOnly} />
            </Col>
            <Col span={12}>
                <InputFormItem label="Téléphone" name="responsableLegal.telephoneAutre" rules={[{ required: true, message: "Veuillez saisir un numéro de téléphone valide" },
                { pattern: /^\d{10}$/, message: "Veuillez saisir un numéro de téléphone valide", validateTrigger: "onSubmit" }]}
                    disabled={isReadOnly} onKeyDown={onNumericFieldChanged} />
            </Col>
        </Row >
        <Row>
            <Col span={24}>
                <Divider orientation="left">Autorisations</Divider>
            </Col>
        </Row>
        <Row>
            <Col span={24}>
                J'autorise mes enfants à rentrer seuls après l'école :
            </Col>
            <Col span={24}>
                <RadioGroupFormItem name="responsableLegal.autorisationAutonomie" rules={[{ required: true, message: "Veuillez donner ou non votre autorisation" }]}
                    radioOptions={[{ value: "OUI", label: "Oui" }, { value: "NON", label: "Non" }]} disabled={isReadOnly} />
            </Col>
        </Row>
        <Row>
            <Col span={24}>
                J'autorise mes enfants à être photographiés et/ou filmés lors des activités organisées par AMC :
            </Col>
            <Col span={24}>
                <RadioGroupFormItem name="responsableLegal.autorisationMedia" rules={[{ required: true, message: "Veuillez donner ou non votre autorisation" }]}
                    radioOptions={[{ value: "OUI", label: "Oui" }, { value: "NON", label: "Non" }]} disabled={isReadOnly} />
            </Col>
        </Row>
        <div className="container-nav-mono">
            <Button onClick={onNextStep} type="primary">Suivant</Button>
        </div>
    </>);

}