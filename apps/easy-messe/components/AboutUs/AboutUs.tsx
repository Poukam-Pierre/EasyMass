import { theme } from "@easy-messe/libs/theme";
import { Box, Button, Divider, Typography } from "@mui/material";
import StatisticMass from "./statisticMass";
import { useIntl } from "react-intl";

export interface statisticMasses {
    label: string
    value: number
}
export default function AboutUs() {
    const { formatMessage } = useIntl()
    const statisticsMass: statisticMasses[] = [
        {
            label: 'masses',
            value: 50
        },
        {
            label: 'faithfull',
            value: 30
        },
        {
            label: 'parish',
            value: 60
        }
    ]
    return (
        <Box
            component='section'
            sx={{
                padding: {
                    laptop: '20px 90px',
                    tablet: '20px 21px',
                    mobile: '20px 21px'
                },
                display: 'grid',
                bgcolor: theme.common.background,
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
                gridTemplateColumns: {
                    laptop: '1.4fr 1fr',
                    tablet: '1fr 1.2fr',
                    mobile: 'none'
                },
                columnGap: { laptop: '70px', tablet: '30px', mobile: 0 },
                rowGap: { laptop: 0, mobile: '30px' }
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
                    >{formatMessage({ id: 'getMore' })}</Button>
                </Box>
                <Box sx={{
                    width: { laptop: '402px', mobile: '100%' },
                    height: { laptop: '269px', mobile: '150px' },
                    bgcolor: theme.common.offWhite,
                    display: 'flex',
                    flexWrap: 'wrap',
                    padding: { laptop: '10px 50px', mobile: '10px 40px' },
                    columnGap: { laptop: '100px', mobile: '24px' },
                    rowGap: { laptop: '20px', mobile: 0 },
                    justifySelf: 'center'
                }}>
                    {statisticsMass.map((statisticsMass, index) => (
                        <StatisticMass statisticElement={statisticsMass} key={index} />
                    ))}
                </Box>
            </Box>
        </Box>
    );
}