import { IconifyIcon } from "@iconify/react";
import { Icon } from "@iconify/react";
import { Box, Typography } from "@mui/material";

interface StatTileProps {
    label: string;
    value: string;
    icon: IconifyIcon;
    accentColor: string;
}

export default function StatTile({ label, value, icon, accentColor }: StatTileProps) {
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
            columnGap: '16px',
            padding: '20px',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            bgcolor: 'var(--offWhite)'
        }}>
            <Box sx={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${accentColor}1F`
            }}>
                <Icon icon={icon} width={24} height={24} color={accentColor} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: 'var(--body)' }}>{label}</Typography>
                <Typography variant="h3" sx={{ paddingBottom: 0, whiteSpace: 'nowrap' }}>{value}</Typography>
            </Box>
        </Box>
    );
}
