import { Box, Divider, Typography } from "@mui/material";
import LanguageSwapper from "./LanguageSwapper";

export default function Footer() {
    return (
        <>
            <Divider />
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 140px'
            }}>
                <Typography
                    variant='h5'
                    sx={{
                        padding: 0
                    }}

                >@EasyMass</Typography>
                <LanguageSwapper />
            </Box>
        </>
    )
}