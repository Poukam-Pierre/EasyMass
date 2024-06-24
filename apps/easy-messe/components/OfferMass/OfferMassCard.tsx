import { formattedDateTime } from "@easy-messe/libs/utils";
import { Box, Divider, Grid, IconButton, Paper, Typography } from "@mui/material";
import { Dayjs } from "dayjs";
import { OfferMass } from "libs/theme/src/offerMasses/offerMass.interface";
import cancelIcon from '@iconify-icons/material-symbols/cancel'
import { Icon } from "@iconify/react";
interface OfferMassCartProps {
    massInfos: OfferMass[]
}

export default function OfferMassCart({ massInfos }: OfferMassCartProps): JSX.Element {

    const arrayStaticData: string[] = ['Ville', 'Paroisse', 'Date et heure', 'Réquerant']
    return (
        <Box sx={{
            display: 'grid',
            rowGap: 1.5,
            height: 'fit-content'
        }}>
            {massInfos.map((mass, index) => (
                <Paper
                    key={index}
                    sx={{
                        height: 'fit-content',
                        padding: 1,
                        display: 'grid',
                        gridAutoFlow: 'column',
                        bgcolor: 'var(--background)',
                        position: 'relative'
                    }}
                >
                    <Grid
                        container
                        spacing={2}
                        direction="row"
                        sx={{
                            width: 'fit-content'
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
                                    {element} :
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
                                {mass.massInfos.city}
                            </Typography>
                            <Typography
                                variant="body1"
                                color="var(--body)"
                                sx={{
                                    padding: '2px 0 2px 0'
                                }}
                            >
                                {mass.massInfos.parish}
                            </Typography>
                            <Typography
                                variant="body1"
                                color="var(--body)"
                                sx={{
                                    padding: '2px 0 2px 0'
                                }}
                            >
                                {formattedDateTime(mass.massInfos.dateTime as Dayjs)}
                            </Typography>
                            <Typography
                                variant="body1"
                                color="var(--body)"
                                sx={{
                                    padding: '2px 0 2px 0'
                                }}
                            >
                                {mass.faithInfos.name === null ?
                                    'Anonymous' : mass.faithInfos.name.split(' ')[0]}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Divider orientation="vertical" />
                    <Box sx={{
                        display: 'grid',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Typography
                            variant="body2"
                            textAlign="center"
                        >Prix</Typography>
                        <Typography
                            variant="caption"
                            textAlign="center"
                            sx={{
                                fontWeight: 'bold',
                            }}
                        >
                            {mass.massInfos.price !== null && `${mass.massInfos.price} frc`}
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
                    >
                        <Icon icon={cancelIcon} fontSize={32} />
                    </IconButton>
                </Paper>
            ))}
        </Box>
    );
}
