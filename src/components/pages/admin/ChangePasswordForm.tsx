import { Button, Form, Input, Spin, notification } from 'antd';
import { FunctionComponent, useState } from 'react';
import { CHANGE_PASSWORD_ENDPOINT, ERROR_INVALID_OLD_PASSWORD } from '../../../services/services';
import { useForm } from 'antd/es/form/Form';
import { useAuth } from '../../../hooks/AuthContext';
import { UnahtorizedAccess } from '../UnahtorizedAccess';
import useApi from '../../../hooks/useApi';

type FieldType = {
    newPassword?: string;
    oldPassword?: string;
    confirmedNewPassword?: string;
};

export const ChangePassword: FunctionComponent = () => {
    const { username } = useAuth();
    const { execute, isLoading } = useApi();
    const [form] = useForm();

    const onFinish = async (values: any) => {
        const { successData, errorData } = await execute<boolean>({ method: "POST", url: CHANGE_PASSWORD_ENDPOINT, data: { oldPassword: values.oldPassword, newPassword: values.newPassword } });
        if (successData) {
            notification.open({ message: "Votre mot de passe a bien été modifié", type: "success" });
            form.resetFields();
        }
        if (errorData === ERROR_INVALID_OLD_PASSWORD) {
            notification.open({ message: "Le mot de passe actuel est incorrect", type: "error" });
        }
    };

    return username ? (
        <div className="centered-content">
            <Form
                name="changePassword"
                labelCol={{ span: 14 }}
                wrapperCol={{ span: 10 }}
                style={{ maxWidth: 600, marginTop: "100px" }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                autoComplete="off"
                form={form}
                className="container-full-width"
            >
                <Spin spinning={isLoading}>
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
                </Spin>
            </Form>
        </div>
    ) : <UnahtorizedAccess />

}