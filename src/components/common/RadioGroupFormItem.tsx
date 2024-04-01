import { Form, FormItemProps, Radio, RadioGroupProps } from "antd";
import { FunctionComponent } from "react";

export type RadioValue = {
    value: any;
    label: string;
};

export type RadioGroupFormItemProps = RadioGroupProps & FormItemProps & {
    radioOptions: RadioValue[];
};

export const RadioGroupFormItem: FunctionComponent<RadioGroupFormItemProps> = ({ name, label, radioOptions, ...rest }) => {

    const createRadio = (option: RadioValue) => {
        return <Radio key={option.value} value={option.value}>{option.label}</Radio>;
    }

    return (
        <Form.Item name={name.split(".")} label={label} >
            <Radio.Group {...rest}>
                {radioOptions.map(option => createRadio(option))}
            </Radio.Group>
        </Form.Item>
    );

}