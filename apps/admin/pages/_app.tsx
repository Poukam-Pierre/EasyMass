import '@easy-messe/shared-ui';
import { EasyMassAdminLayout } from '@easy-messe/shared-ui';
import { AppProps } from 'next/app';


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

    return getLayout(
        <Component {...pageProps} />
    );
}

export default CustomApp;
