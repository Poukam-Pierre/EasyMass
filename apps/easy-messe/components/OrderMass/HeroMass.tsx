import { Box, Typography } from "@mui/material";

export default function HeroMass() {
    return (
        <Box sx={{
            backgroundImage: `url('/heroMassImg.png')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            height: '350px',
            display: 'grid',
        }}>
            <Typography
                variant="h1"
                sx={{
                    fontSize: '56px',
                    lineHeight: '70px',
                    paragraphSpacing: '20px',
                    height: '209px',
                    width: '1087px',
                    color: '#121212',
                    alignSelf: 'center',
                    justifySelf: 'center',
                    textAlign: 'center',
                }}
            >
                Demander une messe , c est exprimer notre confiance à la puissance salvatrice du Christ...
            </Typography>
        </Box>
    );
}
