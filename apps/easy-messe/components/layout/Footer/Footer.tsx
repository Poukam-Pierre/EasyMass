import { Box, Divider, IconButton, Typography } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import { Icon, IconifyIcon } from '@iconify/react'
import InstagramLogo from '@iconify-icons/ph/instagram-logo'
import LinkedinLogo from '@iconify-icons/ph/linkedin-logo'
import TwitterLogo from '@iconify-icons/ph/twitter-logo'
import { useIntl } from 'react-intl'

const TEXT_COLOR = '#B5B7C9'
const HEADING_COLOR = '#FFFFFF'

interface FooterLink {
    label: string
    href: string
}

interface FooterColumnProps {
    title: string
    links: FooterLink[]
}

function FooterColumn({ title, links }: FooterColumnProps) {
    return (
        <Box sx={{ display: 'grid', rowGap: '14px', height: 'fit-content' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: HEADING_COLOR }}>
                {title}
            </Typography>
            <Box sx={{
                display: 'grid',
                rowGap: '10px',
                '& a': {
                    width: 'fit-content',
                    fontSize: '14px',
                    textDecoration: 'none',
                    color: TEXT_COLOR
                },
                '& a:hover': { color: HEADING_COLOR }
            }}>
                {links.map(({ label, href }) => (
                    <Link key={label} href={href}>
                        {label}
                    </Link>
                ))}
            </Box>
        </Box>
    )
}

export default function Footer() {
    const { formatMessage } = useIntl()

    const usefulLinks: FooterLink[] = [
        { label: formatMessage({ id: 'home' }), href: '/' },
        { label: formatMessage({ id: 'aboutUs' }), href: '/about' },
        { label: formatMessage({ id: 'offerMass' }), href: '/offer-mass' },
        { label: formatMessage({ id: 'contact' }), href: '#' },
    ]

    const resourceLinks: FooterLink[] = [
        { label: formatMessage({ id: 'faq' }), href: '#' },
        { label: formatMessage({ id: 'blog' }), href: '#' },
        { label: formatMessage({ id: 'legalNotice' }), href: '#' },
        { label: formatMessage({ id: 'privacyPolicy' }), href: '#' },
    ]

    const socialLinks: { icon: IconifyIcon; href: string; label: string }[] = [
        { icon: InstagramLogo, href: 'https://instagram.com', label: 'Instagram' },
        { icon: LinkedinLogo, href: 'https://linkedin.com', label: 'LinkedIn' },
        { icon: TwitterLogo, href: 'https://twitter.com', label: 'Twitter' },
    ]

    return (
        <Box component="footer" sx={{
            backgroundColor: '#151530',
            color: TEXT_COLOR,
            padding: { laptop: '56px 90px 24px', mobile: '40px 21px 24px' },
            display: 'grid',
            rowGap: '40px'
        }}>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { laptop: '1.4fr 1fr 1fr 1fr', mobile: '1fr' },
                columnGap: '24px',
                rowGap: '32px'
            }}>
                <Box sx={{ display: 'grid', rowGap: '16px', height: 'fit-content' }}>
                    <Image
                        src="/LogoEasyMass.png"
                        alt="logo easy mass"
                        width={160}
                        height={65}
                    />
                    <Typography sx={{ fontSize: '14px', lineHeight: '22px', color: TEXT_COLOR }}>
                        {formatMessage({ id: 'footerDescription' })}
                    </Typography>
                </Box>
                <FooterColumn title={formatMessage({ id: 'usefulLinks' })} links={usefulLinks} />
                <FooterColumn title={formatMessage({ id: 'resources' })} links={resourceLinks} />
                <Box sx={{ display: 'grid', rowGap: '10px', height: 'fit-content' }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 700, color: HEADING_COLOR }}>
                        {formatMessage({ id: 'contact' })}
                    </Typography>
                    <Typography
                        component="a"
                        href="mailto:support@easymesse.fr"
                        sx={{ fontSize: '14px', color: TEXT_COLOR, textDecoration: 'none', width: 'fit-content', '&:hover': { color: HEADING_COLOR } }}
                    >
                        support@easymesse.fr
                    </Typography>
                    <Typography
                        component="a"
                        href="tel:+33123456789"
                        sx={{ fontSize: '14px', color: TEXT_COLOR, textDecoration: 'none', width: 'fit-content', '&:hover': { color: HEADING_COLOR } }}
                    >
                        +33 (0)1 23 45 67 89
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: TEXT_COLOR }}>
                        12 rue de l&apos;Église, 75000 Paris
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', columnGap: '16px' }}>
                {socialLinks.map(({ icon, href, label }) => (
                    <IconButton
                        key={label}
                        component="a"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        sx={{
                            width: '40px',
                            height: '40px',
                            color: HEADING_COLOR,
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.16)' }
                        }}
                    >
                        <Icon icon={icon} width={18} height={18} />
                    </IconButton>
                ))}
            </Box>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                rowGap: '8px'
            }}>
                <Typography sx={{ fontSize: '13px', color: TEXT_COLOR }}>
                    © {new Date().getFullYear()} EasyMesse. {formatMessage({ id: 'allRightsReserved' })}
                </Typography>
                <Typography sx={{ fontSize: '13px', color: TEXT_COLOR }}>
                    {formatMessage({ id: 'madeWith' })} ❤️
                </Typography>
            </Box>
        </Box>
    )
}
