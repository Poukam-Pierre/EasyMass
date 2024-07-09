import { Icon, IconifyIcon } from "@iconify/react";
import { Box, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

export interface MenuIntem {
    title: string;
    icon: IconifyIcon
}
export default function MassMenu({
    anchorEl,
    setAnchorEl,
    menuItem
}: {
    anchorEl: HTMLAnchorElement | null;
    setAnchorEl: (anchor: HTMLAnchorElement | null) => void;
    menuItem: MenuIntem[]
}) {
    const [selectedIndex, setSelectedIndex] = useState<number>(0)

    const handleMenuChange = (index: number, title: string) => {
        setSelectedIndex(index);
        setAnchorEl(null);
    }
    return (
        <Menu
            anchorEl={anchorEl}
            open={anchorEl !== null}
            onClose={() => setAnchorEl(null)}
        >
            {menuItem.map(({ title, icon }, index) => (
                <MenuItem
                    disableGutters
                    dense
                    key={index}
                    value={title}
                    onClick={() => handleMenuChange(index, title)}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 8px',
                        width: '100%',
                        gap: 1,
                    }}>
                        {title}
                        <Icon
                            icon={icon}
                            fontSize={24}
                            color="var(--primary)"
                            style={{
                                opacity: index === selectedIndex ? 'initial' : 0
                            }}
                        />
                    </Box>
                </MenuItem>
            ))}
        </Menu>
    );
}
