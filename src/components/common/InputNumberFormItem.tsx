import { Form, InputNumber, InputNumberProps } from "antd";
import { FormItemProps, Rule } from "antd/es/form";
import { FunctionComponent } from "react";

export type InputNumberFormItemProps = InputNumberProps & FormItemProps;

export const InputNumberFormItem: FunctionComponent<InputNumberFormItemProps> = ({ name, label, rules, initialValue, required, ...rest }) => {

    return (
        <Form.Item name={name?.split(".")} label={label} rules={rules} initialValue={initialValue} required={required}>
            <InputNumber {...rest} />
        </Form.Item>
    );
}