import { Box, Menu, MenuItem, Typography } from "@mui/material";
import { MenuItemForMassOwner } from "../Masses/MassOwnerTable";
import { useIntl } from "react-intl";


interface MassOwnerTableMenuProps {
    anchorEl: HTMLElement | null;
    setAnchorEl: (anchor: HTMLElement | null) => void;
    handleModify: () => void;
    handleCancel: () => void;
    menuItem: MenuItemForMassOwner[]
}


export default function MassOwnerTableMenu({
    anchorEl,
    setAnchorEl,
    handleModify,
    handleCancel,
    menuItem
}: MassOwnerTableMenuProps) {
    const { formatMessage } = useIntl()
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
