import { Box, Menu, MenuItem } from "@mui/material";
import checkmarkIcon from '@iconify-icons/fluent/checkmark-circle-24-regular'
import { Icon, IconifyIcon } from "@iconify/react";
import { useState } from "react";
import { useIntl } from "react-intl";

interface MenuIntem {
    title: string;
    icon: IconifyIcon
}
export default function MassOfferMenu({
    anchorEl,
    setAnchorEl,
}: {
    anchorEl: HTMLAnchorElement | null;
    setAnchorEl: (anchor: HTMLAnchorElement | null) => void;
}) {
    const [selectedIndex, setSelectedIndex] = useState<number>(0)
    const { formatMessage } = useIntl()
    const menuItem: MenuIntem[] = [
        {
            title: formatMessage({ id: 'year' }),
            icon: checkmarkIcon
        },
        {
            title: formatMessage({ id: 'month' }),
            icon: checkmarkIcon
        },
        {
            title: formatMessage({ id: 'week' }),
            icon: checkmarkIcon
        }
    ]
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
