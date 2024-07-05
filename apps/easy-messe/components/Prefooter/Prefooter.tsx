import { theme } from "@easy-messe/libs/theme";
import { Box, Button } from "@mui/material";
import { useIntl } from "react-intl";
import QuoteMasses from "./QuoteMasses";
import { useRouter } from "next/router";

export default function Prefooter() {
    const { formatMessage } = useIntl()
    const { push } = useRouter()

    return (
        <Box sx={{
            backgroundImage: `url('/actionAreaBeforeFooterImg.jpg')`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            height: '640px',
            position: 'relative',
            display: 'grid'
        }}
            component='section'

        >
            <Box sx={{
                width: '100%',
                height: '100%',
                backgroundColor: theme.palette.primary.main,
                opacity: 0.5,
                position: 'absolute',
            }}>
            </Box>
            <Box sx={{
                display: 'grid',
                rowGap: 5,
                padding: { laptop: '0 90px', mobile: '0 15px', tablet: 0 },
                zIndex: 0,
                width: 'fit-content',
                height: 'fit-content',
                alignSelf: 'center',
            }}>
                <QuoteMasses />
                <Button
                    variant="contained"
                    disableElevation={true}
                    sx={{
                        bgcolor: theme.palette.primary.contrastText,
                        color: theme.palette.secondary.contrastText,
                        width: 'fit-content',
                        justifySelf: { laptop: 'inherit', mobile: 'center' }
                    }}
                    onClick={() => push('/offer-mass')}
                >
                    {formatMessage({ id: 'offerMass' })}
                </Button>

            </Box>
        </Box>
    );
}
