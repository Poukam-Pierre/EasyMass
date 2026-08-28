import { theme } from "@easy-messe/libs/theme";
import { Box, Divider, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import HeroAbout from "../../components/About/HeroAbout";
import OurValues from "../../components/About/OurValues";
import Prefooter from "../../components/Prefooter/Prefooter";

export default function About() {
    const { formatMessage } = useIntl()

    return (
        <>
            <HeroAbout />
            <Box
                component='section'
                sx={{
                    padding: { laptop: '60px 90px', mobile: '40px 21px' },
                    display: 'grid',
                    justifyItems: 'center',
                    rowGap: '20px'
                }}
            >
                <Box sx={{ display: 'grid', justifyItems: 'center', rowGap: '10px' }}>
                    <Typography variant="h3" sx={{ color: theme.palette.primary.main }}>
                        {formatMessage({ id: 'aboutUs' })}
                    </Typography>
                    <Typography variant="h3">{formatMessage({ id: 'subtitleAboutUs' })}</Typography>
                    <Divider sx={{ width: '100px', border: '1px solid var(--goldChurch)' }} />
                </Box>
                <Typography sx={{
                    maxWidth: '820px',
                    textAlign: 'center',
                    color: theme.common.body,
                    lineHeight: '28px'
                }}>
                    {formatMessage({ id: 'aboutUsMessage' })}
                </Typography>
            </Box>
            <OurValues />
            <Prefooter />
        </>
    );
}
