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
            height: '350px',
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
                }}
            >
                {formatMessage({ id: 'OrderMassHeroMsg' })}
            </Typography>
        </Box>
    );
}
