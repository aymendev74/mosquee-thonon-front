import { Button, Collapse, Form, FormItemProps, Switch, SwitchProps, Tooltip } from "antd";
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
}

const InputFilter: FunctionComponent<InputFilterProps> = ({ name, libelle, inputType, selectOptions, ...rest }) => {

    const createInput = () => {
        switch (inputType) {
            case "Select":
                return (<SelectFormItem name={name} label={libelle} placeholder={libelle} options={selectOptions} key={name} allowClear {...rest} />);
            case "SelectTags":
                return (<SelectFormItem name={name} label={libelle} placeholder={libelle} options={selectOptions} key={name} mode="tags" allowClear {...rest} />);
            case "Date":
                return (<DatePickerFormItem name={name} label={libelle} placeholder={libelle} key={name} {...rest} />);
            case "InputText":
                return (<InputFormItem name={name} label={libelle} placeholder={libelle} key={name} {...rest} />);
            case "InputNumber":
                return (<InputNumberFormItem name={name} label={libelle} key={name} {...rest} />);
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

    const { Panel } = Collapse;

    const createInputFilter = (inputFilter: InputSearchFieldDef) => {
        const { name, libelle, inputType, tooltip, selectOptions } = inputFilter;
        if (tooltip) {
            return (
                <Tooltip title={tooltip} color="geekblue" key={name} >
                    <InputFilter key={name + inputType} name={name} libelle={libelle} inputType={inputType} selectOptions={selectOptions} />
                </Tooltip>
            );
        } else {
            return (<InputFilter key={name + inputType} name={name} libelle={libelle} inputType={inputType} selectOptions={selectOptions} />);
        }
    }

    return (
        <Collapse defaultActiveKey={['1']}>
            <Panel header="Filtres de recherche" key="1">
                {inputFilters.map(inputFilter => createInputFilter(inputFilter))}
                <div className="centered-content">
                    <Button icon={<SearchOutlined />} onClick={doSearch} style={{ marginRight: "10px" }} type="primary">Rechercher</Button>
                </div>
            </Panel>
        </Collapse>
    );

}