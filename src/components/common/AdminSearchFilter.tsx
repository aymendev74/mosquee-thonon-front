import { Button, Card, Collapse, Form, FormItemProps, Switch, SwitchProps, Tooltip } from "antd";
import { FunctionComponent } from "react";
import { SelectFormItem } from "./SelectFormItem";
import { DatePickerFormItem } from "./DatePickerFormItem";
import { InputFormItem } from "./InputFormItem";
import { DefaultOptionType } from "antd/es/select";
import { SearchOutlined } from "@ant-design/icons";
import { InputNumberFormItem } from "./InputNumberFormItem";

type InputFilterProps = {
    name: string,
    libelle: string,
    inputType: "Select" | "SelectTags" | "Date" | "InputText" | "InputNumber",
    selectOptions?: DefaultOptionType[],
    doSearch?: () => void,
}

const InputFilter: FunctionComponent<InputFilterProps> = ({ name, libelle, inputType, selectOptions, doSearch, ...rest }) => {

    const createInput = () => {
        switch (inputType) {
            case "Select":
                return (<SelectFormItem name={name} label={libelle} placeholder={libelle} options={selectOptions} key={name} allowClear {...rest} />);
            case "SelectTags":
                return (<SelectFormItem name={name} label={libelle} placeholder={libelle} options={selectOptions} key={name} mode="tags" allowClear {...rest} />);
            case "Date":
                return (<DatePickerFormItem onChange={doSearch} name={name} label={libelle} placeholder={libelle} key={name} {...rest} />);
            case "InputText":
                return (<InputFormItem onPressEnter={doSearch} name={name} label={libelle} placeholder={libelle} key={name} {...rest} />);
            case "InputNumber":
                return (<InputNumberFormItem onPressEnter={doSearch} name={name} label={libelle} key={name} {...rest} />);
            default: return (<></>);
        }
    }

    return createInput();
}

export type InputSearchFieldDef = InputFilterProps & {
    tooltip?: string,
}

export type AdminSearchFilterProps = {
    doSearch: () => void;
    inputFilters: InputSearchFieldDef[];
}

export const AdminSearchFilter: FunctionComponent<AdminSearchFilterProps> = ({ inputFilters, doSearch }) => {

    const createInputFilter = (inputFilter: InputSearchFieldDef) => {
        const { name, libelle, inputType, tooltip, selectOptions } = inputFilter;
        if (tooltip) {
            return (
                <Tooltip title={tooltip} color="geekblue" key={name} >
                    <InputFilter doSearch={doSearch} key={name + inputType} name={name} libelle={libelle} inputType={inputType} selectOptions={selectOptions} />
                </Tooltip>
            );
        } else {
            return (<InputFilter doSearch={doSearch} key={name + inputType} name={name} libelle={libelle} inputType={inputType} selectOptions={selectOptions} />);
        }
    }

    return (
        <Card title="Filtres de recherches" bordered={false}>
            {inputFilters.map(inputFilter => createInputFilter(inputFilter))}
            <div className="centered-content">
                <Button icon={<SearchOutlined />} onClick={doSearch} style={{ marginRight: "10px" }} type="primary">Rechercher</Button>
            </div>
        </Card>
    );

}