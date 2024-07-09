import { Box, Menu, MenuItem, Typography } from "@mui/material";
import trashIcon from '@iconify-icons/ph/trash-light'
import editIcon from '@iconify-icons/fluent/edit-28-regular'
import { Icon } from "@iconify/react";
import { MenuIntem } from "./MassMenu";

interface MenuItemForMassOwner extends MenuIntem {
    color?: string
}

interface MassOwnerTableMenuProps {
    anchorEl: HTMLElement | null;
    setAnchorEl: (anchor: HTMLElement | null) => void;
    handleModify: () => void;
    handleCancel: () => void;
}


export default function MassOwnerTableMenu({
    anchorEl,
    setAnchorEl,
    handleModify,
    handleCancel
}: MassOwnerTableMenuProps) {
    const menuItem: MenuItemForMassOwner[] = [
        {
            title: 'Modify',
            icon: editIcon
        },
        {
            title: 'Delete',
            icon: trashIcon,
            color: 'var(--error)'
        },
    ]

    const handleModalDialog = (title: string) => {
        setAnchorEl(null)
        switch (title) {
            case 'Modify':
                handleModify();
                break;
            case 'Delete':
                handleCancel()
                break
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
                    onClick={() => handleModalDialog(title)}
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
