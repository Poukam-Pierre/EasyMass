import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { useIntl } from "react-intl";
interface partnerInfos {
    partnersImg: string,
    description: string
    width: number
    height: number
}

export default function Organisation() {
    const { formatMessage } = useIntl();
    const partnersInfos: partnerInfos[] = [
        {
            partnersImg: '/LogoPoukamTech.png',
            description: 'Logo partner Poukam Tech Sarl',
            height: 73.82,
            width: 150
        },
        {
            partnersImg: '/LogoOP.png',
            description: 'Logo partner OnlinePreps',
            height: 94.8,
            width: 108
        }
    ]
    return (
        <Box sx={{
            display: 'grid',
            justifyContent: 'center',
            height: 'fit-content',
            rowGap: { laptop: '50px', mobile: '20px' }
        }}>
            <Typography sx={{
                fontSize: '24px',
                fontWeight: 600,
                lineHeight: '32px',
                letterSpacing: '-1.75%',
                color: '#333333',
                textAlign: 'center'
            }}>{formatMessage({ id: 'partners' })}</Typography>
            <Box sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                columnGap: '10px',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {partnersInfos.map(({ partnersImg, description, height, width }, index) => (
                    <Box key={index} sx={{
                        width: '160px',
                        height: '147.6px',
                        border: '1.5px solid var(--error)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: ' center'
                    }}>
                        <Image
                            src={partnersImg}
                            alt={description}
                            width={width}
                            height={height}
                        />
                    </Box>
                )
                )}
            </Box>
        </Box>);
}
