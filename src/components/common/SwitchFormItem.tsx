import { Form, FormItemProps, Switch, SwitchProps } from "antd";
import { FunctionComponent } from "react";

export type SwitchFormItemProps = SwitchProps & FormItemProps;

export const SwitchFormItem: FunctionComponent<SwitchFormItemProps> = ({ name, label, required, ...rest }) => {

    return (
        <Form.Item name={name.split(".")} label={label}>
            <Switch {...rest} />
        </Form.Item>
    );

}