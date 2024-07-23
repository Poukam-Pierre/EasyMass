import { EasyMassAdminLayout } from "@easy-messe/shared-ui";
import { Box, Button, Typography } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import AppLayout from "../../components/Layout";
import ParishesTable, { ParishData } from "../../components/Parishes/ParishesTables";



export default function Parishes() {
    const [parishData, setParishData] = useState<ParishData[]>([])


    const parishesData: ParishData[] = [
        {
            id: 1,
            name: 'Saint Paul Apôtre',
            city: 'Bangangté',
            email: 'saintp@gmail.com',
            contact: '+237 680 090 489'
        },
        {
            id: 2,
            name: 'Marie Reine des apôtres de Kamtop',
            city: 'Bafoussam',
            email: 'marier@gmail.com',
            contact: '+237 680 090 489'
        },
        {
            id: 3,
            name: 'Notre dame des sept douleur de Bangangté',
            city: 'Bangangté',
            email: 'notred@gmail.com',
            contact: '+237 680 090 489'
        },
    ]

    useEffect(() => {
        setParishData(parishesData)
    }, [])

    return (
        <>
            <Box sx={{
                padding: '0 16px 40px 0'
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <Typography
                        variant="h3"
                        color='primary'
                        sx={{
                            paddingBottom: 0
                        }}
                    >
                        Liste des différentes paroisses
                    </Typography>
                    <Button
                        variant="contained"
                    >
                        + Ajouter une paroisse
                    </Button>
                </Box>
            </Box>
            <ParishesTable parishDataTable={parishData} />
        </>

    );
}

Parishes.getLayout = function getLayout(page: ReactNode) {
    return (
        <EasyMassAdminLayout>
            <AppLayout>
                {page}
            </AppLayout>
        </EasyMassAdminLayout>
    );
};