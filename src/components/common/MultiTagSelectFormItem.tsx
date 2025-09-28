import { CheckOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, FormItemProps, Tag } from "antd";
import { Rule } from "antd/es/form";
import { FunctionComponent } from "react";

export type MultiTagSelectProps = {
    options: { value: string; label: React.ReactNode }[];
    name: string;
    label: string;
    disabled: boolean;
    rules?: Rule[];
}

export const MultiTagSelect: FunctionComponent<MultiTagSelectProps> = ({ options, name, label, disabled, rules }) => {

    const form = Form.useFormInstance();
    const value: string[] = Form.useWatch(name, form) || [];

    const toggle = (val: string) => {
        const newValue = value.includes(val)
            ? value.filter((v) => v !== val)
            : [...value, val];
        form.setFieldValue(name, newValue);
    };

    return (
        <Form.Item name={name} rules={rules} label={label}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {options.map((opt) => (
                    <Button
                        type={value.includes(opt.value) ? "primary" : "default"}
                        shape="round"
                        onClick={() => toggle(opt.value)}
                        disabled={disabled}
                        className={disabled && value.includes(opt.value) ? "readonly-selected" : ""}
                        key={opt.value}
                    >
                        {opt.label}
                    </Button>
                ))}
            </div>
        </Form.Item>
    );
}