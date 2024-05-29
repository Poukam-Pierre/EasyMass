import { Box, Divider } from '@mui/material'
import Image from 'next/image'
import imgFooter from '../../../assets/imgFooter.png'
import GetInvolved from './GetInvolved'
import Organisation from './Organisation'

export default function Footer() {

    return (
        <Box sx={{
            p: { laptop: '13px 90px', mobile: '13px 21px' },
            display: 'grid',
            rowGap: '50px',
            height: 'fit-content'
        }}>
            <Divider sx={{
                width: '90%',
                justifySelf: 'center'
            }}>
                <Image src={imgFooter} alt='imgFooter' style={{ width: '100px', height: 'auto' }} />
            </Divider>
            <Box sx={{
                display: { laptop: 'flex', mobile: 'grid' },
                justifyContent: { laptop: 'space-between', mobile: 'inherit' },
                rowGap: '35px'
            }}>
                <GetInvolved />
                <Organisation />
            </Box>
        </Box>
    )
}