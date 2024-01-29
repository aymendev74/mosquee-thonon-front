import React, { FunctionComponent, useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import useApi from '../../hooks/useApi';
import { ADHESION_ENDPOINT } from '../../services/services';
import { Adhesion } from '../../services/adhesion';

export type PdfAdhesionProps = {
    id: number;
};

const styles = StyleSheet.create({
    page: { backgroundColor: 'white' },
    section: { color: 'black', textAlign: 'center', margin: 30 }
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

    const getNomPrenomAdhesion = () => {
        return "Adhésion de : " + adhesion?.nom + " " + adhesion?.prenom;
    }

    const getMontantAdhesion = () => {
        return "Montant du versement : " + adhesion?.montantAutre + " euros";
    }

    return adhesion ? (
        <Document>
            <Page size="A4" style={styles.page}>
                <div>
                    <View style={styles.section}>
                        <Text>{getNomPrenomAdhesion()}</Text>
                    </View>
                </div>
                <div>
                    <View style={styles.section}>
                        <Text>{getMontantAdhesion()}</Text>
                    </View>
                </div>
                <div>
                    <View style={styles.section}>
                        <Text>Fonctionnalité en cours d'implémentation...</Text>
                    </View>
                </div>
            </Page>
        </Document>
    ) : (<></>);
} 