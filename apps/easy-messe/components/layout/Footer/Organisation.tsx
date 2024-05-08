import { Box, Typography } from "@mui/material";
import LogoPoukamTech from '../../../assets/LogoPoukamTech.png'
import LogoOP from '../../../assets/LogoOP.png'
import Image, { StaticImageData } from "next/image";
import { useIntl } from "react-intl";
interface partnerInfos {
    partnersImg: StaticImageData,
    description: string
    width: string
    height: string
}

export default function Organisation() {
    const { formatMessage } = useIntl();
    const partnersInfos: partnerInfos[] = [
        {
            partnersImg: LogoPoukamTech,
            description: 'Logo partner Poukam Tech Sarl',
            height: '73.82px',
            width: '150px'
        },
        {
            partnersImg: LogoOP,
            description: 'Logo partner OnlinePreps',
            height: '94.8px',
            width: '108px'
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
                        <Image src={partnersImg} alt={description} style={{ width: width, height: height }} />
                    </Box>
                )
                )}
            </Box>
        </Box>);
}
