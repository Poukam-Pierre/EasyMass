import { useLanguage } from '@easy-messe/libs/theme';
import { Box, Button, Typography } from '@mui/material';
import { useIntl } from 'react-intl';

export function Index() {
    const { formatMessage } = useIntl();
    const { activeLanguage, languageDispatch } = useLanguage();
    return (
        <Box>
            <Button
                variant="contained"
                color="primary"
                onClick={() =>
                    languageDispatch({
                        type: activeLanguage === 'en' ? 'USE_FRENCH' : 'USE_ENGLISH',
                    })
                }
            >
                Change Language: {activeLanguage}
            </Button>
            <Typography variant="h1"> {formatMessage({ id: 'Hello' })}</Typography>
        </Box>
    );
}

export default Index;
