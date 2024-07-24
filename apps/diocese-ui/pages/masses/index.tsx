import { Box, Typography } from "@mui/material";
import { EasyMassAdminLayout } from "@easy-messe/shared-ui";
import AppLayout from "../../components/Layout";
import { ReactNode } from "react";


export default function Masses() {
    return (
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