import { FunctionComponent, useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import useApi from '../../hooks/useApi';
import { ADHESION_ENDPOINT } from '../../services/services';
import { Adhesion } from '../../services/adhesion';
import { getConsentementLibelle } from '../../utils/FormUtils';

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
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    association: {
        textAlign: 'center',
        marginBottom: 25,
        fontSize: 18,
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: "bold",
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
    conditions: {
        fontSize: 9,
        marginBottom: 100,
    },
    adresse: {
        fontSize: 8,
        textAlign: 'center',
    },
    bold: {
        fontWeight: "bold",
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 30,
    },
    checkbox: {
        width: 10,
        height: 10,
        borderWidth: 1,
        borderColor: 'black',
        marginRight: 5,
    },
    checkmark: {
        position: "relative",
        marginLeft: 5,
        fontSize: 8,
    },
    label: {
        fontSize: 12,
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
                        <View style={styles.association}>
                            <Text>Association musulmane du chablais</Text>
                        </View>
                        <Image style={styles.logo} src="./logo_mosquee_thonon.png" />
                    </View>
                    <View style={styles.memberNumberContainer}>
                        <View style={styles.memberNumber}>
                            <Text>N° de membre:<Text style={styles.bold}>{adhesion.noMembre}</Text></Text>
                        </View>
                    </View>
                    <View>
                        <Text style={styles.title}>AMC - Fiche Adhérent</Text>
                    </View>
                    <View style={[styles.formElement, { marginBottom: 20 }]}>
                        <Text>{getSoussigneLibelle()} <Text style={styles.bold}>{getEtatCivil()} {adhesion.nom} {adhesion.prenom}</Text></Text>
                    </View>
                    <View style={styles.formElement}>
                        <Text>Adresse : <Text style={styles.bold}>{adhesion.numeroEtRue}</Text></Text>
                    </View>
                    <View style={styles.formElement}>
                        <Text>Code postal : <Text style={styles.bold}>{adhesion.codePostal}</Text></Text>
                    </View>
                    <View style={styles.formElement}>
                        <Text>Ville : <Text style={styles.bold}>{adhesion.ville}</Text></Text>
                    </View>
                    <View style={styles.formElement}>
                        <Text>E-mail : <Text style={styles.bold}>{adhesion.email}</Text></Text>
                    </View>
                    <View style={[styles.formElement, { marginBottom: 20 }]}>
                        {adhesion.mobile && (<Text>Tél. Mobile: <Text style={styles.bold}>{adhesion.mobile}</Text></Text>)}
                    </View>
                    <View style={styles.formElement}>
                        <Text>Je certifie sur l'honneur l'exactitude des informations ci-dessus.</Text>
                    </View>
                    <View style={styles.formElement}>
                        <Text style={styles.bold}>Je sollicite mon admission comme membre de l'association musulmane du chablais (AMC)</Text>
                    </View>
                    <View style={[styles.formElement, { fontWeight: "bold" }]}>
                        <Text>{`Je m'engage à verser mensuellement la somme de ${getMontant()} euros`}</Text>
                    </View>
                    <View style={[styles.formElement, { fontWeight: "bold", marginBottom: 20 }]}>
                        <Text>De ce fait, je m'engage à respecter ses statuts(1), son règlement intérieur(2) et à verser ma cotisation(3) régulièrement</Text>
                    </View>
                    <View style={styles.checkboxContainer}>
                        <View style={styles.checkbox} />
                        <Text style={styles.label}>{getConsentementLibelle()}</Text>
                    </View>
                    <View style={styles.dateSignatureContainer}>
                        <Text style={styles.date}>Date: ____/____/____</Text>
                        <Text style={styles.signature}>Signature: ____________</Text>
                    </View>
                    <View style={styles.conditions}>
                        <Text>(1) Disponible sur demande à l'AMC</Text>
                        <Text>(2) Le règlement est affiché à l'intérieur des locaux de l'AMC</Text>
                        <Text>(3) Le montant de la cotisation mensuel est libre</Text>
                    </View>
                    <View style={styles.adresse}>
                        <Text>Association musulmane du chablais</Text>
                        <Text>5, rue des epinanches</Text>
                        <Text>74200 THONON LES BAINS</Text>
                        <Text>Tel/Fax: 0450706478</Text>
                    </View>
                </Page>
            </Document>
        </>
    ) : (<></>);
} 