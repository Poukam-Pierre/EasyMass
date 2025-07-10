import { Icon } from "@iconify/react";
import { Box, Menu, MenuItem, Typography } from "@mui/material";
import { MenuItemForMassOwner } from "../Masses/tableMassOwnerData";
import { useIntl } from "react-intl";
import { useRouter } from "next/router";


interface MassOwnerTableMenuProps {
    anchorEl: HTMLElement | null;
    setAnchorEl: (anchor: HTMLElement | null) => void;
    handleModify: () => void;
    handleCancel: () => void;
    menuItem: MenuItemForMassOwner[]
    idSelected?: number;
}


export default function MassOwnerTableMenu({
    anchorEl,
    setAnchorEl,
    handleModify,
    handleCancel,
    menuItem,
    idSelected
}: MassOwnerTableMenuProps) {
    const { formatMessage } = useIntl()
    const { push } = useRouter()
    const handleModalDialog = (title: string) => {
        setAnchorEl(null)
        switch (title) {
            case formatMessage({ id: 'modify' }):
                handleModify();
                break;
            case formatMessage({ id: 'delete' }):
                handleCancel()
                break;
            case formatMessage({ id: 'history' }):
                push({
                    pathname: `/masses/${idSelected}`,
                    query: {
                        rubrics: 'History'
                    }
                })
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
