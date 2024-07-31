import { Footer, LoginCretentials } from "@easy-messe/shared-ui";
import { Box } from "@mui/material";

export function Index() {
    return (
        <Box sx={{
            height: '100svh',
            display: 'grid',
            gridTemplateRows: '1fr auto'
        }}>
            <LoginCretentials />
            <Footer />
        </Box>
    );
}

export default Index;
