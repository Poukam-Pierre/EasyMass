import { Footer, LoginCretentials } from '@easy-messe/shared-ui';
import { Box } from "@mui/material";
import { LoginUsageEnum } from "@easyMesseLibs/types"




export default function Login() {

    return (
        <Box sx={{
            height: '100svh',
            display: 'grid',
            gridTemplateRows: '1fr auto'
        }}>
            <LoginCretentials usage={LoginUsageEnum.PARISH} />
            <Footer />
        </Box>
    );
}

