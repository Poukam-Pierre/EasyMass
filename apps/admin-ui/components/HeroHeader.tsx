import { Box, Typography } from "@mui/material";
import Image from "next/image";

interface HeroHeaderProps {
    slogan: string;
    greeting: string;
    getActionMsg: string;
}
export default function HeroHeader({
    slogan,
    greeting,
    getActionMsg,
}: HeroHeaderProps) {
    return (

        <Box sx={{
            display: 'grid',
            justifyItems: 'center',
            rowGap: '8px'
        }}>
            <Box textAlign='center'>
                <Image
                    src='/assets/LogoEasyMass.png'
                    height={153}
                    width={350}
                    alt="Logo easy messe"
                />
                <Typography
                    variant='caption'
                    sx={{
                        lineHeight: '24px',
                        fontWeight: 'var(--semiBold)'
                    }}
                >
                    {slogan}
                </Typography>
            </Box>
            <Typography
                variant="h1"
                sx={{
                    fontSize: '36px',
                    lineHeight: '44px',
                    padding: 0,
                    textAlign: 'center'
                }}
            >
                {greeting}
            </Typography>
            <Typography
                variant='h5'
            >
                {getActionMsg}
            </Typography>
        </Box>

    )
}