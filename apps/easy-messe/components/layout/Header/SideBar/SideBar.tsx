import { Box, Button, Drawer } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import { useIntl } from "react-intl";
import LanguageSwapper from "../../LanguageSwapper";
import { INavItem } from "../Header";
import { NavItem } from "../navitem";


interface sideBarProps {
    open: boolean,
    onClose: () => void,
    navItems: INavItem[]
}

export default function SideBar({ open, onClose, navItems }: sideBarProps) {
    const { push, asPath } = useRouter()
    const { formatMessage } = useIntl()
    const isActive = asPath.startsWith('/offer-mass')
    return (
        <Drawer
            open={open}
            onClose={() => onClose()}
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
                                    onClose()
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
                        onClick={() => {
                            push('/offer-mass');
                            onClose();
                        }
                        }
                        disabled={isActive}
                    >
                        {formatMessage({ id: 'offerMass' })}
                    </Button>
                </Box>

            </Box>
        </Drawer>
    );
}
