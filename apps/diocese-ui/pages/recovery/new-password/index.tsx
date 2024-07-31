import { Footer, GetNewPassword } from "@easy-messe/shared-ui";
import { Box } from "@mui/material";


export default function ChangePassword() {

    return (
        <Box sx={{
            height: '100svh',
            display: 'grid',
            gridTemplateRows: '1fr auto'
        }}>
            <GetNewPassword />
            <Footer />
        </Box>

    );
}
