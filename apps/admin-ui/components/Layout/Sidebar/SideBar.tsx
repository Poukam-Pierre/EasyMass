import financeIcon from '@iconify-icons/material-symbols/attach-money';
import libraryIcon from '@iconify-icons/material-symbols/local-library-outline-rounded';
import taskIcon from '@iconify-icons/material-symbols/task-outline';
import { Icon } from "@iconify/react";
import { Box, Divider } from "@mui/material";
import Image from "next/image";
import { ReactElement } from "react";
import { useIntl } from "react-intl";
import NavBar from "./NavBar";
import Profile from "./Profile";

export interface sideBarItem {
    label: string
    icon: ReactElement
    link: string
}

export interface sideBarSection {
    title: string
    sideBarItems: sideBarItem[]
}

export default function SideBar() {
    const { formatMessage } = useIntl()
    const sideBarSectionParish: sideBarSection[] = [
        {
            title: 'Management',
            sideBarItems: [
                {
                    label: formatMessage({ id: 'massOffer' }),
                    icon: <Icon icon={taskIcon} fontSize={24} />,
                    link: '/massOffer'
                },
                {
                    label: formatMessage({ id: 'masses' }),
                    icon: <Icon icon={libraryIcon} fontSize={24} />,
                    link: '/masses'
                },
                {
                    label: formatMessage({ id: 'finances' }),
                    icon: <Icon icon={financeIcon} fontSize={24} />,
                    link: '/finances'
                },
            ]
        },

    ]
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

            {sideBarSectionParish.map((sideBarNav, index) => (
                <NavBar
                    key={index}
                    sideBarNav={sideBarNav}
                />
            ))}
            <Profile />
        </Box>
    );
}
