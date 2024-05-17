import { DatePicker, DatePickerProps, Form } from "antd";
import { FormItemProps } from "antd/es/form";
import { FunctionComponent } from "react";
import { APPLICATION_DATE_FORMAT } from "../../utils/FormUtils";

export type DatePickerFormItemProps = DatePickerProps & FormItemProps;

export const DatePickerFormItem: FunctionComponent<DatePickerFormItemProps> = ({ name, label, rules, ...rest }) => {

    return (
        <Form.Item name={name.split(".")} label={label} rules={rules}>
            <DatePicker format={APPLICATION_DATE_FORMAT} {...rest} />
        </Form.Item>
    );
}