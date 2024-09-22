import { FunctionComponent, useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import useApi from '../../hooks/useApi';
import { buildUrlWithParams, INSCRIPTION_ADULTE_ENDPOINT } from '../../services/services';
import { APPLICATION_DATE_FORMAT, getConsentementInscriptionCoursLibelle } from '../../utils/FormUtils';
import { InscriptionAdulte } from '../../services/inscription';
import { Sexe } from '../../services/eleve';
import dayjs from 'dayjs';

export type PdfInscriptionCoursArabeAdulteProps = {
    id: number;
};

Font.register({
    family: 'Roboto',
    fonts: [
        { src: './polices/roboto/Roboto-Regular.ttf' },
        { src: './polices/roboto/Roboto-Bold.ttf', fontWeight: "bold" }
    ]
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        padding: 15,
        fontFamily: "Roboto",
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
        fontFamily: "Roboto",
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
    cadreAdminContainer: {
        margin: "10 auto",
        textAlign: 'center',
        width: "80%",
        border: '1px solid black',
        borderRadius: 15,
        padding: 5,
        marginBottom: 30,
    },
    titreCadreAdmin: {
        textAlign: 'center',
        fontWeight: 'bold',
    },
    detailsCadreAdmin: {
        margin: "5 0",
        fontWeight: 'bold',
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
        marginBottom: 10,
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
    labelConsentement: {
        fontSize: 9,
    },
});

export const PdfInscriptionCoursArabeAdulte: FunctionComponent<PdfInscriptionCoursArabeAdulteProps> = ({ id }) => {
    const { result, apiCallDefinition, setApiCallDefinition, resetApi } = useApi();
    const [inscription, setInscription] = useState<InscriptionAdulte | undefined>();

    useEffect(() => {
        if (apiCallDefinition?.method === "GET" && result) { // load de l'adhésion
            const inscription = result as InscriptionAdulte;
            setInscription(inscription);
            resetApi();
        }
    }, [result]);

    useEffect(() => {
        if (id) {
            setApiCallDefinition({ method: "GET", url: buildUrlWithParams(INSCRIPTION_ADULTE_ENDPOINT, { id: id }) });
        }
    }, []);

    const getSexeLibelle = () => {
        return inscription?.sexe === Sexe.MASCULIN ? "Masculin" : "Féminin";
    }

    return inscription ? (
        <>
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <View style={styles.association}>
                            <Text>Association musulmane du chablais</Text>
                        </View>
                        <Image style={styles.logo} src="./logo_mosquee_thonon.png" />
                    </View>
                    <View style={styles.title}>
                        <Text>FICHE D'INSCRIPTION AUX COURS D'ARABE</Text>
                        <Text>ANNEE SCOLAIRE {inscription.anneeScolaire}</Text>
                    </View>
                    <View style={styles.cadreAdminContainer}>
                        <View style={styles.titreCadreAdmin}>
                            <Text>Cadre réservé à l'administration</Text>
                        </View>
                        <View>
                            <Text style={styles.detailsCadreAdmin}>Tarif: {inscription.montantTotal} euros                  Divers: ______________________________</Text>
                        </View>
                    </View>
                    <View style={[styles.formElement]}>
                        <Text>Nom et prénom : <Text style={styles.bold}>{inscription.nom} {inscription.prenom}</Text></Text>
                    </View>
                    <View style={[styles.formElement]}>
                        <Text>Date de naissance : <Text style={styles.bold}>{dayjs(inscription.dateNaissance, APPLICATION_DATE_FORMAT).format(APPLICATION_DATE_FORMAT)}</Text></Text>
                    </View>
                    <View style={styles.formElement}>
                        <Text>Sexe : <Text style={styles.bold}>{getSexeLibelle()}</Text></Text>
                    </View>
                    <View style={styles.formElement}>
                        <Text>Adresse : <Text style={styles.bold}>{inscription.numeroEtRue}</Text></Text>
                    </View>
                    <View style={styles.formElement}>
                        <Text>Code postal : <Text style={styles.bold}>{inscription.codePostal}</Text></Text>
                    </View>
                    <View style={styles.formElement}>
                        <Text>Ville : <Text style={styles.bold}>{inscription.ville}</Text></Text>
                    </View>
                    <View style={styles.formElement}>
                        <Text>E-mail : <Text style={styles.bold}>{inscription.email}</Text></Text>
                    </View>
                    <View style={[styles.formElement, { marginBottom: 20 }]}>
                        {inscription.mobile && (<Text>Tél. Mobile: <Text style={styles.bold}>{inscription.mobile}</Text></Text>)}
                    </View>
                    <View style={styles.checkboxContainer}>
                        <View style={styles.checkbox} />
                        <Text style={styles.labelConsentement}>{getConsentementInscriptionCoursLibelle()}</Text>
                    </View>
                    <View style={styles.dateSignatureContainer}>
                        <Text style={styles.date}>Date: ____/____/____</Text>
                        <Text style={styles.signature}>Signature: ____________</Text>
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