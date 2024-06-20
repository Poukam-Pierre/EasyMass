import { Box, Divider, Grid, Paper, Typography } from "@mui/material";

export default function OfferMassCart() {
    const arrayStaticData: string[] = ['Paroisse', 'Date et heure', 'Réquerant', 'Ville']
    return (
        <Paper sx={{
            height: 'fit-content',
            padding: 1,
            display: 'grid',
            gridAutoFlow: 'column',
            bgcolor: 'var(--background)'
        }}>
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
                        Saint Paul Apôtre
                    </Typography>
                    <Typography
                        variant="body1"
                        color="var(--body)"
                        sx={{
                            padding: '2px 0 2px 0'
                        }}
                    >
                        26 Janvier 2024 - 08h30
                    </Typography>
                    <Typography
                        variant="body1"
                        color="var(--body)"
                        sx={{
                            padding: '2px 0 2px 0'
                        }}
                    >
                        Meulak Kouam
                    </Typography>
                    <Typography
                        variant="body1"
                        color="var(--body)"
                        sx={{
                            padding: '2px 0 2px 0'
                        }}
                    >
                        Bangangté
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
                        fontWeight: 'bold'
                    }}
                >
                    3300 frs</Typography>
            </Box>
        </Paper>
    );
}
