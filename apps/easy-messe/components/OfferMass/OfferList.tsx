import { Box, Button, Typography } from "@mui/material";
import { useIntl } from "react-intl";

interface OfferListProps {
    children: JSX.Element
}

export default function OfferList({ children }: OfferListProps) {
    const { formatMessage } = useIntl()
    return (
        <Box sx={{
            padding: '10px 10px 0px 10px',
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            height: { laptop: 'inherit', mobile: '50vh' }
        }}>
            <Typography variant="h2"> {formatMessage({ id: 'RequestList' })}</Typography>
            {children}
            <Button
                variant="contained"
                disableElevation
                sx={{
                    width: 'fit-content'
                }}
            >{formatMessage({ id: 'Souscribe' })}</Button>
        </Box>
    );
}
