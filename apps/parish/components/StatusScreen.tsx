import warningIcon from '@iconify-icons/ph/warning-circle';
import { Icon } from '@iconify/react';
import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';

interface StatusScreenProps {
    titleId: string;
    messageId: string;
}

/** Full-page "this can't be done here" notice with a way back to login —
 * shared by every public page that can end in a dead end (recovery not
 * built yet, an invalid or expired setup link, ...). */
export default function StatusScreen({ titleId, messageId }: StatusScreenProps) {
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
      <Icon icon={warningIcon} width={48} height={48} color="var(--warning)" />
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
