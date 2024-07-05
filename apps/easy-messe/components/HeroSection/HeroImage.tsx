import { Box, Color, SxProps } from "@mui/material";
import Image from "next/image";
import { theme } from "@easy-messe/libs/theme";

interface shapeImage {
    position: string,
    width: string,
    height: string,
    bottom?: string,
    top?: string,
    left?: string,
    right?: string,
    bgcolor: Color | string | undefined,
    borderRadius: string
}
export default function HeroImage() {
    const shapeImageStyle: shapeImage[] = [
        {
            width: '61.13px',
            height: '60px',
            borderRadius: '50%',
            bgcolor: theme.common.goldChurch,
            position: 'absolute',
            bottom: '100px',
            left: '20px'
        },
        {
            width: '36.68px',
            height: '36px',
            borderRadius: '50%',
            bgcolor: theme.palette.error.main,
            position: 'absolute',
            bottom: '250px',
            left: '-10px'
        },
        {
            width: '24.45px',
            height: '24px',
            borderRadius: '50%',
            bgcolor: theme.palette.error.main,
            position: 'absolute',
            bottom: '50px',
            left: '60px'
        },
        {
            width: '30.57px',
            height: '30px',
            borderRadius: '50%',
            bgcolor: theme.common.goldChurch,
            position: 'absolute',
            bottom: '0px',
            left: '100px'
        },
        {
            width: '36.68px',
            height: '36px',
            borderRadius: '50%',
            bgcolor: theme.common.goldChurch,
            position: 'absolute',
            bottom: '70px',
            right: '50px'
        },
        {
            width: '61.13px',
            height: '60px',
            borderRadius: '50%',
            bgcolor: theme.palette.error.main,
            position: 'absolute',
            top: '0px',
            right: '0px'
        },
        {
            width: '42.79px',
            height: '42px',
            borderRadius: '50%',
            bgcolor: theme.common.goldChurch,
            position: 'absolute',
            top: '-10px',
            right: '70px'
        },
        {
            width: '36.68px',
            height: '36px',
            borderRadius: '50%',
            bgcolor: theme.common.goldChurch,
            position: 'absolute',
            top: '90px',
            right: '5px'
        }
    ]
    return (
        <Box sx={{
            position: 'relative',
            width: '420px',
            display: 'grid',
            height: '440.8px',
            justifySelf: 'center'
        }}>
            <Box sx={{
                bgcolor: theme.common.goldChurch,
                borderRadius: '50%',
                width: '330px',
                height: '330px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                justifySelf: 'center',
                alignSelf: 'center',
            }}>
                <Image
                    src='/heroImage.png'
                    alt="hero image"
                    width={250}
                    height={225}
                />
            </Box>
            {shapeImageStyle.map((style, index) => (
                <Box key={index} sx={{ ...style as SxProps }}></Box>
            ))}
        </Box>
    );
}
