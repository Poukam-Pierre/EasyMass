import { EasyMassThemeProvider } from '@easy-messe/libs/theme';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AppProps } from 'next/app';
import Head from 'next/head';
import '../public/styles/global.scss';
import '../public/styles/notifGlobalStyles.css';
import '../public/styles/reset.css';
import '../public/styles/root.scss';
import EasyMassLayout from '../components/layout';

function CustomApp({ Component, pageProps }: AppProps) {
    return (
        <EasyMassThemeProvider defaultLang="en">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Head>
                    <title>{"Let's Order a mass remotly - EasyMesse"}</title>
                </Head>
                <Box component="main" className="app">
                    <EasyMassLayout>
                        <Component {...pageProps} />
                    </EasyMassLayout>
                </Box>
            </LocalizationProvider>
        </EasyMassThemeProvider>
    );
}

export default CustomApp;
