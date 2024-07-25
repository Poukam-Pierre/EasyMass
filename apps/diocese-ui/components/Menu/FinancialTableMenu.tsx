import { Icon, IconifyIcon } from "@iconify/react";
import { Box, Menu, MenuItem, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { FinanceParish } from "../Masses/FinancialTableParishes";

export interface MenuItem {
    title: string;
    icon: IconifyIcon
}

interface FinancialTableMenuProps {
    anchorEl: HTMLElement | null;
    setAnchorEl: (anchor: HTMLElement | null) => void;
    menuItem: MenuItem[];
    idSelected: number;
    parishData: FinanceParish | undefined
}
export default function FinancialTableMenu({
    anchorEl,
    setAnchorEl,
    menuItem,
    idSelected,
    parishData
}: FinancialTableMenuProps) {
    const handleModalDialog = () => {
        setAnchorEl(null)
        console.log(idSelected)
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
            {menuItem.map(({ title, icon }, index) => (
                <MenuItem
                    key={index}
                    value={title}
                    onClick={() => handleModalDialog()}

                >
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        columnGap: 1,
                        alignItems: 'center',
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
