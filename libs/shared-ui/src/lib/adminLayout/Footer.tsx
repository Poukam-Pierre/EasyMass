import { Box, Divider, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import ExternalLink from '@iconify-icons/fluent/open-20-regular'
import LanguageSwapper from "./LanguageSwapper";


export function Footer() {
    return (
        <>
            <Divider />
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 140px'
            }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        alignItems: 'center',
                        columnGap: 0.5,
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            padding: 0
                        }}
                    >Powered by : </Typography>
                    <Box
                        component="a"
                        href="#"
                        target="_blank"
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr',
                            columnGap: 0.5,
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="body2">Poukam Tech</Typography>
                        <Icon icon={ExternalLink} />
                    </Box>
                </Box>
                <LanguageSwapper />
            </Box>
        </>
    )
}