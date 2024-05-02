import { Box, Button, Typography } from "@mui/material";

export default function GetInvolved() {

    return (
        <Box sx={{
            display: 'grid',
            height: 'fit-content',
            width: '330px',
            rowGap: '20px'
        }}>
            <Typography sx={{
                fontSize: '24px',
                fontWeight: 600,
                lineHeight: '32px',
                letterSpacing: '-1.75%',
                color: '#333333'
            }}>Devenir associé</Typography>
            <Typography sx={{
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '28px',
                color: '#666666'

            }}>EasyMesse est la première platforme de demande de messes dans tout le térritoire Camerounais.
                Il a pour objectif de faciliter la vie aux fidèles et à l’Eglise dans leurs tâches. </Typography>
            <Box sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                columnGap: '10px'
            }}>
                <Button variant="contained" disableElevation>Offrir une messe</Button>
                <Button variant="outlined" disableElevation color="inherit">Nous contacter</Button>
            </Box>
        </Box>
    );
}
