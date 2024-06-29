import { formattedDateTime } from "@easy-messe/libs/utils";
import { Box, Divider, Grid, IconButton, Paper, Typography } from "@mui/material";
import { Dayjs } from "dayjs";
import { OfferMass } from "libs/theme/src/offerMasses/offerMass.interface";
import cancelIcon from '@iconify-icons/material-symbols/cancel'
import { Icon } from "@iconify/react";
import { useOfferMass } from "@easy-messe/libs/theme";
import { useIntl } from "react-intl";
interface OfferMassCartProps {
    massInfos: OfferMass[]
}

export default function OfferMassCart({ massInfos }: OfferMassCartProps): JSX.Element {
    const { massRequestDispatch } = useOfferMass()
    const { formatMessage, formatNumber } = useIntl()


    const arrayStaticData: string[] = ['city', 'parish', 'dateTime', 'applicant']

    const removeMass = (index: number) => {
        const massArray = massInfos;
        massArray.splice(index, 1);
        massRequestDispatch(massArray)
    }
    return (
        <Box sx={{
            display: 'grid',
            rowGap: 1.5,
            height: 'fit-content'
        }}>
            {massInfos.map(({
                massInfos: { city, dateTime, parish, price },
                faithInfos }, index) => (
                <Paper
                    key={index}
                    sx={{
                        height: 'fit-content',
                        padding: 1,
                        display: 'grid',
                        gridAutoFlow: { laptop: 'column', mobile: 'row' },
                        bgcolor: 'var(--background)',
                        position: 'relative',
                        rowGap: 1
                    }}
                >
                    <Grid
                        container
                        spacing={2}
                        direction="row"
                        sx={{
                            width: 'fit-content',
                        }}
                    >
                        <Grid item >
                            {arrayStaticData.map((element, index) => (
                                <Typography
                                    key={index}
                                    variant="h4"
                                    color="var(--body)"
                                    sx={{
                                        lineHeight: '28px',
                                        letterSpacing: 0,
                                        paddingBottom: 0,
                                    }}
                                >
                                    {formatMessage({ id: element })} :
                                </Typography>
                            ))}
                        </Grid>
                        <Grid item>
                            <Typography
                                variant="body1"
                                color="var(--body)"
                                sx={{
                                    padding: '2px 0 2px 0'
                                }}
                            >
                                {city}
                            </Typography>
                            <Typography
                                variant="body1"
                                color="var(--body)"
                                sx={{
                                    padding: '2px 0 2px 0'
                                }}
                            >
                                {parish}
                            </Typography>
                            <Typography
                                variant="body1"
                                color="var(--body)"
                                sx={{
                                    padding: '2px 0 2px 0'
                                }}
                            >
                                {formattedDateTime(dateTime as Dayjs)}
                            </Typography>
                            <Typography
                                variant="body1"
                                color="var(--body)"
                                sx={{
                                    padding: '2px 0 2px 0'
                                }}
                            >
                                {faithInfos ?
                                    faithInfos.name.split(' ')[0] : 'Anonymous'}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Divider
                        orientation="vertical"
                        sx={{
                            display: { laptop: 'block', mobile: 'none' },
                        }}
                    />
                    <Divider
                        orientation="horizontal"
                        sx={{
                            display: { laptop: 'none', mobile: 'block' },
                        }}
                    />
                    <Box sx={{
                        display: 'grid',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Typography
                            variant="body2"
                            textAlign="center"
                        >
                            {formatMessage({ id: 'amount' })}
                        </Typography>
                        <Typography
                            variant="caption"
                            textAlign="center"
                            sx={{
                                fontWeight: 'bold',
                                maxWidth: { laptop: '60px', mobile: 'auto' },
                            }}
                        >

                            {formatNumber(
                                price ? price : 0, {
                                style: 'currency',
                                currency: 'xaf'
                            })}
                        </Typography>
                    </Box>
                    <IconButton
                        disableFocusRipple
                        edge="end"
                        size="medium"
                        sx={{
                            position: 'absolute',
                            right: -7,
                            top: -15,
                        }}
                        onClick={() => removeMass(index)}
                    >
                        <Icon icon={cancelIcon} fontSize={32} />
                    </IconButton>
                </Paper>
            ))}
        </Box>
    );
}
