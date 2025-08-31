import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { FunctionComponent } from "react";
import { BulletinDto, BulletinDtoF, MatiereDto } from "../../services/classe";
import { EleveEnrichedDto } from "../../services/eleve";
import { firstLettertoUpperCase } from "../../utils/FormUtils";
import dayjs from "dayjs";


export type PdfBulletinProps = {
    bulletin: BulletinDtoF;
    eleve: EleveEnrichedDto;
    matieres: MatiereDto[];
    nomClasse: string;
    nomPrenomEnseignant: string;
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        padding: 15,
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
    classe: {
        fontSize: 14,
        marginBottom: 10,
    },
    enseignant: {
        fontSize: 14,
        marginBottom: 10,
    },
    eleve: {
        fontSize: 14,
        marginBottom: 20,
    },
    tableau: {
        border: "1px solid black",
        borderColor: "black",
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 4,
        padding: 10,
    },
    ligne: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid black",
        padding: 5,
    },
    colonne: {
        width: "30%",
        textAlign: "center",
        fontSize: 12,
    },
    remarques: {
        width: "40%",
        textAlign: "left",
        fontSize: 12,
    },
    absences: {
        fontSize: 14,
        marginBottom: 10,
    },
    appreciation: {
        fontSize: 14,
        marginBottom: 20,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 30,
    },
    checkbox: {
        width: 10,
        height: 10,
        borderWidth: 1,
        borderColor: "black",
        marginRight: 5,
    },
    checkmark: {
        position: "relative",
        marginLeft: 5,
        fontSize: 8,
    },
});

export const PdfBulletin: FunctionComponent<PdfBulletinProps> = ({ bulletin, eleve, matieres, nomClasse, nomPrenomEnseignant }) => {

    const getMoisAnnee = () => {
        return `${firstLettertoUpperCase(dayjs().month(bulletin.mois! - 1).format("MMMM"))} ${bulletin.annee}`;
    };

    const getEleve = () => {
        // Récupérez le nom et le prénom de l'élève à partir de l'objet bulletin
        return `${eleve.nom} ${eleve.prenom}`;
    };

    const getMatieres = (idMatiere: number) => {
        // Récupérez le libellé de la matière à partir de l'objet bulletin
        return matieres.find((matiere) => matiere.id === idMatiere)?.libelle;
    };

    const getNotes = () => {
        // Récupérez les notes de l'élève à partir de l'objet bulletin
        // Vous pouvez utiliser la bibliothèque dayjs pour formater les dates
        return bulletin.bulletinMatieres?.map((bulletinMatiere) => (
            <View key={bulletinMatiere.idMatiere} style={styles.ligne}>
                <Text style={styles.colonne}>{getMatieres(bulletinMatiere.idMatiere)}</Text>
                <Text style={styles.colonne}>
                </Text>
                <Text style={styles.remarques}>{bulletinMatiere.remarque}</Text>
            </View>
        ));
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.association}>
                        <Text>Association musulmane du chablais</Text>
                    </View>
                    <Image style={styles.logo} src="/images/logo_mosquee_thonon.png" />
                </View>
                <View style={styles.title}>
                    <Text>{getMoisAnnee()}</Text>
                </View>
                <View style={styles.classe}>
                    <Text>Classe : {nomClasse}</Text>
                </View>
                <View style={styles.enseignant}>
                    <Text>Enseignant : {nomPrenomEnseignant}</Text>
                </View>
                <View style={styles.eleve}>
                    <Text>Eleve : {getEleve()}</Text>
                </View>
                <View style={styles.tableau}>
                    <View style={styles.ligne}>
                        <Text style={styles.colonne}>Matières</Text>
                        <Text style={styles.colonne}>Notes</Text>
                        <Text style={styles.remarques}>Remarques</Text>
                    </View>
                    {getNotes()}
                </View>
                <View style={styles.absences}>
                    <Text>Nombre d'absences : {bulletin.nbAbsences}</Text>
                </View>
                <View style={styles.appreciation}>
                    <Text>Appréciation générale : {bulletin.appreciation}</Text>
                </View>
            </Page>
        </Document>
    );
};