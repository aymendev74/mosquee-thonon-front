import { Button, Form, Input, notification } from 'antd';
import { FunctionComponent, useEffect } from 'react';
import { CHANGE_PASSWORD_ENDPOINT, ERROR_INVALID_OLD_PASSWORD } from '../../services/services';
import useApi from '../../hooks/useApi';
import { useForm } from 'antd/es/form/Form';

type FieldType = {
    newPassword?: string;
    oldPassword?: string;
    confirmedNewPassword?: string;
};

export const ChangePassword: FunctionComponent = () => {
    const { result, errorResult, setApiCallDefinition, resetApi } = useApi();
    const [form] = useForm();

    const onFinish = async (values: any) => {
        setApiCallDefinition({ method: "POST", url: CHANGE_PASSWORD_ENDPOINT, data: { oldPassword: values.oldPassword, newPassword: values.newPassword } });
    };

    useEffect(() => {
        if (result) {
            notification.open({ message: "Votre mot de passe a bien été modifié", type: "success" });
            form.resetFields();
        }
        if (errorResult === ERROR_INVALID_OLD_PASSWORD) {
            notification.open({ message: "Le mot de passe actuel est incorrect", type: "error" });
        }
        resetApi();
    }, [result, errorResult]);

    return (
        <Form
            name="basic"
            labelCol={{ span: 14 }}
            wrapperCol={{ span: 10 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
            form={form}
            className="container-full-width"
        >
            <Form.Item<FieldType>
                label="Mot de passe actuel"
                name="oldPassword"
                rules={[{ required: true, message: "Veuillez saisir votre mot de passe actuel" }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item<FieldType>
                label="Nouveau mot de passe"
                name="newPassword"
                rules={[{ required: true, message: "Veuillez saisir votre nouveau mot de passe" }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item<FieldType>
                label="Confirmer nouveau mot de passe"
                name="confirmedNewPassword"
                dependencies={["newPassword"]}
                rules={[{ required: true, message: "Veuillez confirmer votre nouveau mot de passe" }
                    , ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error("Le nouveau mot de passe ne correspond pas"));
                        },
                        validateTrigger: "onSubmit"
                    }),]}
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