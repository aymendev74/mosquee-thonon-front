import { Button, Col, Form, Input, Result, Row, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { AccountInfos, AccountInfosSchema } from '../../services/user';
import { RESET_PASSWORD_ENDPOINT, RESET_PASSWORD_INFORMATIONS_ENDPOINT, RESET_PASSWORD_REQUEST_ENDPOINT } from '../../services/services';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [accountInfos, setAccountInfos] = useState<AccountInfos | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(!!token);
    const { execute } = useApi();
    const [resetSuccess, setResetSuccess] = useState<boolean>(false);
    const [requestSent, setRequestSent] = useState<boolean>(false);
    const [tokenInvalid, setTokenInvalid] = useState<boolean>(false);

    useEffect(() => {
        if (!token) return;
        const fetchUserAccountInformations = async () => {
            setIsLoading(true);
            const result = await execute<AccountInfos>({ method: "GET", url: RESET_PASSWORD_INFORMATIONS_ENDPOINT, params: { token } }, AccountInfosSchema);
            if (result.successData) {
                setAccountInfos(result.successData);
            } else {
                setTokenInvalid(true);
            }
            setIsLoading(false);
        };
        fetchUserAccountInformations();
    }, [token]);

    const handleRequestReset = async (values: any) => {
        setIsLoading(true);
        const result = await execute<void>({ method: "POST", url: RESET_PASSWORD_REQUEST_ENDPOINT, data: { username: values.username } });
        if (result.success) {
            setRequestSent(true);
        }
        setIsLoading(false);
    };

    const handleResetPassword = async (values: any) => {
        const { password } = values;
        const username = accountInfos!.username;
        const result = await execute<void>({ method: "POST", url: RESET_PASSWORD_ENDPOINT, data: { password, token, username } });
        if (result.success) {
            setResetSuccess(true);
        }
    };

    if (isLoading) {
        return (
            <div className="centered-content">
                <Spin spinning={true} />
            </div>
        );
    }

    if (requestSent) {
        return (
            <Result
                status="success"
                title="Demande envoyée"
                subTitle="Si un compte existe avec cette adresse e-mail, vous recevrez un lien dans quelques instants pour réinitialiser votre mot de passe."
                extra={[
                    <Button type="link" onClick={() => window.location.href = "/login"} key="login">
                        Se connecter
                    </Button>,
                ]}
            />
        );
    }

    if (resetSuccess) {
        return (
            <Result
                status="success"
                title="Mot de passe réinitialisé"
                subTitle="Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter."
                extra={[
                    <Button type="link" onClick={() => window.location.href = "/login"} key="login">
                        Se connecter
                    </Button>,
                ]}
            />
        );
    }

    if (token && tokenInvalid) {
        return <Result status="warning" title="Ce lien est invalide" subTitle="Veuillez vérifier l'URL ou contacter l'administrateur." />;
    }

    if (!token) {
        return (
            <div className="centered-content">
                <Form
                    name="reset-password-request"
                    onFinish={handleRequestReset}
                    className="container-form">
                    <h2 className="user-activation-title">Réinitialisation du mot de passe</h2>
                    <p>Veuillez saisir votre nom d'utilisateur. Un lien de réinitialisation vous sera envoyé.</p>
                    <Spin spinning={isLoading}>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} md={14}>
                                <Form.Item
                                    label="Nom d'utilisateur"
                                    name="username"
                                    rules={[
                                        { required: true, message: "Veuillez saisir votre nom d'utilisateur" }
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">Envoyer</Button>
                        </Form.Item>
                    </Spin>
                </Form>
            </div>
        );
    }

    return (
        <div className="centered-content">
            <Form
                name="reset-password-form"
                onFinish={handleResetPassword}
                className="container-form">
                <h2 className="user-activation-title">Réinitialisation du mot de passe</h2>
                <h3>Bienvenue {accountInfos!.username} !</h3>
                <p>Veuillez saisir votre nouveau mot de passe (minimum 8 caractères).</p>
                <Spin spinning={isLoading}>
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={14}>
                            <Form.Item
                                label="Nouveau mot de passe"
                                name="password"
                                rules={[
                                    { required: true, message: 'Veuillez saisir votre mot de passe' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (value && value.length < 8) {
                                                return Promise.reject(new Error('Le mot de passe doit contenir au minimum 8 caractères'));
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={14}>
                            <Form.Item
                                label="Confirmez"
                                name="confirmedPassword"
                                dependencies={["password"]}
                                rules={[
                                    { required: true, message: 'Veuillez confirmer votre mot de passe' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Réinitialiser le mot de passe</Button>
                    </Form.Item>
                </Spin>
            </Form>
        </div>
    );
};

export default ResetPassword;
