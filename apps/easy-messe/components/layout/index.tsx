import { Box, Typography } from '@mui/material';
import Header from './Header/Header';
import Footer from './Footer/Footer';

export default function EasyMassLayout({ children }: { children: JSX.Element }) {
    /* TODO: this function will receive
      the header, footer and makeof it the layout,
      such that other components just load into it
    */
    return (
        <Box
            sx={{
                minHeight: '100svh',
                display: 'grid',
                gridTemplateRows: 'auto 1fr auto',
                rowGap: 1,
            }}
        >
            <Header />
            {children}
            <Footer />
        </Box>
    );
}
