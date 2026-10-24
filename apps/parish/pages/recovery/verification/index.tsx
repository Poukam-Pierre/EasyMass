import { Footer } from "@easy-messe/shared-ui";
import { Box } from "@mui/material";
import StatusScreen from "../../../components/StatusScreen";

export default function MailVerification() {
    return (
        <Box sx={{
            height: '100svh',
            display: 'grid',
            gridTemplateRows: '1fr auto'
        }}>
            {/* Self-service password recovery has no backend endpoint yet — a
                working-looking form here would silently do nothing on submit. */}
            <StatusScreen titleId="recoveryUnavailableTitle" messageId="recoveryUnavailableMessage" />
            <Footer />
        </Box>

    );
}
