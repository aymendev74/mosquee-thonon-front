import { FunctionComponent, useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import useApi from '../../hooks/useApi';
import { INSCRIPTION_ENDPOINT } from '../../services/services';
import { Inscription } from '../../services/inscription';
import dayjs from 'dayjs';
import { APPLICATION_DATE_FORMAT } from '../../utils/FormUtils';
import { getLibelleNiveauScolaire } from '../common/commoninputs';

export type PdfInscriptionCoursProps = {
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
        padding: 10,
        fontFamily: "Open Sans",
        fontSize: 11,
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
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: "Open Sans",
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 10,
    },
    association: {
        textAlign: 'center',
        marginBottom: 25,
        fontSize: 16,
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
        marginBottom: 10,
    },
    titreCadreAdmin: {
        textAlign: 'center',
        fontWeight: 'bold',
    },
    detailsCadreAdmin: {
        margin: "5 0",
    },
    titreInfos: {
        textAlign: "center",
        fontWeight: 'bold',
        fontSize: 13,
        textDecoration: "underline",
        marginTop: 10,
        marginBottom: 15,
    },
    dateSignatureContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        padding: 15,
        marginBottom: 10
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
    section: {
        margin: 10,
        padding: 10,
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        padding: 5,
        border: '1px solid black',
        width: "20%",
        textAlign: "center",
    },
    headerCell: {
        fontWeight: 'bold',
        fontSize: 10,
    },
    autorisationEnfant: {
        fontWeight: 'bold',
        marginTop: "15"
    },
    bold: {
        fontWeight: "bold",
    },
    certifieHonneur: {
        marginTop: 15,
        marginBottom: 15,
    },
    adresse: {
        fontSize: 8,
        textAlign: 'center',
    }
});

export const PdfInscriptionCours: FunctionComponent<PdfInscriptionCoursProps> = ({ id }) => {
    const { result, apiCallDefinition, setApiCallDefinition, resetApi } = useApi();
    const [inscription, setInscription] = useState<Inscription | undefined>();

    useEffect(() => {
        if (apiCallDefinition?.method === "GET" && result) { // load de l'adhésion
            const inscription = result as Inscription;
            setInscription(inscription);
            resetApi();
        }
    }, [result]);

    useEffect(() => {
        if (id) {
            setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT + "/" + id });
        }
    }, []);

    const getAutorisationAutonomie = () => {
        return inscription?.responsableLegal.autorisationAutonomie ? "J'autorise mes enfants à sortir seuls après l'école."
            : "Je n'autorise pas mes enfants à sortir seuls après l'école."
    }

    const getAutorisationMedias = () => {
        return inscription?.responsableLegal.autorisationMedia ? "J'autorise mes enfants à être photographiés et/ou filmés lors des activités organisées par AMC ainsi que " +
            "la publication des médias sur le site internet de la mosquée." : "Je n'autorise pas mes enfants à être photographiés et/ou filmés lors des activités organisées par AMC";
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
                        <Text>ANNEE SCOLAIRE ____________________</Text>
                    </View>
                    <View style={styles.cadreAdminContainer}>
                        <View style={styles.titreCadreAdmin}>
                            <Text>Cadre réservé à l'administration</Text>
                        </View>
                        <View>
                            <Text style={styles.detailsCadreAdmin}>Niveau: _________ Classe: _________ Enseignant: _____________________________</Text>
                            <Text style={styles.detailsCadreAdmin}>Paiement: ____________________________ Divers: ______________________________</Text>
                        </View>
                    </View>
                    <View style={styles.titreInfos}>
                        <Text>Renseignements concernant les enfants</Text>
                    </View>
                    <View style={[styles.row, styles.headerCell]}>
                        <Text style={[styles.cell, styles.headerCell]}>Nom</Text>
                        <Text style={[styles.cell, styles.headerCell]}>Prénom</Text>
                        <Text style={[styles.cell, styles.headerCell]}>Date de naissance</Text>
                        <Text style={[styles.cell, styles.headerCell]}>Niveau scolaire</Text>
                        <Text style={[styles.cell, styles.headerCell]}>Réservé admin</Text>
                    </View>
                    {inscription.eleves.map((eleve, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={styles.cell}>{eleve.nom}</Text>
                            <Text style={styles.cell}>{eleve.prenom}</Text>
                            <Text style={styles.cell}>{dayjs(eleve.dateNaissance, APPLICATION_DATE_FORMAT).format(APPLICATION_DATE_FORMAT)}</Text>
                            <Text style={styles.cell}>{getLibelleNiveauScolaire(eleve.niveau)}</Text>
                            <Text style={styles.cell}></Text>
                        </View>
                    ))}
                    <View style={styles.autorisationEnfant}>
                        <Text style={styles.formElement}>{getAutorisationAutonomie()}</Text>
                        <Text style={styles.formElement}>{getAutorisationMedias()}</Text>
                    </View>
                    <View style={styles.titreInfos}>
                        <Text>Renseignements concernant le représentant légal</Text>
                    </View>
                    <View>
                        <Text style={styles.formElement}>Nom et prénom: <Text style={styles.bold}>{inscription.responsableLegal.nom} {inscription.responsableLegal.prenom}</Text></Text>
                        <View style={styles.formElement}>
                            {inscription.responsableLegal.telephone && (<Text>Tél fixe: <Text style={styles.bold}>{inscription.responsableLegal.telephone}</Text></Text>)}
                            {inscription.responsableLegal.mobile && (<Text>Tél mobile: <Text style={styles.bold}>{inscription.responsableLegal.mobile}</Text></Text>)}
                        </View>
                        <Text style={styles.formElement}>
                            Adresse: <Text style={styles.bold}>{inscription.responsableLegal.numeroEtRue} {inscription.responsableLegal.codePostal} {inscription.responsableLegal.ville}</Text>
                        </Text>
                        <Text style={styles.formElement}>
                            Email: <Text style={styles.bold}>{inscription.responsableLegal.email}</Text>
                        </Text>
                        <Text style={styles.formElement}>
                            Autre personne à joindre: <Text style={styles.bold}>{inscription.responsableLegal.nomAutre} {inscription.responsableLegal.prenomAutre}</Text>
                        </Text>
                        <Text style={styles.formElement}>
                            Lien de parenté: <Text style={styles.bold}>{inscription.responsableLegal.lienParente}</Text>        Téléphone: <Text style={styles.bold}>{inscription.responsableLegal.telephoneAutre}</Text>
                        </Text>
                        <Text style={styles.certifieHonneur}>
                            Je certifie sur l'honneur que toute information donnée ci-dessus est exacte et je m'engage à respecter les conditions d'inscription
                            et le règlement intérieur de l'école, dont je dispose d'une copie.
                        </Text>
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
            </Document >
        </>
    ) : (<></>);
} 