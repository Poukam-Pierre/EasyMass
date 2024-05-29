import { Box, Divider } from '@mui/material'
import Image from 'next/image'
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
                <Image
                    src='/imgFooter.png'
                    alt='imgFooter'
                    width={100}
                    height={45}
                />
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