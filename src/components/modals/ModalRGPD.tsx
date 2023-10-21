import { Button, Modal } from 'antd';
import { FunctionComponent } from 'react';

export type ModaleRGPDProps = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
}

export const ModaleRGPD: FunctionComponent<ModaleRGPDProps> = ({ open, setOpen }) => {
    return (<Modal open={open} footer={<Button onClick={() => setOpen(false)}>Fermer</Button>} width={800} onCancel={() => setOpen(false)}>
        <div className="centered-content">
            Les informations recueillies dans le questionnaire sont enregistrées dans un fichier informatisé par l'association musulmane du chablais. <br />
            Le but de la collecte de vos données personnelles est de vous mettre en contact avec un des responsables de l'association musulmane du chablais,
            dans le but de finaliser votre inscription aux cours dispensés par l'association.<br />
            Les données marquées par un astérisque dans le questionnaire doivent obligatoirement être fournies.<br /><br />

            Les données collectées seront communiquées uniquement aux responsables de l'association musulmane du chablais.
            Elles seront conservées durant la période pendant laquelle vous serez inscrit.<br />
            A la fin de la relation, vous pouvez demander la suppression totale de vos données personnelles de notre fichier.
            Si aucune demande de votre part n'est faite en ce sens, vos données seront effacées automatiquement au bout d'un délai de 2 ans.<br /><br />

            Vous pouvez également, accéder aux données vous concernant et les rectifier sur simple demande. <br />
            Tout demande d'accès, de modification ou de suppression de vos données personnelles doivent être adressées par e-mail à l'adresse suivante : amc@gmail.com<br /><br />

            Consultez le site cnil.fr pour plus d’informations sur vos droits.

            Si vous estimez, après nous avoir contactés, que vos droits « Informatique et Libertés » ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL.
        </div>
    </Modal>);

}