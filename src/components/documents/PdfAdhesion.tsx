import { FunctionComponent, useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import useApi from '../../hooks/useApi';
import { ADHESION_ENDPOINT } from '../../services/services';
import { Adhesion } from '../../services/adhesion';

export type PdfAdhesionProps = {
    id: number;
};

Font.register({
    family: 'Open Sans',
    fonts: [
        { src: './polices/open-sans/OpenSans-Regular.ttf' },
        { src: './polices/open-sans/OpenSans-Bold.ttf', fontWeight: "bold" }
    ]
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        padding: 15,
        fontFamily: "Open Sans",
        fontSize: 12,
    },
    header: {
        flexDirection: 'row-reverse',
        marginBottom: 15,
    },
    logo: {
        width: 50,
        height: 50,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: "Open Sans",
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 25,
        textDecoration: "underline",
    },
    memberNumberContainer: {
        width: "40%",
        border: '1px solid black',
        borderRadius: 15,
        padding: 5,
        marginBottom: 15,
    },
    memberNumber: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 15,
        fontSize: 14,
    },
    dateSignatureContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        padding: 15,
        marginBottom: 30,
    },
    signature: {
        marginRight: 10,
    },
    date: {
        marginRight: 10,
    },
    formElement: {
        marginBottom: 5,
    },
});

export const PdfAdhesion: FunctionComponent<PdfAdhesionProps> = ({ id }) => {
    const { result, apiCallDefinition, setApiCallDefinition, resetApi } = useApi();
    const [adhesion, setAdhesion] = useState<Adhesion | undefined>();

    useEffect(() => {
        if (apiCallDefinition?.method === "GET" && result) { // load de l'adhésion
            const adhesion = result as Adhesion;
            setAdhesion(adhesion);
            resetApi();
        }
    }, [result]);

    useEffect(() => {
        if (id) {
            setApiCallDefinition({ method: "GET", url: ADHESION_ENDPOINT + "/" + id });
        }
    }, []);

    const getEtatCivil = () => {
        return adhesion?.titre === "M" ? "Monsieur" : "Madame";
    }

    const getMontant = () => {
        return adhesion?.montant ? adhesion?.montant : adhesion?.montantAutre;
    }

    const getSoussigneLibelle = () => {
        return adhesion?.titre === "M" ? "Je soussigné" : "Je soussignée";
    }

    return adhesion ? (
        <>
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Image style={styles.logo} src="./logo_mosquee_thonon.png" />
                    </View>
                    <View style={styles.memberNumberContainer}>
                        <View style={styles.memberNumber}>
                            <Text>{`N° de membre: ${adhesion.noMembre}`}</Text>
                        </View>
                    </View>
                    <View>
                        <Text style={styles.title}>AMC - Fiche Adhérent</Text>
                    </View>
                    <View style={[styles.formElement, { marginBottom: 20 }]}>
                        <Text>{getSoussigneLibelle()} {getEtatCivil()} {adhesion.nom} {adhesion.prenom} </Text>
                    </View>
                    <View style={styles.formElement}>
                        <Text>{`Adresse : ${adhesion.numeroEtRue}`}</Text>
                    </View>
                    <View style={styles.formElement}>
                        <Text>{`Code postal : ${adhesion.codePostal}`}</Text>
                    </View>
                    <View style={styles.formElement}>
                        <Text>{`Ville : ${adhesion.ville}`}</Text>
                    </View>
                    <View style={styles.formElement}>
                        <Text>{`E-mail : ${adhesion.email}`}</Text>
                    </View>
                    <View style={[styles.formElement, { marginBottom: 20 }]}>
                        <Text>{`Tél: ${adhesion.telephone}`}    {`Mobile: ${adhesion.mobile}`}</Text>
                    </View>
                    <View style={styles.formElement}>
                        <Text>Je certifie sur l'honneur l'exactitude des informations ci-dessus.</Text>
                    </View>
                    <View style={styles.formElement}>
                        <Text>Je sollicite mon admission comme membre de l'association musulmane du chablais (AMC)</Text>
                    </View>
                    <View style={[styles.formElement, { fontWeight: "bold" }]}>
                        <Text>{`Je m'engage à verser mensuellement la somme de ${getMontant()} euros`}</Text>
                    </View>
                    <View style={[styles.formElement, { fontWeight: "bold", marginBottom: 20 }]}>
                        <Text>De ce fait, je m'engage à respecter ses statuts(1), son règlement intérieur(2) et à verser ma cotisation(3) régulièrement</Text>
                    </View>
                    <View style={styles.dateSignatureContainer}>
                        <Text style={styles.date}>Date: ____/____/____</Text>
                        <Text style={styles.signature}>Signature: ____________</Text>
                    </View>
                    <View style={[styles.formElement, { fontSize: "9" }]}>
                        <Text>(1) Disponible sur demande à l'AMC</Text>
                        <Text>(2) Le règlement est affiché à l'intérieur des locaux de l'AMC</Text>
                        <Text>(3) Le montant de la cotisation mensuel est libre</Text>
                    </View>
                </Page>
            </Document>
        </>
    ) : (<></>);
} 