import { Box, Button, Typography } from "@mui/material";
import HeroImage from "./HeroImage";
import { theme } from "@easy-messe/libs/theme";
import { useIntl } from "react-intl";

export default function HeroSection() {
    const { formatMessage } = useIntl()
    return (
        <Box
            component='section'
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    laptop: '1fr 1.4fr',
                    tablet: '1fr 1.2fr',
                    mobile: 'none'
                },
                padding: { laptop: '0px 90px', mobile: '0px 21px' },
                position: 'relative',
                rowGap: '5px'
            }}
        >
            <Box
                sx={{
                    display: 'grid',
                    alignItems: 'end',
                    paddingTop: { laptop: '130px', mobile: '30px' },
                    rowGap: '35px'
                }}
            >
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: { laptop: '56px', tablet: '42px', mobile: '30px' },
                        lineHeight: { laptop: '60px', tablet: '54px', mobile: '36px' },
                        fontWeight: { laptop: 800, mobile: 700 },
                        color: theme.common.titleActive,
                        width: { laptop: '900px', tablet: 'auto', },
                        padding: { laptop: 'initial', mobile: 0 },
                        letterSpacing: '-0.0em'
                    }}>
                    {formatMessage({ id: 'heroMessage' })}
                </Typography>
                <Typography
                    variant="h4"
                    sx={{
                        lineHeight: '28px',
                        letterSpacing: { laptop: 0, mobile: '-0.02em' },
                        paddingBottom: 0,
                        fontWeight: 700,
                        width: { laptop: '750px', tablet: 'auto' },
                    }}>
                    {formatMessage({ id: 'subtitleHeroMessage' })}
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        width: 'fit-content',
                        height: 'fit-content'
                    }}
                >
                    {formatMessage({ id: 'orderMass' })}
                </Button>
            </Box>
            <HeroImage />
        </Box>
    );
}
