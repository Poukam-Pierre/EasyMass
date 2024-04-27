import { Box, Typography } from '@mui/material';

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
            <Typography>Layout Header</Typography>
            {children}
            <Typography>Layout Footer</Typography>
        </Box>
    );
}
