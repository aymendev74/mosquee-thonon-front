import { Button, Form, Input, Spin, notification } from 'antd';
import { FunctionComponent, useEffect } from 'react';
import { AUTHENTIFICATION_ENDPOINT, ERROR_INVALID_CREDENTIALS } from '../../services/services';
import { useAuth } from '../../hooks/UseAuth';
import useApi from '../../hooks/useApi';
import { AuthResponse } from '../../services/AuthResponse';
import { useNavigate } from 'react-router-dom';
import { InputFormItem } from '../common/InputFormItem';

export const Authenticate: FunctionComponent = () => {
    const { login } = useAuth();
    const { errorResult, result, setApiCallDefinition, resetApi, isLoading } = useApi();
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setApiCallDefinition({ method: "POST", url: AUTHENTIFICATION_ENDPOINT, data: { username: values.username, password: values.password } });
    };

    useEffect(() => {
        if (result && login) {
            login(result as AuthResponse);
            navigate("/administration");
        }
        if (errorResult === ERROR_INVALID_CREDENTIALS) {
            notification.open({ message: "Vos identifiants sont incorrects", type: "error" });
        }
        resetApi();
    }, [result, errorResult]);

    return (
        <Form
            name="basic"
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 14 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
        >
            <Spin spinning={isLoading} >
                <InputFormItem label="Nom d'utilisateur" name="username" rules={[{ required: true, message: "Veuillez saisir votre nom d'utilisateur" }]} />
                <Form.Item
                    label="Mot de passe"
                    name="password"
                    rules={[{ required: true, message: "Veuillez saisir votre mot de passe" }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 10, span: 14 }}>
                    <Button type="primary" htmlType="submit">
                        Connexion
                    </Button>
                </Form.Item>
            </Spin>
        </Form>
    );
}