import { Box } from "@mui/material";
import { PropsWithChildren } from "react";
import Header from "./Header/Header";
import SideBar from "./Sidebar/SideBar";

export default function AppLayout({ children }: PropsWithChildren) {
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            height: '100svh'
        }}>
            <SideBar />
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
