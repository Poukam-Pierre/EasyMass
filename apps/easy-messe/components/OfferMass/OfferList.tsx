import { Box, Button, Typography } from "@mui/material";

interface OfferListProps {
    children: JSX.Element
}

export default function OfferList({ children }: OfferListProps) {
    return (
        <Box sx={{
            padding: '10px 10px 0px 10px',
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            height: { laptop: 'inherit', mobile: '50vh' }
        }}>
            <Typography variant="h2">Liste de demandes</Typography>
            {children}
            <Button
                variant="contained"
                disableElevation
                sx={{
                    width: 'fit-content'
                }}
            >Payer</Button>
        </Box>
    );
}
