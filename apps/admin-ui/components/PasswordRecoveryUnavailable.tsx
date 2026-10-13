import warningIcon from '@iconify-icons/ph/warning-circle';
import { Icon } from "@iconify/react";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useIntl } from "react-intl";

// Self-service password recovery has no backend endpoint (the auth
// controller only exposes login/signup-admin/refresh/logout) — showing a
// working-looking form here would silently do nothing on submit, which is
// worse than being upfront that this isn't built yet.
export default function PasswordRecoveryUnavailable() {
    const { formatMessage } = useIntl()
    const { push } = useRouter()

    return (
        <Box sx={{
            display: 'grid',
            justifyItems: 'center',
            rowGap: 2,
            width: 464,
            marginTop: '120px',
            justifySelf: 'center',
            textAlign: 'center'
        }}>
            <Icon icon={warningIcon} width={48} height={48} color="var(--warning)" />
            <Typography variant="h2">{formatMessage({ id: 'recoveryUnavailableTitle' })}</Typography>
            <Typography variant="body1" sx={{ color: 'var(--body)' }}>
                {formatMessage({ id: 'recoveryUnavailableMessage' })}
            </Typography>
            <Button variant="contained" onClick={() => push('/login')}>
                {formatMessage({ id: 'backToLogin' })}
            </Button>
        </Box>
    );
}
