import { theme } from "@easy-messe/libs/theme";
import { Box, Button } from "@mui/material";
import Image from "next/image";
import QuoteMasses from "./QuoteMasses";
import { useIntl } from "react-intl";

export default function Prefooter() {
    const { formatMessage } = useIntl()

    return (
        <Box sx={{
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            height: '640px',
            position: 'relative',
        }}
            component='section'

        >
            <Image
                src='/actionAreaBeforeFooterImg.jpg'
                layout="fill"
                objectFit="cover"
                alt="action image"
            />
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
                position: 'absolute',
                top: '190px',
                left: '90px'
            }}>
                <QuoteMasses />
                <Button
                    variant="contained"
                    disableElevation={true}
                    sx={{
                        bgcolor: theme.palette.primary.contrastText,
                        color: theme.palette.secondary.contrastText,
                        width: 'fit-content'
                    }}
                >
                    {formatMessage({ id: 'offerMass' })}
                </Button>

            </Box>
        </Box>
    );
}
