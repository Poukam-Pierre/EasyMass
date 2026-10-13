import { EasyMassThemeProvider, useLanguage } from '@easy-messe/libs/theme';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AppProps } from 'next/app';
import Head from 'next/head';
import EasyMassLayout from '../components/layout';
import '@easy-messe/shared-ui';
import 'dayjs/locale/fr';
// Next.js only allows global CSS imports from the custom App component,
// so this can't live in the shared EasyMassThemeProvider that renders ToastContainer.
import 'react-toastify/dist/ReactToastify.css';


function CustomApp({ Component, pageProps }: AppProps) {
    const { activeLanguage } = useLanguage()

    return (
        <EasyMassThemeProvider defaultLang="en">
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={activeLanguage}>
                <Head>
                    <title>{"Order masses remotely - EasyMesse"}</title>
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
