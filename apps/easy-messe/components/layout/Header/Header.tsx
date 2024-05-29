import { Box, Button, IconButton, Toolbar } from "@mui/material";
import Image from "next/image";
import { NavItem } from "./navitem";
import LanguageSwapper from "../LanguageSwapper";
import { Icon } from '@iconify/react';
import MenuIcon from '@iconify-icons/fluent/line-horizontal-3-20-regular';
import SideBar from "./SideBar/SideBar";
import { useState } from "react";
import { useIntl } from "react-intl";



export interface INavItem {
    item: string,
    route: string
}

export default function Header() {
    const [open, setOpen] = useState<boolean>(false)
    const { formatMessage } = useIntl()

    const navItems: INavItem[] = [
        { item: 'home', route: '/' },
        { item: 'aboutUs', route: '#' }
    ]
    return (
        <>

            <SideBar open={open} toggleDrawer={setOpen} navItems={navItems} />
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F5F5F5',
                padding: { laptop: '16px 90px', mobile: '13px 21px' }
            }}>
                <Toolbar sx={{
                    width: '100%',
                    justifyContent: 'space-between',
                    padding: 0
                }}>
                    <Box sx={{ display: { laptop: 'block', mobile: 'none' } }}>
                        <Image
                            src='/LogoEasyMass.png'
                            alt='logo easy mass'
                            width={193}
                            height={78}
                            style={{ cursor: 'pointer' }}
                        />
                    </Box>
                    <Box sx={{ display: { laptop: 'none', mobile: 'block' } }}>
                        <Image
                            src='/LogoEasyMass.png'
                            alt='logo easy mass'
                            width={110}
                            height={44}
                            style={{ cursor: 'pointer' }}
                        />
                    </Box>
                    <Box sx={{
                        display: { laptop: 'grid', mobile: 'none' },
                        gridAutoFlow: 'column',
                        columnGap: 3
                    }}>
                        {navItems.map((navItem, index) => (
                            <NavItem navItem={navItem} key={index} />
                        ))}
                    </Box>
                    <IconButton sx={{
                        display: { laptop: 'none', mobile: 'block' }
                    }}
                        onClick={() => setOpen(true)}
                    >
                        <Icon icon={MenuIcon} color="#2F3A45" />
                    </IconButton>
                    <Box sx={{
                        display: { laptop: 'grid', mobile: 'none' },
                        gridAutoFlow: 'column',
                        columnGap: 1,
                    }}>
                        <LanguageSwapper />
                        <Button
                            variant="contained"
                            color="primary"
                            disableElevation={false}>
                            {formatMessage({ id: 'orderMass' })}
                        </Button>
                    </Box>

                </Toolbar>
            </Box>
        </>
    )
}