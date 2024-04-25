import { CssBaseline, ThemeProvider } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { Flip, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LanguageContextProvider, {
    useLanguage,
} from './contexts/language/languageContextProvider';
import { LanguageType } from './contexts/language/language.interface';
import AppThemeContextProvider, {
    useDispatchTheme,
} from './contexts/themeContext/AppThemeContextProvider';
import enMessages from './languages/en-us';
import frMessages from './languages/fr';
import { theme } from './theme';

const App = ({
    children,
    newTheme,
}: {
    children: React.ReactNode;
    newTheme?: Theme;
}) => {
    const { activeLanguage } = useLanguage();
    const activeMessages = activeLanguage === 'fr' ? frMessages : enMessages;
    const themeDispatch = useDispatchTheme();

    useEffect(() => {
        themeDispatch({ payload: newTheme ?? theme });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <IntlProvider
            messages={activeMessages}
            locale={activeLanguage}
            defaultLocale="fr"
        >
            <ThemeProvider theme={newTheme ?? theme}>
                <ToastContainer
                    position="top-right"
                    autoClose={1000}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    transition={Flip}
                />
                <CssBaseline />
                {children}
            </ThemeProvider>
        </IntlProvider>
    );
};

/**
 *
 * @param {Theme} theme - the new theme to overright the base GLOM theme
 * @param {React.ReactNode} children - children that'll consume the provided theme
 * @returns {JSX.Element}
 */
export function LHALabsThemeProvider({
    children,
    theme,
    defaultLang,
}: {
    children: React.ReactNode;
    theme?: Theme;
    defaultLang?: LanguageType;
}) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: process.env['NODE_ENV'] === 'development',
            },
        },
    });
    return (
        <LanguageContextProvider defaultLang={defaultLang}>
            <QueryClientProvider client={queryClient}>
                <AppThemeContextProvider>
                    <App newTheme={theme}>{children}</App>
                </AppThemeContextProvider>
            </QueryClientProvider>
        </LanguageContextProvider>
    );
}

export default LHALabsThemeProvider;
