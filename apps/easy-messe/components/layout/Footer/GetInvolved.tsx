import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useIntl } from "react-intl";

export default function GetInvolved() {
    const { formatMessage } = useIntl()
    const { push, asPath } = useRouter()
    const isActive = asPath.startsWith('/offer-mass')

    return (
        <Box sx={{
            display: 'grid',
            height: 'fit-content',
            width: '330px',
            rowGap: '20px',
            justifySelf: 'center'
        }}>
            <Typography sx={{
                fontSize: '24px',
                fontWeight: 600,
                lineHeight: '32px',
                letterSpacing: '-1.75%',
                color: '#333333',
                textAlign: { laptop: 'left', mobile: 'center' }
            }}>{formatMessage({ id: 'getInvolved' })}</Typography>
            <Typography sx={{
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '28px',
                color: '#666666',
                textAlign: { laptop: 'inherit', mobile: 'center' }

            }}>{formatMessage({ id: 'footerMessage' })}</Typography>
            <Box sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                columnGap: '10px'
            }}>
                <Button
                    variant="contained"
                    disableElevation
                    onClick={() => push('/offer-mass')}
                    disabled={isActive}
                >{formatMessage({ id: 'offerMass' })}
                </Button>
                <Button
                    variant="outlined"
                    disableElevation
                    color="inherit"
                    href="https://telegram.me/POUKAMTECH"
                    target="_blank"
                >
                    {formatMessage({ id: 'getInTooch' })}
                </Button>
            </Box>
        </Box>
    );
}
