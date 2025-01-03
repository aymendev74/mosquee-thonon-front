import { DatePicker, DatePickerProps, Form } from "antd";
import { FormItemProps } from "antd/es/form";
import { FunctionComponent } from "react";
import { APPLICATION_DATE_FORMAT } from "../../utils/FormUtils";

export type DatePickerFormItemProps = DatePickerProps & FormItemProps;

export const DatePickerFormItem: FunctionComponent<DatePickerFormItemProps> = ({ name, label, rules, picker, onChange, disabled }) => {

    return (
        <Form.Item name={name.split(".")} label={label} rules={rules}>
            {picker === "year" ?
                (<DatePicker picker={picker} onChange={onChange} disabled={disabled} />)
                : (<DatePicker format={APPLICATION_DATE_FORMAT} picker={picker} onChange={onChange} disabled={disabled} />)}
        </Form.Item>
    );
}