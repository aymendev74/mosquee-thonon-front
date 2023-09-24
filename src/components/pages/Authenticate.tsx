import { Button, Form, Input } from 'antd';
import { Dispatch, FunctionComponent, SetStateAction } from 'react';
import { authenticate } from '../../services/services';

export type AuthenticateProps = {
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>,
}

type FieldType = {
    username?: string;
    password?: string;
    remember?: string;
};

export const Authenticate: FunctionComponent<AuthenticateProps> = ({ setIsLoggedIn }) => {

    const onFinish = async (values: any) => {
        const username: string = values.username;
        const password: string = values.password;
        const token = await authenticate(username, password);
        if (token) {
            localStorage.setItem("token", token)
            setIsLoggedIn(true);
        }
    };

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