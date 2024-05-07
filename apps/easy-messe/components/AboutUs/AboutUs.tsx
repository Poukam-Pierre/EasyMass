import { theme } from "@easy-messe/libs/theme";
import { Box, Button, Divider, Typography } from "@mui/material";
import { shortenNumber } from "@easy-messe/libs/utils"
import StatisticMass from "./statisticMass";
import { useIntl } from "react-intl";

export interface statisticMasses {
    label: string
    value: string
}
export default function AboutUs() {
    const { formatMessage } = useIntl()
    const statisticsMass: statisticMasses[] = [
        {
            label: 'masses',
            value: `+${shortenNumber(50)}`
        },
        {
            label: 'faithfull',
            value: `+${shortenNumber(30)}`
        },
        {
            label: 'parish',
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
                    }}>{formatMessage({ id: 'aboutUs' })}</Typography>
                <Typography variant="h3">{formatMessage({ id: 'subtitleAboutUs' })}</Typography>
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
                    <Typography>
                        {formatMessage({ id: 'aboutUsMessage' })}
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            width: 'fit-content',
                            height: 'fit-content'
                        }}
                    >{formatMessage({ id: 'getInTooch' })}</Button>
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
