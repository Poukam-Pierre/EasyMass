import { theme } from "@easy-messe/libs/theme";
import { Box, Button, Divider, Typography } from "@mui/material";
import { shortenNumber } from "@easy-messe/libs/utils"
import StatisticMass from "./statisticMass";

export interface statisticMasses {
    label: string
    value: string
}
export default function AboutUs() {
    const statisticsMass: statisticMasses[] = [
        {
            label: 'Messes',
            value: `+${shortenNumber(50)}`
        },
        {
            label: 'Fideles',
            value: `+${shortenNumber(30)}`
        },
        {
            label: 'Paroisses',
            value: `+${shortenNumber(60)}`
        }
    ]
    return (
        <Box
            component='section'
            sx={{
                padding: '20px 90px',
                display: 'grid',
                bgcolor: theme.common.background,
                rowGap: '20px'
            }}
        >
            <Box sx={{
                display: 'grid',
                justifyItems: 'center',
                rowGap: '10px'
            }}>
                <Typography
                    variant="h3"
                    sx={{
                        color: theme.palette.primary.main,
                    }}>A propos</Typography>
                <Typography variant="h3">Bienvenue sur le portail EasyMesse</Typography>
                <Divider sx={{
                    width: '100px',
                    border: '1px solid var(--goldChurch)',
                }} />
            </Box>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                columnGap: '70px'
            }}>
                <Box sx={{
                    display: 'grid',
                    rowGap: '20px',
                    paddingTop: '20px'
                }}>
                    <Typography>EasyMesse est un platforme de demande rapide
                        de messe sur tout l'étendu de térritoire national et international.
                        Connecter à presque toutes les paroisses sur le térritoire et ailleurs,
                        vous pouvez offrir une messe de votre choix selon vos intentions et
                        dans la paroisse de votre choix. Nous faire confiance c'est pouvoir
                        demander une messe de n'importe où jusqu'à 1h avant la messe et être sûr que votre demande sera exhaussé.
                    </Typography>
                    <Button variant="contained">Nous contacter</Button>
                </Box>
                <Box sx={{
                    width: '402px',
                    height: '269px',
                    bgcolor: theme.common.offWhite,
                    display: 'flex',
                    flexWrap: 'wrap',
                    padding: '10px 50px',
                    columnGap: '100px',
                    rowGap: '20px'
                }}>
                    {statisticsMass.map((statisticsMass, index) => (
                        <StatisticMass statisticElement={statisticsMass} key={index} />
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
