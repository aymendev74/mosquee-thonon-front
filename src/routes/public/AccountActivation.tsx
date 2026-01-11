import { Button, Col, Form, Input, Result, Row, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { AccountInfos, AccountInfosSchema } from '../../services/user';
import { USER_ACCOUNT_ENABLE_ENDPOINT, USER_ACCOUNT_INFORMATIONS_ENDPOINT } from '../../services/services';

const AccountActivation: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [accountInfos, setAccountInfos] = useState<AccountInfos | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { execute } = useApi();
    const [activationSuccess, setActivationSuccess] = useState<boolean>(false);

    useEffect(() => {
        const fetchUserAccountInformations = async () => {
            setIsLoading(true);
            const result = await execute<AccountInfos>({ method: "GET", url: USER_ACCOUNT_INFORMATIONS_ENDPOINT, params: { token } }, AccountInfosSchema);
            if (result.successData) {
                setAccountInfos(result.successData);
            }
            setIsLoading(false);
        };
        fetchUserAccountInformations();
    }, [token]);

    if (!accountInfos || accountInfos.enabled) {
        return <Result status="warning" title="Ce lien est invalide" subTitle="Veuillez vérifier l'URL ou contacter l'administrateur." />;
    }

    const handleFinish = async (values: any) => {
        const { password } = values;
        const { username } = accountInfos;
        const result = await execute<void>({ method: "POST", url: USER_ACCOUNT_ENABLE_ENDPOINT, data: { password, token, username } });
        if (result.success) {
            setActivationSuccess(true);
        }
    };

    if (activationSuccess) {
        return (
            <Result
                status="success"
                title="Activation réussie"
                subTitle="Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter et profiter du service."
                extra={[
                    <Button type="link" onClick={() => window.location.href = "/login"}>
                        Se connecter
                    </Button>,
                ]}
            />
        );
    }

    return (
        <div className="centered-content">
            <Form name="activation-form"
                onFinish={handleFinish}
                className="container-form">
                <h2 className="user-activation-title">Activation de votre compte utilisateur</h2>
                <h3>Bienvenue {accountInfos.username} !</h3>
                <p>Plus qu'une étape afin de pouvoir utiliser votre compte. Veuillez saisir un mot de passe (minimum 8 caractères).</p>
                <Spin spinning={isLoading}>
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={14}>
                            <Form.Item
                                label="Mot de passe"
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
                        <Button type="primary" htmlType="submit">Activer le compte</Button>
                    </Form.Item>
                </Spin>
            </Form>
        </div >
    );
};

export default AccountActivation;