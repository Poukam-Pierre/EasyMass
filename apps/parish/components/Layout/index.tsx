import { BreadcrumbsNameMaps, Header, SideBar, SideBarSection } from '@easy-messe/shared-ui';
import userCircleIcon from '@iconify-icons/ph/user-circle';
import dashboardIcon from '@iconify-icons/material-symbols/space-dashboard-outline';
import financeIcon from '@iconify-icons/material-symbols/attach-money';
import libraryIcon from '@iconify-icons/material-symbols/local-library-outline-rounded';
import taskIcon from '@iconify-icons/material-symbols/task-outline';
import { Icon } from "@iconify/react";
import { Box } from "@mui/material";
import { useRouter } from 'next/router';
import { PropsWithChildren } from "react";
import { useIntl } from "react-intl";
import { useAuth } from '../../contexts/AuthContext';

export default function AppLayout({ children }: PropsWithChildren) {
    const { formatMessage } = useIntl()
    const { parish, logout } = useAuth()

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
                    label: formatMessage({ id: 'masses' }),
                    icon: <Icon icon={libraryIcon} fontSize={24} />,
                    link: '/masses'
                },
                {
                    label: formatMessage({ id: 'massOffer' }),
                    icon: <Icon icon={taskIcon} fontSize={24} />,
                    link: '/mass-orders'
                },
                {
                    label: formatMessage({ id: 'priests' }),
                    icon: <Icon icon={userCircleIcon} fontSize={24} />,
                    link: '/priests'
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
    ]

    const breadcrumbsNameMap: BreadcrumbsNameMaps[] = [
        {
            title: formatMessage({ id: 'dashboard' }),
            links: { '/': formatMessage({ id: 'dashboard' }) }
        },
        {
            title: formatMessage({ id: 'masses' }),
            links: {
                '/masses': formatMessage({ id: 'masses' }),
                '/masses/[massId]': `${rubrics ?? formatMessage({ id: 'masses' })}`,
            }
        },
        {
            title: formatMessage({ id: 'massRequest' }),
            links: {
                '/mass-orders': formatMessage({ id: 'massRequest' }),
            }
        },
        {
            title: formatMessage({ id: 'priests' }),
            links: { '/priests': formatMessage({ id: 'priests' }) }
        },
        {
            title: formatMessage({ id: 'finances' }),
            links: { '/finances': formatMessage({ id: 'finances' }) }
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
                profile={{ name: parish?.name ?? '', email: parish?.email ?? '' }}
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
