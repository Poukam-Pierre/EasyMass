import { Icon } from "@iconify/react";
import { Box, Menu, MenuItem, Typography } from "@mui/material";
import { MenuItems } from "../Parishes/ParishesTables";
import { useIntl } from "react-intl";


interface ParishTableMenuProps {
    anchorEl: HTMLElement | null;
    setAnchorEl: (anchor: HTMLElement | null) => void;
    menuItem: MenuItems[];
    handleModify: () => void;
    handleCancel: () => void;
}


export default function ParishTableMenu({
    anchorEl,
    setAnchorEl,
    menuItem,
    handleModify,
    handleCancel
}: ParishTableMenuProps) {
    const { formatMessage } = useIntl()
    const handleMenuDialog = (title: string) => {
        setAnchorEl(null)
        switch (title) {
            case formatMessage({ id: 'modify' }):
                handleModify();
                break;
            case formatMessage({ id: 'delete' }):
                handleCancel()
                break;
        }
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
