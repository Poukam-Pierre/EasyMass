import { theme } from "@easy-messe/libs/theme";
import { Box, Typography } from "@mui/material";
import { statisticMasses } from "./AboutUs";
import { useIntl } from "react-intl";
import { shortenNumber } from "@easy-messe/libs/utils"

interface statisticProps {
    statisticElement: statisticMasses
}

export default function StatisticMass({ statisticElement: { label, value } }: statisticProps) {
    const { formatMessage } = useIntl()
    return (
        <Box>
            <Typography
                variant='h1'
                sx={{
                    fontSize: { laptop: '56px', mobile: '50px' },
                    fontWeight: 'bold',
                    lineHeight: '70.5px',
                    letterSpacing: '-0.02em',
                    padding: 0
                }}>{`+${shortenNumber(value)}`}</Typography>
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
            >{formatMessage({ id: label })}</Typography>

        </Box>
    );
}
