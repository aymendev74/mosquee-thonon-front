import { DatePicker, DatePickerProps, Form } from "antd";
import { FormItemProps } from "antd/es/form";
import { FunctionComponent } from "react";

export type DatePickerFormItemProps = DatePickerProps & FormItemProps;

export const DatePickerFormItem: FunctionComponent<DatePickerFormItemProps> = ({ name, label, rules, ...rest }) => {

    return (
        <Form.Item name={name.split(".")} label={label} rules={rules}>
            <DatePicker format='DD.MM.YYYY' placeholder='DD.MMYYYY' {...rest} />
        </Form.Item>
    );
}