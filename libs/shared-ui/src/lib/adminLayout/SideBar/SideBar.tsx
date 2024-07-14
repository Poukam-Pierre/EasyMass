import { Box, Divider } from "@mui/material";
import Image from "next/image";
import { ReactElement } from "react";
import NavBar from "./Navbar";
import Profile, { ProfileProps } from "./Profile";

export interface SideBarItem {
    label: string
    icon: ReactElement
    link: string
}

export interface SideBarSection {
    title: string
    sideBarItems: SideBarItem[]
}

interface SideBarProps {
    sideBarSection: SideBarSection[];
    profile: ProfileProps
}


export default function SideBar({
    sideBarSection,
    profile,
}: SideBarProps) {

    return (
        <Box sx={{
            width: '250px',
            padding: '8px',
            position: 'relative',
            backgroundColor: 'var(--background)',
            display: 'grid',
            gridTemplateRows: 'auto auto 1fr'
        }}>
            <Box sx={{
                display: 'grid',
                rowGap: 2.5
            }}>
                <Image
                    src='/assets/LogoEasyMass.png'
                    alt="Logo"
                    width={150}
                    height={65.57}
                />
                <Divider />
            </Box>

            {sideBarSection.map((sideBarNav, index) => (
                <NavBar
                    key={index}
                    sideBarNav={sideBarNav}
                />
            ))}
            <Profile profile={profile} />
        </Box>
    );
}
