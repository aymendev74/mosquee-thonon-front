import { FunctionComponent } from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { getConsentementInscriptionCoursLibelle } from '../../utils/FormUtils';
import { InscriptionAdulteBack } from '../../services/inscription';
import { Sexe } from '../../services/eleve';
import { MatiereEnum, TraductionDto, TypeMatiereEnum } from '../../services/classe';
import { useMatieresStore } from '../stores/useMatieresStore';

export type PdfInscriptionCoursArabeAdulteProps = {
    inscription: InscriptionAdulteBack;
    matieres: TraductionDto[];
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        padding: 15,
        fontFamily: "Roboto",
        fontSize: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    leftSpacer: {
        width: 110,
    },
    association: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: "bold",
    },
    logo: {
        width: 110,
        height: 110,
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20,
        textDecoration: "underline",
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

export const PdfInscriptionCoursArabeAdulte: FunctionComponent<PdfInscriptionCoursArabeAdulteProps> = ({ inscription, matieres }) => {

    const getSexeLibelle = () => {
        return inscription?.sexe === Sexe.MASCULIN ? "Masculin" : "Féminin";
    }

    const getMatieres = () => {
        return matieres.filter(matiere => inscription?.matieres.includes(matiere.code as MatiereEnum))
            .map(matiere => matiere.fr).join(" / ");
    }

    return inscription ? (
        <>
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <View style={styles.leftSpacer}></View>
                        <Text style={styles.association}>Association Lettres et Cultures</Text>
                        <Image style={styles.logo} src="/images/logo_alc.png" />
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
                        <Text>Date de naissance : <Text style={styles.bold}>{inscription.dateNaissance}</Text></Text>
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
                    <View style={[styles.formElement]}>
                        {inscription.mobile && (<Text>Tél. Mobile: <Text style={styles.bold}>{inscription.mobile}</Text></Text>)}
                    </View>
                    {getMatieres().length > 0 &&
                        (<View style={[styles.formElement]}>
                            {inscription.mobile && (<Text>Enseignements souhaités : <Text style={styles.bold}>{getMatieres()}</Text></Text>)}
                        </View>)
                    }
                    <View style={[styles.checkboxContainer, { marginTop: 20 }]}>
                        <View style={styles.checkbox} />
                        <Text style={styles.labelConsentement}>{getConsentementInscriptionCoursLibelle()}</Text>
                    </View>
                    <View style={styles.dateSignatureContainer}>
                        <Text style={styles.date}>Date: ____/____/____</Text>
                        <Text style={styles.signature}>Signature: ____________</Text>
                    </View>
                    <View style={styles.adresse}>
                        <Text>Association Lettres et Cultures</Text>
                        <Text>5, rue des epinanches</Text>
                        <Text>74200 THONON LES BAINS</Text>
                        <Text>Tel/Fax: 0450706478</Text>
                    </View>
                </Page>
            </Document>
        </>
    ) : (<></>);
} 