import { Box, Divider } from '@mui/material'
import Image from 'next/image'
import imgFooter from '../../../assets/imgFooter.png'
import GetInvolved from './GetInvolved'
import Organisation from './Organisation'

export default function Footer() {

    return (
        <Box sx={{
            p: '13px 30px',
            display: 'grid',
            rowGap: '50px'
        }}>
            <Divider sx={{
                width: '90%',
                justifySelf: 'center'
            }}>
                <Image src={imgFooter} alt='imgFooter' style={{ width: '100px', height: 'auto' }} />
            </Divider>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0 30px'
            }}>
                <GetInvolved />
                <Organisation />
            </Box>
        </Box>
    )
}