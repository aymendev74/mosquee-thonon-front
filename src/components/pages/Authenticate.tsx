import { Button, Form, Input } from 'antd';
import { FunctionComponent } from 'react';
import { AUTHENTIFICATION_ENDPOINT } from '../../services/services';
import { useAuth } from '../../hooks/UseAuth';
import useApi from '../../services/useApi';

type FieldType = {
    username?: string;
    password?: string;
    remember?: string;
};

export const Authenticate: FunctionComponent = () => {
    const { login } = useAuth();
    const { result, setApiCallDefinition } = useApi();

    const onFinish = async (values: any) => {
        setApiCallDefinition({ method: "POST", url: AUTHENTIFICATION_ENDPOINT, data: { username: values.username, password: values.password } });
    };

    if (result && login) {
        login(result as string);
    }

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
            <Form.Item<FieldType>
                label="Nom d'utilisateur"
                name="username"
                rules={[{ required: true, message: "Veuillez saisir votre nom d'utilisateur" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item<FieldType>
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
        </Form>
    );
}