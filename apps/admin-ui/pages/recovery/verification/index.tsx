import { Box, Button, TextField, Typography } from "@mui/material";
import HeroHeader from '../../../components/HeroHeader';

export default function MailVerification() {
    return (
        <Box sx={{
            height: '100svh',
            display: 'grid',
            gridTemplateRows: '1fr auto'
        }}>
            <Box sx={{
                width: 464,
                display: 'grid',
                height: 'fit-content',
                marginTop: '70px',
                justifySelf: 'center',
                rowGap: 3
            }}>
                <HeroHeader
                    slogan='La messe, la plus grande des prières'
                    greeting='Récupération du mot de passe!'
                    getActionMsg='Entrez votre adresse mail'
                />
                <Box
                    sx={{
                        display: 'grid',
                        rowGap: 2
                    }}
                    component='form'
                >
                    <TextField
                        size="small"
                        placeholder="Email"
                        type="email"
                    />
                    <Button variant="contained">Send</Button>
                </Box>
            </Box>
            <Typography>Footer</Typography>
        </Box>

    );
}
