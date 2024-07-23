import { EasyMassAdminLayout } from "@easy-messe/shared-ui";
import { Box, Typography } from "@mui/material";
import AppLayout from "../../components/Layout";
import { ReactNode } from "react";
import { useIntl } from "react-intl";

export default function Parishes() {
    const { formatMessage } = useIntl()
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            marginBottom: 1

        }}>
            <Typography
                variant='h3'
                color='primary'
                sx={{
                    paddingBottom: 0
                }}
            >

                {formatMessage({ id: 'listOfMassSupply' })}
            </Typography>
        </Box>

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