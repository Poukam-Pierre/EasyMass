import { Box } from "@mui/material";
import { PropsWithChildren } from "react";
import Header from "./Header/Header";

export default function AppLayout({ children }: PropsWithChildren) {
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            height: '100svh'
        }}>
            <Box>Side Bar</Box>
            <Box sx={{
                display: 'grid',
                gridTemplateRows: 'auto 1fr'
            }}>
                <Header />
                <Box>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
