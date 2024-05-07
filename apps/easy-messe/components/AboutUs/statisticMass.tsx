import { theme } from "@easy-messe/libs/theme";
import { Box, Typography } from "@mui/material";
import { statisticMasses } from "./AboutUs";

interface statisticProps {
    statisticElement: statisticMasses
}

export default function StatisticMass({ statisticElement: { label, value } }: statisticProps) {
    return (
        <Box>
            <Typography
                variant='h1'
                sx={{
                    fontSize: '56px',
                    fontWeight: 'bold',
                    lineHeight: '70.5px',
                    letterSpacing: '-0.02em',
                    padding: 0
                }}>{value}</Typography>
            <Typography
                variant="h5"
                sx={{
                    lineHeight: '28px',
                    color: 'var(--titleActive)',
                    bgcolor: theme.palette.secondary.main,
                    padding: '2px 5px',
                    borderRadius: '5px',
                    fontWeight: '600',
                    width: 'fit-content'
                }}
            >{label}</Typography>

        </Box>
    );
}
