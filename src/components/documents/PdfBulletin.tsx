import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { FunctionComponent } from "react";


export type PdfBulletinProps = {
    id: number;
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

export const PdfBulletin: FunctionComponent<PdfBulletinProps> = ({ id }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.association}>
                        <Text>Association musulmane du chablais</Text>
                    </View>
                </View>
            </Page>
        </Document >
    );
} 