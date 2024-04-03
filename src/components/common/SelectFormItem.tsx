import { Form, FormItemProps, Select, SelectProps } from "antd";
import { FunctionComponent } from "react";

export type SelectFormItemProps = SelectProps & FormItemProps;

export const SelectFormItem: FunctionComponent<SelectFormItemProps> = ({ name, label, rules, ...rest }) => {

    return (
        <Form.Item name={name.split(".")} label={label} rules={rules}>
            <Select {...rest} />
        </Form.Item>
    );
}