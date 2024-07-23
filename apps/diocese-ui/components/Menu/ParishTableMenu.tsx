import { Icon } from "@iconify/react";
import { Box, Menu, MenuItem, Typography } from "@mui/material";
import { MenuItems } from "../Parishes/ParishesTables";


interface ParishTableMenuProps {
    anchorEl: HTMLElement | null;
    setAnchorEl: (anchor: HTMLElement | null) => void;
    menuItem: MenuItems[]
}


export default function ParishTableMenu({
    anchorEl,
    setAnchorEl,
    menuItem
}: ParishTableMenuProps) {

    const handleMenuDialog = (title: string) => {
        setAnchorEl(null)
    }

    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
        >
            {menuItem.map(({ title, icon, color }, index) => (
                <MenuItem
                    key={index}
                    value={title}
                    onClick={() => handleMenuDialog(title)}
                >
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        columnGap: 1,
                        alignItems: 'center',
                        color: color,
                    }}>
                        <Icon
                            icon={icon}
                            fontSize={16}
                        />
                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: 500,
                            }}
                        >
                            {title}
                        </Typography>
                    </Box>
                </MenuItem>
            ))}
        </Menu>
    );
}
