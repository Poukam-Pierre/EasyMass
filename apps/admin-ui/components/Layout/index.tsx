import { BreadcrumbsNameMaps, Header, SideBar, SideBarSection } from '@easy-messe/shared-ui';
import churchIcon from '@iconify-icons/ph/church';
import gearIcon from '@iconify-icons/ph/gear';
import userCircleIcon from '@iconify-icons/ph/user-circle';
import usersThreeIcon from '@iconify-icons/ph/users-three';
import dashboardIcon from '@iconify-icons/material-symbols/space-dashboard-outline';
import cityIcon from '@iconify-icons/material-symbols/location-city';
import financeIcon from '@iconify-icons/material-symbols/attach-money';
import libraryIcon from '@iconify-icons/material-symbols/local-library-outline-rounded';
import taskIcon from '@iconify-icons/material-symbols/task-outline';
import massPricingIcon from '@iconify-icons/material-symbols/payments-outline';
import { Icon } from "@iconify/react";
import { Box } from "@mui/material";
import { useRouter } from 'next/router';
import { PropsWithChildren } from "react";
import { useIntl } from "react-intl";
import { useAuth } from '../../contexts/AuthContext';

export default function AppLayout({ children }: PropsWithChildren) {
    const { formatMessage } = useIntl()
    const { admin, logout } = useAuth()

    const router = useRouter()
    const { query: { rubrics } } = router

    const sideBarSectionParish: SideBarSection[] = [
        {
            title: formatMessage({ id: 'overview' }),
            sideBarItems: [
                {
                    label: formatMessage({ id: 'dashboard' }),
                    icon: <Icon icon={dashboardIcon} fontSize={24} />,
                    link: '/'
                },
            ]
        },
        {
            title: formatMessage({ id: 'management' }),
            sideBarItems: [
                {
                    label: formatMessage({ id: 'parishes' }),
                    icon: <Icon icon={churchIcon} fontSize={24} />,
                    link: '/parishes'
                },
                {
                    label: formatMessage({ id: 'masses' }),
                    icon: <Icon icon={libraryIcon} fontSize={24} />,
                    link: '/masses'
                },
                {
                    label: formatMessage({ id: 'massOffer' }),
                    icon: <Icon icon={taskIcon} fontSize={24} />,
                    link: '/massOffer'
                },
                {
                    label: formatMessage({ id: 'priests' }),
                    icon: <Icon icon={userCircleIcon} fontSize={24} />,
                    link: '/priests'
                },
                {
                    label: formatMessage({ id: 'cities' }),
                    icon: <Icon icon={cityIcon} fontSize={24} />,
                    link: '/cities'
                },
                {
                    label: formatMessage({ id: 'massPricing' }),
                    icon: <Icon icon={massPricingIcon} fontSize={24} />,
                    link: '/mass-pricing'
                },
            ]
        },
        {
            title: formatMessage({ id: 'finances' }),
            sideBarItems: [
                {
                    label: formatMessage({ id: 'finances' }),
                    icon: <Icon icon={financeIcon} fontSize={24} />,
                    link: '/finances'
                },
            ]
        },
        {
            title: formatMessage({ id: 'administration' }),
            sideBarItems: [
                {
                    label: formatMessage({ id: 'administrators' }),
                    icon: <Icon icon={usersThreeIcon} fontSize={24} />,
                    link: '/administrators'
                },
                {
                    label: formatMessage({ id: 'settings' }),
                    icon: <Icon icon={gearIcon} fontSize={24} />,
                    link: '/settings'
                },
            ]
        },
    ]

    const breadcrumbsNameMap: BreadcrumbsNameMaps[] = [
        {
            title: formatMessage({ id: 'dashboard' }),
            links: { '/': formatMessage({ id: 'dashboard' }) }
        },
        {
            title: formatMessage({ id: 'parishes' }),
            links: {
                '/parishes': formatMessage({ id: 'parishes' }),
                '/parishes/[parishId]': `${rubrics ?? formatMessage({ id: 'parishes' })}`,
            }
        },
        {
            title: formatMessage({ id: 'masses' }),
            links: {
                '/masses': formatMessage({ id: 'masses' }),
                '/masses/[massesId]': `${rubrics}`,
            }
        },
        {
            title: formatMessage({ id: 'massRequest' }),
            links: {
                '/massOffer': formatMessage({ id: 'massRequest' }),
            }
        },
        {
            title: formatMessage({ id: 'priests' }),
            links: { '/priests': formatMessage({ id: 'priests' }) }
        },
        {
            title: formatMessage({ id: 'cities' }),
            links: { '/cities': formatMessage({ id: 'cities' }) }
        },
        {
            title: formatMessage({ id: 'massPricing' }),
            links: { '/mass-pricing': formatMessage({ id: 'massPricing' }) }
        },
        {
            title: formatMessage({ id: 'finances' }),
            links: {
                '/finances': formatMessage({ id: 'finances' }),
            }
        },
        {
            title: formatMessage({ id: 'administrators' }),
            links: { '/administrators': formatMessage({ id: 'administrators' }) }
        },
        {
            title: formatMessage({ id: 'settings' }),
            links: { '/settings': formatMessage({ id: 'settings' }) }
        },
        {
            title: formatMessage({ id: 'profile' }),
            links: { '/profile': formatMessage({ id: 'profile' }) }
        },
    ]

    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            height: '100svh'
        }}>
            <SideBar
                sideBarSection={sideBarSectionParish}
                profile={{ name: admin?.name ?? '', email: admin?.email ?? '' }}
                onLogout={logout}
                onProfileClick={() => router.push('/profile')}
            />
            <Box sx={{
                display: 'grid',
                gridTemplateRows: 'auto 1fr',
                overflow: 'auto'
            }}>
                <Header breadcrumbsNameMap={breadcrumbsNameMap} />
                <Box sx={{
                    padding: '25px 50px 40px'
                }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
