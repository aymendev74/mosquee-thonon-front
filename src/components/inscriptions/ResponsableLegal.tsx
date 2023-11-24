import { Button, Checkbox, Col, DatePicker, Divider, Form, Input, Radio, Row, Switch } from "antd";
import { FunctionComponent } from "react";
import { SignatureDto, StatutInscription } from "../../services/inscription";

export type ResponsableLegalProps = {
    isReadOnly: boolean;
    isAdmin: boolean;
}

type FieldType = {
    id: number;
    nom: string;
    prenom: string;
    dateNaissance: string;
    telephone: string;
    email: string;
    sexe: string;
    numeroEtRue: string;
    codePostal: number;
    ville: string;
    statut: StatutInscription;
    mobile: string;
    signature: SignatureDto;
};


export const ResponsableLegal: FunctionComponent<ResponsableLegalProps> = ({ isReadOnly, isAdmin }) => {

    const onNumericFieldChanged = (e: any) => {
        if (!["Backspace", "Tab", "End", "Home", "ArrowLeft", "ArrowRight"].includes(e.key) && isNaN(e.key)) {
            e.preventDefault();
        }
    }

    return (<>
        <Form.Item name={["responsableLegal", "id"]} style={{ display: "none" }}>
            <Input type="hidden" />
        </Form.Item>
        <Form.Item name={["responsableLegal", "signature"]} style={{ display: "none" }}>
            <Input type="hidden" />
        </Form.Item>
        <Form.Item name={["responsableLegal", "idTarif"]} style={{ display: "none" }}>
            <Input type="hidden" />
        </Form.Item>
        <Row>
            <Col span={24}>
                <Divider orientation="left">Identité</Divider>
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <Form.Item
                    label="Nom"
                    name={["responsableLegal", "nom"]}
                    rules={[{ required: true, message: "Veuillez saisir votre nom" }]}
                >
                    <Input disabled={isReadOnly} />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    label="Prénom"
                    name={["responsableLegal", "prenom"]}
                    rules={[{ required: true, message: "Veuillez saisir votre prénom" }]}
                >
                    <Input disabled={isReadOnly} />
                </Form.Item>
            </Col>
        </Row>
        <Row>
            <Col span={24}>
                <Divider orientation="left">Contacts</Divider>
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <Form.Item
                    label="Numéro et rue"
                    name={["responsableLegal", "numeroEtRue"]}
                    rules={[{ required: true, message: "Veuillez saisir votre numéro et rue" }]}
                >
                    <Input disabled={isReadOnly} />
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <Form.Item
                    label="Code postal"
                    name={["responsableLegal", "codePostal"]}
                    rules={[{ required: true, message: "Veuillez saisir votre code postal" },
                    { pattern: /^\d{5}$/, message: "Veuillez saisir un code postale valide", validateTrigger: "onSubmit" }]}
                >
                    <Input disabled={isReadOnly} onKeyDown={onNumericFieldChanged} />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    label="Ville"
                    name={["responsableLegal", "ville"]}
                    rules={[{ required: true, message: "Veuillez saisir votre ville" }]}
                >
                    <Input disabled={isReadOnly} />
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <Form.Item
                    label="Téléphone fixe"
                    name={["responsableLegal", "telephone"]}
                    rules={[{ required: true, message: "Veuillez saisir votre téléphone fixe" },
                    { pattern: /^\d{10}$/, message: "Veuillez saisir un numéro de téléphone valide", validateTrigger: "onSubmit" }
                    ]}
                >
                    <Input disabled={isReadOnly} onKeyDown={onNumericFieldChanged} />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    label="Mobile"
                    name={["responsableLegal", "mobile"]}
                    rules={[{ required: true, message: "Veuillez saisir votre téléphone mobile" },
                    { pattern: /^\d{10}$/, message: "Veuillez saisir un numéro de téléphone valide", validateTrigger: "onSubmit" }]}
                >
                    <Input disabled={isReadOnly} onKeyDown={onNumericFieldChanged} />
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <Form.Item
                    label="E-mail"
                    name={["responsableLegal", "email"]}
                    rules={[{ required: true, message: "Veuillez saisir votre adresse e-mail" },
                    { type: "email", message: "Veuillez saisir une adresse e-mail valide", validateTrigger: "onSubmit" }
                    ]}
                >
                    <Input disabled={isReadOnly} />
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <Form.Item
                    label="Je suis adhérent"
                    name={["responsableLegal", "adherent"]}
                >
                    <Switch disabled={isReadOnly} />
                </Form.Item>
            </Col>
        </Row>
        {
            isAdmin &&
            <>
                <Row>
                    <Col span={24}>
                        <Divider orientation="left">Statut inscription</Divider>
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="Statut"
                            name="statut"
                        >
                            <Radio.Group disabled={isReadOnly} >
                                <Radio value={StatutInscription.PROVISOIRE}>Provisoire</Radio>
                                <Radio value={StatutInscription.VALIDEE}>Validée</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                </Row>
            </>
        }
    </>);

}