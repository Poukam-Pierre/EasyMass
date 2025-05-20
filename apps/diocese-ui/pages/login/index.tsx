import { Footer, LoginCretentials } from "@easy-messe/shared-ui";
import { LoginUsageEnum } from "@easyMesseLibs/types";
import { Box } from "@mui/material";

export default function LoginPage() {
    return (
        <Box sx={{
            height: '100svh',
            display: 'grid',
            gridTemplateRows: '1fr auto'
        }}>
            <LoginCretentials usage={LoginUsageEnum.ADMINISTRATOR} />
            <Footer />
        </Box>
    );
}

