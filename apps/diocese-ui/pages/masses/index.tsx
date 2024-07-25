import { Box, Typography } from "@mui/material";
import { EasyMassAdminLayout } from "@easy-messe/shared-ui";
import AppLayout from "../../components/Layout";
import { ReactNode } from "react";
import FinancialTableParishes, { FinanceParish } from "../../components/Masses/FinancialTableParishes";


export default function Masses() {
    const financeParishData: FinanceParish[] = [
        {
            id: 1,
            name: 'Saint Paul Apôtre',
            city: 'Bangangté',
            massType: 'unique',
            price: 1000,
        },
        {
            id: 2,
            name: 'Marie Reine des apôtres de Kamtop',
            city: 'Bouda',
            massType: 'triduum',
            price: 7000,
        },
        {
            id: 3,
            name: 'Immaculée Conception de la Vierge Marie de Briqueterie',
            city: 'Bamena',
            massType: 'septaine',
            price: 4000,
        },

    ]
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
                        Prix des différentes messes et leur paroisse
                    </Typography>
                </Box>
            </Box>
            <FinancialTableParishes financeParishData={financeParishData} />
        </>
    );
}

Masses.getLayout = function getLayout(page: ReactNode) {
    return (
        <EasyMassAdminLayout>
            <AppLayout>
                {page}
            </AppLayout>
        </EasyMassAdminLayout>
    );
};