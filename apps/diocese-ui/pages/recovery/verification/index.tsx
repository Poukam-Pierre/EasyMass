import { Footer, GetMailVerification } from "@easy-messe/shared-ui";
import { Box } from "@mui/material";

export default function MailVerification() {
    return (
        <Box sx={{
            height: '100svh',
            display: 'grid',
            gridTemplateRows: '1fr auto'
        }}>
            <GetMailVerification />
            <Footer />
        </Box>

    );
}
