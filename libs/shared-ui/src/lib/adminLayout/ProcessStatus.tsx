import { Typography } from "@mui/material"

export const showTransactionStatus = (label: string) => {
    switch (label) {
        case 'done':
            return (
                <Typography sx={{
                    bgcolor: 'rgba(92, 179, 96, 0.15)',
                    color: 'var(--success)',
                    width: 'fit-content',
                    borderRadius: '20px',
                    padding: 1,
                    fontWeight: 'bold',
                }}>
                    {label}
                </Typography>
            )
        case 'echec':
            return (
                <Typography sx={{
                    bgcolor: 'rgba(199, 0, 0, 0.15)',
                    color: 'var(--error)',
                    width: 'fit-content',
                    borderRadius: '20px',
                    padding: 1,
                    fontWeight: 'bold',
                }}>
                    {label}
                </Typography>
            )
        case 'in process':
            return (
                <Typography sx={{
                    bgcolor: 'rgba(156, 213, 245, 0.3)',
                    color: 'var(--secondary)',
                    width: 'fit-content',
                    borderRadius: '20px',
                    padding: 1,
                    fontWeight: 'bold',
                }}>
                    {label}
                </Typography>
            )
        case 'locked':
            return (
                <Typography sx={{
                    bgcolor: 'rgba(255, 184, 0, 0.3)',
                    color: 'var(--warning)',
                    width: 'fit-content',
                    borderRadius: '20px',
                    padding: 1,
                    fontWeight: 'bold',
                }}>
                    {label}
                </Typography>
            )
        case 'open':
            return (
                <Typography sx={{
                    bgcolor: 'rgba(2, 109, 169, 0.3)',
                    color: 'var(--primary)',
                    width: 'fit-content',
                    borderRadius: '20px',
                    padding: 1,
                    fontWeight: 'bold',
                }}>
                    {label}
                </Typography>
            )
    }
}
