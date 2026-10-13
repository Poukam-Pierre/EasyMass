import { Footer } from "@easy-messe/shared-ui";
import { Box } from "@mui/material";
import PasswordRecoveryUnavailable from "../../../components/PasswordRecoveryUnavailable";

export default function ChangePassword() {
    return (
        <Box sx={{
            height: '100svh',
            display: 'grid',
            gridTemplateRows: '1fr auto'
        }}>
            <PasswordRecoveryUnavailable />
            <Footer />
        </Box>

    );
}
