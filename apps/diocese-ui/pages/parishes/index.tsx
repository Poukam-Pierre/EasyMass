import { EasyMassAdminLayout } from "@easy-messe/shared-ui";
import { Box, Button, Typography } from "@mui/material";
import { ReactNode } from "react";
import { useIntl } from "react-intl";
import AppLayout from "../../components/Layout";
import ParishesTable from "../../components/Parishes/ParishesTables";



export default function Parishes() {
    const { formatMessage } = useIntl()
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
            <ParishesTable />
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