import { theme } from "@easy-messe/libs/theme";
import { Box, Typography } from "@mui/material";
import { useIntl } from "react-intl";

export default function HeroMass() {
    const { formatMessage } = useIntl()
    return (
        <Box sx={{
            backgroundImage: `url('/heroMassImg.png')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            height: { laptop: '350px', mobile: '219px' },
            display: 'grid',
        }}>
            <Typography
                variant="h1"
                sx={{
                    fontSize: '56px',
                    lineHeight: '70px',
                    paragraphSpacing: '20px',
                    height: '209px',
                    width: '1087px',
                    color: '#121212',
                    alignSelf: 'center',
                    justifySelf: 'center',
                    textAlign: 'center',
                    display: { laptop: 'inherit', mobile: 'none' }
                }}
            >
                {formatMessage({ id: 'OrderMassHeroMsg' })}
            </Typography>
            <Typography
                variant="h3"
                sx={{
                    fontSize: '32px',
                    lineHeight: '36px',
                    paragraphSpacing: '20px',
                    height: '180px',
                    color: theme.common.background,
                    alignSelf: 'center',
                    justifySelf: 'center',
                    textAlign: 'center',
                    display: { laptop: 'none', mobile: 'inherit' }
                }}
            >
                {formatMessage({ id: 'OrderMassHeroMsg' })}
            </Typography>
        </Box>
    );
}
