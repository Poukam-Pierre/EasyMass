import { EasyMassThemeProvider, useLanguage } from '@easy-messe/libs/theme';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AppProps } from 'next/app';
import Head from 'next/head';
import '@easy-messe/shared-ui'

function CustomApp({ Component, pageProps }: AppProps) {
    const { activeLanguage } = useLanguage()

    return (
        <EasyMassThemeProvider defaultLang="fr">
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={activeLanguage}>
                <Head>
                    <title>{"Order masses remotely - EasyMesse"}</title>
                </Head>
                <Box component="main" className="app">
                    <Component {...pageProps} />
                </Box>
            </LocalizationProvider>
        </EasyMassThemeProvider>
    );
}

export default CustomApp;
