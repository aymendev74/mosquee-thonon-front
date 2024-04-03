import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Form, InputNumber, Result, Spin } from "antd";
import { FunctionComponent, useCallback, useState } from "react";
import { InputNumberFormItem } from "../common/InputNumberFormItem";
import { v4 as uuidv4 } from 'uuid';
import { useForm } from "antd/es/form/Form";
import { error } from "console";


export const FaireUnDon: FunctionComponent = () => {

    const initialOptions = {
        clientId: "Ad6TJgKOBnSwc2rset7qpKCm8O_hRYqT8WaXPGGmwdgeAZqXlbmDTvZ_CQbs3Oexev7QfXji9l-djTa-",
        currency: "EUR",
        intent: "capture",
    };

    // ce composant sert uniquement à encapsuler les boutons paypal et pouvoir utiliser le hook usePayPalScriptReducer
    // sinon on a une erreur car le hook ne peut être utilisé qu'en étant un enfant de PayPalScriptProvider
    const PayPalButtonWrapper = () => {
        const [{ isPending }] = usePayPalScriptReducer();
        const [form] = useForm();
        const [success, setSuccess] = useState<boolean>(false);
        const [error, setError] = useState<boolean>(false);

        const createOrder = useCallback((data: any, actions: any) => {
            const montantDon = form.getFieldValue("montantDon");
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: montantDon
                    }
                }]
            });
        }, []);

        const onApprove = async (data: any, actions: any) => {
            await actions.order.capture();
            setSuccess(true);
        };

        const onError = async (err: any) => {
            console.log(err);
            setError(true);
        };

        const getContent = () => {
            if (success) {
                return (<div className="centered-content-v">
                    <Result
                        status="success"
                        title="Paiement accepté"
                        subTitle={(<div className="result-message">Votre paiement a bien été accepté, et l'association musulmane du chablais vous remercie chaleureusement pour votre don.</div>)}
                    />
                </div>);
            }

            if (error) {
                return (<div className="centered-content-v">
                    <Result
                        status="error"
                        title="Une erreur s'est produite"
                        subTitle={(<div className="result-message">Une erreur s'est produite, votre paiement n'a pas pu aboutir</div>)}
                    />
                </div>);
            }

            return (<div className="centered-content-v">
                <Form form={form}>
                    <InputNumberFormItem name="montantDon" label="Montant de votre don" className=" m-bottom-15"
                        min={1} initialValue={20} addonAfter="€" />
                </Form>
                <Spin spinning={isPending} >
                    <PayPalButtons createOrder={createOrder} onApprove={(onApprove)} onError={onError} />
                </Spin>
            </div>)
        }

        return getContent();
    }

    return (
        <PayPalScriptProvider options={initialOptions}>
            <PayPalButtonWrapper />
        </PayPalScriptProvider>
    );
}