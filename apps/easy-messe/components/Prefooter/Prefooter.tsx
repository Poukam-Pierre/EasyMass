import { theme } from "@easy-messe/libs/theme";
import { Box } from "@mui/material";
import Image from "next/image";

export default function Prefooter() {
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
        </Box>
    );
}
