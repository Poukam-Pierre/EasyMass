import { theme } from "@easy-messe/libs/theme";
import ChurchIcon from '@iconify-icons/ph/church';
import SparkleIcon from '@iconify-icons/ph/sparkle';
import ShieldCheckIcon from '@iconify-icons/ph/shield-check';
import GlobeIcon from '@iconify-icons/ph/globe-hemisphere-west';
import { Icon, IconifyIcon } from "@iconify/react";
import { Box, Divider, Typography } from "@mui/material";
import { useIntl } from "react-intl";

interface Value {
    icon: IconifyIcon
    title: string
    description: string
}

export default function OurValues() {
    const { formatMessage } = useIntl()

    const values: Value[] = [
        {
            icon: ChurchIcon,
            title: formatMessage({ id: 'valueFaithTitle' }),
            description: formatMessage({ id: 'valueFaithDescription' })
        },
        {
            icon: SparkleIcon,
            title: formatMessage({ id: 'valueSimplicityTitle' }),
            description: formatMessage({ id: 'valueSimplicityDescription' })
        },
        {
            icon: ShieldCheckIcon,
            title: formatMessage({ id: 'valueTrustTitle' }),
            description: formatMessage({ id: 'valueTrustDescription' })
        },
        {
            icon: GlobeIcon,
            title: formatMessage({ id: 'valueAccessibilityTitle' }),
            description: formatMessage({ id: 'valueAccessibilityDescription' })
        }
    ]

    return (
        <Box
            component='section'
            sx={{
                padding: { laptop: '60px 90px', mobile: '40px 21px' },
                display: 'grid',
                rowGap: '40px'
            }}
        >
            <Box sx={{ display: 'grid', justifyItems: 'center', rowGap: '10px' }}>
                <Typography variant="h3" sx={{ color: theme.palette.primary.main }}>
                    {formatMessage({ id: 'ourValues' })}
                </Typography>
                <Typography variant="h3">{formatMessage({ id: 'ourValuesSubtitle' })}</Typography>
                <Divider sx={{ width: '100px', border: '1px solid var(--goldChurch)' }} />
            </Box>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { laptop: 'repeat(4, 1fr)', tablet: 'repeat(2, 1fr)', mobile: '1fr' },
                columnGap: '24px',
                rowGap: '24px'
            }}>
                {values.map(({ icon, title, description }) => (
                    <Box key={title} sx={{
                        display: 'grid',
                        justifyItems: { laptop: 'start', mobile: 'center' },
                        rowGap: '12px',
                        padding: '24px',
                        border: `1px solid ${theme.common.line}`,
                        borderRadius: '12px',
                        textAlign: { laptop: 'left', mobile: 'center' }
                    }}>
                        <Box sx={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: theme.palette.secondary.main
                        }}>
                            <Icon icon={icon} width={24} height={24} color={theme.palette.primary.main} />
                        </Box>
                        <Typography variant="h4" sx={{ paddingBottom: 0 }}>{title}</Typography>
                        <Typography sx={{ color: theme.common.body }}>{description}</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
