import { Form, FormItemProps, Input, InputProps } from "antd";
import { FunctionComponent } from "react";

export type InputFormItemProps = InputProps & FormItemProps & {
    formStyle?: React.CSSProperties;
};

export const InputFormItem: FunctionComponent<InputFormItemProps> = ({ name, label, rules, formStyle, required, ...rest }) => {

    return (
        <Form.Item name={name.split(".")} label={label} rules={rules} style={formStyle} required={required}>
            <Input {...rest} />
        </Form.Item>
    );
}