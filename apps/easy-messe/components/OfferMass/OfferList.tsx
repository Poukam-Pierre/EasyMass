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
            height: { laptop: 'inherit', mobile: '50vh' }
        }}>
            <Typography variant="h2"> {formatMessage({ id: 'requestList' })}</Typography>
            {children}
            <Button
                variant="contained"
                disableElevation
                sx={{
                    width: 'fit-content'
                }}
                disabled={massRequested === null ? true : false}
            >{formatMessage({ id: 'souscribe' })}</Button>
        </Box>
    );
}
