import { theme } from '@easy-messe/libs/theme';
import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';

export default function HeroAbout() {
  const { formatMessage } = useIntl();
  const { push } = useRouter();
  return (
    <Box
      sx={{
        backgroundImage: `url('/heroMassImgColor.jpg')`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        minHeight: { laptop: '350px', mobile: '260px' },
        position: 'relative',
        display: 'grid',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: '#151530',
          opacity: 0.6,
          position: 'absolute',
        }}
      />
      <Box
        sx={{
          display: 'grid',
          rowGap: '16px',
          justifyItems: 'center',
          alignSelf: 'center',
          padding: { laptop: '0 90px', mobile: '10px 21px' },
          zIndex: 0,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { laptop: '48px', mobile: '30px' },
            lineHeight: { laptop: '58px', mobile: '38px' },
            color: '#FFFFFF',
            textAlign: 'center',
            width: { laptop: '900px', mobile: 'auto' },
            padding: 0,
          }}
        >
          {formatMessage({ id: 'aboutHeroTitle' })}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            color: '#E5E5F0',
            textAlign: 'center',
            fontWeight: 500,
            width: { laptop: '700px', mobile: 'auto' },
            paddingBottom: 0,
          }}
        >
          {formatMessage({ id: 'aboutHeroSubtitle' })}
        </Typography>
        <Button
          variant="contained"
          disableElevation
          onClick={() => push('/offer-mass')}
          sx={{
            bgcolor: theme.palette.primary.contrastText,
            color: theme.palette.secondary.contrastText,
            marginTop: '8px',
          }}
        >
          {formatMessage({ id: 'offerMass' })}
        </Button>
      </Box>
    </Box>
  );
}
