import { EasyMassThemeProvider, useLanguage } from '@easy-messe/libs/theme';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Head from 'next/head';
import { PropsWithChildren } from 'react';

export function EasyMassAdminLayout({
  children,
  defaultLang = 'fr',
}: PropsWithChildren<{ defaultLang?: 'en' | 'fr' }>) {
  const { activeLanguage } = useLanguage();
  return (
    <EasyMassThemeProvider defaultLang={defaultLang}>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale={activeLanguage}
      >
        <Head>
          <title>{'EasyMesse'}</title>
        </Head>
        <Box component="main" className="app">
          {children}
        </Box>
      </LocalizationProvider>
    </EasyMassThemeProvider>
  );
}
