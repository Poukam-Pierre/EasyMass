import mailIcon from '@iconify-icons/ph/envelope-simple-light';
import warningIcon from '@iconify-icons/ph/warning-circle';
import { Icon } from '@iconify/react';
import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';

export interface StatusScreenProps {
    titleId: string;
    messageId: string;
    /** `warning` for a dead end (invalid or expired link, ...), `mail` for
     * "we've emailed you". */
    variant?: 'warning' | 'mail';
}

/** Full-page notice with a way back to login — shared by every public page
 * that ends on a message rather than a form. */
export function StatusScreen({ titleId, messageId, variant = 'warning' }: StatusScreenProps) {
    const { formatMessage } = useIntl();
    const { push } = useRouter();

    return (
        <Box
            sx={{
                display: 'grid',
                justifyItems: 'center',
                alignContent: 'baseline',
                rowGap: 3,
                width: 464,
                marginTop: '120px',
                justifySelf: 'center',
                textAlign: 'center',
            }}
        >
            <Icon
                icon={variant === 'mail' ? mailIcon : warningIcon}
                width={48}
                height={48}
                color={variant === 'mail' ? 'var(--primary)' : 'var(--warning)'}
            />
            <Typography variant="h2">
                {formatMessage({ id: titleId })}
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--body)' }}>
                {formatMessage({ id: messageId })}
            </Typography>
            <Button variant="contained" onClick={() => push('/login')}>
                {formatMessage({ id: 'backToLogin' })}
            </Button>
        </Box>
    );
}
