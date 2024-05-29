import { Box, Button, Drawer } from "@mui/material";
import { INavItem } from "../Header";
import { NavItem } from "../navitem";
import LanguageSwapper from "../../LanguageSwapper";
import Image from "next/image";
import { useRouter } from "next/router";
import { useIntl } from "react-intl";
import { Dispatch, SetStateAction } from "react";


interface sideBarProps {
    open: boolean,
    closeSideBar: Dispatch<SetStateAction<boolean>>,
    navItems: INavItem[]
}
export default function SideBar({ open, closeSideBar, navItems }: sideBarProps) {
    const { push } = useRouter()
    const { formatMessage } = useIntl()
    return (
        <Drawer
            open={open}
            onClose={() => closeSideBar(false)}
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
                        src='/LogoEasyMass.png'
                        alt='logo Easy Messe'
                        width={150}
                        height={70}
                        style={{ cursor: 'pointer' }}
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
                                    closeSideBar(false)
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
                        {formatMessage({ id: 'offerMass' })}
                    </Button>
                </Box>

            </Box>
        </Drawer>
    );
}
