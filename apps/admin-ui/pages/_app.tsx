import '@easy-messe/shared-ui';
import { EasyMassAdminLayout } from '@easy-messe/shared-ui';
import { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
// Next.js only allows global CSS imports from the custom App component,
// so this can't live in the shared EasyMassThemeProvider that renders ToastContainer.
import 'react-toastify/dist/ReactToastify.css';

type NextPageWithoutLayout = AppProps & {
    Component: AppProps['Component'] & {
        getLayout?: (page: React.ReactNode) => React.ReactNode;
    };
};

function CustomApp({ Component, pageProps }: NextPageWithoutLayout) {
    const getLayout = Component.getLayout ??
        ((page) =>
            <EasyMassAdminLayout>
                {page}
            </EasyMassAdminLayout>
        );

    return (
        <AuthProvider>
            {getLayout(<Component {...pageProps} />)}
        </AuthProvider>
    );
}

export default CustomApp;
