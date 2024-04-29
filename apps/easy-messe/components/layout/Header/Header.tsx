import { Box, Button } from "@mui/material"
import Image from "next/image"
import LogoMass from '../../../assets/LogoEasyMass.png'
import { NavItem } from "./navitem"
import LanguageSwapper from "../LanguageSwapper"

export interface INavItem {
    item: string,
    route: string
}

export default function Header() {
    const navItems: INavItem[] = [
        { item: 'Accueil', route: '/' },
        { item: 'A propos', route: '#' }
    ]
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 90px'
        }}>
            <Box>
                <Image
                    src={LogoMass}
                    alt='logo easy mass'
                    style={{ width: '193px', height: '78px', cursor: 'pointer' }}
                />
            </Box>
            <Box sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                columnGap: 3
            }}>
                {navItems.map((navItem, index) => (
                    <NavItem navItem={navItem} key={index} />
                ))}
            </Box>
            <Box sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                columnGap: 1,
            }}>
                <LanguageSwapper />
                <Button
                    variant="contained"
                    color="primary"
                    disableElevation={false}>
                    Offir une messe
                </Button>
            </Box>
        </Box>
    )
}