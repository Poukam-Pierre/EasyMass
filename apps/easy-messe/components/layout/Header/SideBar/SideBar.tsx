import { Box, Button, Drawer } from "@mui/material";
import { INavItem } from "../Header";
import { NavItem } from "../navitem";
import LanguageSwapper from "../../LanguageSwapper";
import Image from "next/image";
import LogoEasy from '../../../../assets/LogoEasyMass.png'
import { useRouter } from "next/router";
import { useIntl } from "react-intl";


interface sideBarProps {
    open: boolean,
    toggleDrawer: (newOpen: boolean) => void,
    navItems: INavItem[]
}
export default function SideBar({ open, toggleDrawer, navItems }: sideBarProps) {
    const { push } = useRouter()
    const { formatMessage } = useIntl()
    return (
        <Drawer
            open={open}
            onClose={() => toggleDrawer(false)}
            anchor="right"
        >
            <Box sx={{
                display: 'grid',
                gridTemplateRows: '1fr auto',
                padding: '30px 15px',
                height: '100%'
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '45px'
                }}>
                    <Image
                        src={LogoEasy}
                        alt='logo Easy Messe'
                        style={{ width: '150px', height: 'auto', cursor: 'pointer' }}
                        onClick={() => push('/')}
                    />
                    <Box sx={{
                        display: 'grid',
                        rowGap: 2,
                    }}>
                        {navItems.map((navItem, index) => (
                            <NavItem
                                navItem={navItem}
                                key={index}
                                handleLink={() => {
                                    push(navItem.route)
                                    toggleDrawer(false)
                                }
                                }
                            />

                        ))}
                    </Box>
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridAutoFlow: 'column',
                    columnGap: 0.5,
                }}>
                    <LanguageSwapper />
                    <Button
                        variant="contained"
                        color="primary"
                        disableElevation={false}
                    >
                        {formatMessage({ id: 'orderMass' })}
                    </Button>
                </Box>

            </Box>
        </Drawer>
    );
}
