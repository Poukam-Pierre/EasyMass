import { useOfferMass } from "@easy-messe/libs/theme";
import { Box, Button, Typography } from "@mui/material";
import { useIntl } from "react-intl";

interface OfferListProps {
    children: JSX.Element
}

export default function OfferList({ children }: OfferListProps) {
    const { formatMessage } = useIntl()
    const { massRequested } = useOfferMass()
    return (
        <Box sx={{
            padding: '10px 10px 0px 10px',
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            rowGap: '20px'
        }}>
            <Typography
                variant="h2"
                sx={{
                    paddingBottom: 0
                }}

            > {formatMessage({ id: 'requestList' })}</Typography>
            {children}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                alignItems: 'center',
                columnGap: '10px'
            }}>
                <Button
                    variant="contained"
                    disableElevation
                    sx={{
                        width: 'fit-content',
                    }}
                    disabled={massRequested.length === 0 ? true : false}
                >{formatMessage({ id: 'souscribe' })}</Button>
                <Typography>Total à payer : </Typography>
            </Box>
        </Box>
    );
}
