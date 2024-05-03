import { Box, Button, Typography } from "@mui/material";
import HeroImage from "./HeroImage";
import { theme } from "@easy-messe/libs/theme";

export default function HeroSection() {
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            padding: '0px 90px'

        }}>
            <Box sx={{
                display: 'grid',
                alignItems: 'end',
                paddingTop: '130px',
                rowGap: '35px'
            }}>
                <Typography sx={{
                    fontSize: '56px',
                    lineHeight: '60px',
                    paragraphSpacing: '20px',
                    fontWeight: 700,
                    color: theme.common.titleActive,
                    width: '900px'
                }}>
                    Croire au saint sacrifice,
                    Rendre grâce au Seigneur,
                    Aimer nos proches disparus.
                </Typography>
                <Typography variant="h4" sx={{
                    lineHeight: '28px',
                    letterSpacing: 0,
                    paddingBottom: 0,
                    fontWeight: 700,
                    width: '750px'
                }}>
                    Demander qu&apos;une messe soit célébrée à une intension
                    est un acte de fois en la puissance du sacrifice du christ.
                    C&apos;est remettre entre les mains de Jesus les personnes vivantes et
                    défunts que nous aimons ainsi que toutes nos intensions.
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        width: 'fit-content',
                        height: 'fit-content'
                    }}
                >Offrir une messe</Button>
            </Box>
            <HeroImage />
        </Box>
    );
}
