import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { FunctionComponent } from "react";
import { BulletinDtoF, MatiereEnum, TraductionDto } from "../../services/classe";
import { EleveEnrichedDto } from "../../services/eleve";
import { firstLettertoUpperCase } from "../../utils/FormUtils";
import dayjs from "dayjs";


export type PdfBulletinProps = {
    bulletin: BulletinDtoF;
    eleve: EleveEnrichedDto;
    matieres: TraductionDto[];
    nomClasse: string;
    nomPrenomEnseignant: string;
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        padding: 10,
        fontSize: 10,
        fontFamily: "Roboto",
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
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "Roboto",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 20,
        textDecoration: "underline",
    },
    enseignant: {
        fontSize: 11,
        marginBottom: 10,
    },
    eleve: {
        fontSize: 11,
        marginBottom: 20,
    },
    tableau: {
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 4,
        marginBottom: 15,
    },
    ligne: {
        flexDirection: "row",
    },
    headerCell: {
        flex: 1,
        padding: 5,
        textAlign: "center",
        fontWeight: "bold",
        backgroundColor: "#d9d9d9", // gris pour le header
    },
    cell: {
        flex: 1,
        padding: 5,
        textAlign: "center",
    },
    bold: {
        fontWeight: "bold",
    },
    greyCell: {
        backgroundColor: "#f7f7f7", // gris clair pour les lignes impaires
    },
    note: {
        width: "30%",
        textAlign: "center",
        fontSize: 10,
        fontWeight: "bold",
    },
    remarques: {
        width: "40%",
        textAlign: "left",
        fontSize: 10,
    },
    absences: {
        fontSize: 11,
        marginBottom: 10,
    },
    legendeNote: {
        fontSize: 11,
        marginBottom: 35,
        fontStyle: "italic",
    },
    date: {
        fontSize: 11,
        marginBottom: 10,
    },
    appreciation: {
        fontSize: 11,
        marginBottom: 150,
    },
    adresse: {
        fontSize: 9,
        textAlign: 'center',
    }
});

export const PdfBulletin: FunctionComponent<PdfBulletinProps> = ({ bulletin, eleve, matieres, nomPrenomEnseignant }) => {

    const getMoisAnnee = () => {
        return `${firstLettertoUpperCase(dayjs().month(bulletin.mois! - 1).format("MMMM"))} ${bulletin.annee}`;
    };

    const getEleve = () => {
        // Récupérez le nom et le prénom de l'élève à partir de l'objet bulletin
        return `${eleve.nom} ${eleve.prenom}`;
    };

    const getMatieres = (code: MatiereEnum) => {
        // Récupérez le libellé de la matière à partir de l'objet bulletin
        return matieres.find((matiere) => matiere.code == code.toString())?.fr;
    };

    const getNotes = () => {
        return bulletin.bulletinMatieres?.map((bulletinMatiere, idx) => (
            <View key={bulletinMatiere.code} style={styles.ligne}>
                <View style={[styles.cell]}>
                    <Text>{getMatieres(bulletinMatiere.code)}</Text>
                </View>
                <View style={[styles.cell]}>
                    <Text style={styles.bold}>{bulletinMatiere.note}</Text>
                </View>
                <View style={[styles.cell]}>
                    <Text>{bulletinMatiere.remarque}</Text>
                </View>
            </View>
        ));
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.leftSpacer}></View>
                    <Text style={styles.association}>Association Lettres et Cultures</Text>
                    <Image style={styles.logo} src="/images/logo_alc.png" />
                </View>
                <View style={styles.title}>
                    <Text>Bulletin scolaire : {getMoisAnnee()}</Text>
                </View>
                <View style={styles.enseignant}>
                    <Text>Enseignant : {nomPrenomEnseignant}</Text>
                </View>
                <View style={styles.eleve}>
                    <Text>Eleve : {getEleve()}</Text>
                </View>
                <View style={styles.tableau}>
                    <View style={styles.ligne}>
                        <View style={styles.headerCell}>
                            <Text>Matières</Text>
                        </View>
                        <View style={styles.headerCell}>
                            <Text>Notes</Text>
                        </View>
                        <View style={styles.headerCell}>
                            <Text>Remarques</Text>
                        </View>
                    </View>
                    {getNotes()}
                </View>
                <View style={styles.legendeNote}>
                    <Text>NA: Non acquis        EA: En cours d'acquisition      A: Acquis</Text>
                </View>
                <View style={styles.absences}>
                    <Text>Nombre d'absences : {bulletin.nbAbsences}</Text>
                </View>
                <View style={styles.date}>
                    <Text>Date : {bulletin.dateBulletin?.format("DD/MM/YYYY")}</Text>
                </View>
                <View style={styles.appreciation}>
                    <Text>Appréciation générale : {bulletin.appreciation}</Text>
                </View>
                <View style={styles.adresse}>
                    <Text>Association Lettres et Cultures</Text>
                    <Text>5, rue des epinanches</Text>
                    <Text>74200 THONON LES BAINS</Text>
                    <Text>Tel/Fax: 0450706478</Text>
                </View>
            </Page>
        </Document>
    );
};