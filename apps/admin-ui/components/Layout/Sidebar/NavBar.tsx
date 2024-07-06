import { Box, Typography } from "@mui/material";
import NavBarItem from "./NavBarItem";
import { sideBarSection } from "./SideBar";

interface navBarProps {
    sideBarNav: sideBarSection
}

export default function NavBar({
    sideBarNav: {
        title,
        sideBarItems
    },
}:
    navBarProps) {
    return (
        <Box sx={{
            display: 'grid',
            rowGap: '10px',
            padding: '10px 8px 0'
        }}>
            <Typography
                sx={{
                    color: "#AFB0B0",
                    fontWeight: '400',
                    textWrap: 'nowrap',
                    whiteSpace: 'nowrap',
                    fontSize: '15px'
                }}>
                {title}
            </Typography>
            {sideBarItems.map((navEl, index) => (
                <NavBarItem navEl={navEl} key={index} />
            ))}
        </Box>
    )
}
