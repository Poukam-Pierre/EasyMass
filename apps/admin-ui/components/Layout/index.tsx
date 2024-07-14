import { BreadcrumbsNameMaps, Header, ProfileProps, SideBar, SideBarSection } from '@easy-messe/shared-ui';
import financeIcon from '@iconify-icons/material-symbols/attach-money';
import libraryIcon from '@iconify-icons/material-symbols/local-library-outline-rounded';
import taskIcon from '@iconify-icons/material-symbols/task-outline';
import { Icon } from "@iconify/react";
import { Box } from "@mui/material";
import { PropsWithChildren, useEffect, useState } from "react";
import { useIntl } from "react-intl";


export default function AppLayout({ children }: PropsWithChildren) {
    const { formatMessage } = useIntl()
    const [profileData, setProfileData] = useState<ProfileProps>({
        name: '',
        email: ''
    })

    const sideBarSectionParish: SideBarSection[] = [
        {
            title: 'Management',
            sideBarItems: [
                {
                    label: formatMessage({ id: 'massOffer' }),
                    icon: <Icon icon={taskIcon} fontSize={24} />,
                    link: '/massOffer'
                },
                {
                    label: formatMessage({ id: 'masses' }),
                    icon: <Icon icon={libraryIcon} fontSize={24} />,
                    link: '/masses'
                },
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
            title: formatMessage({ id: 'massOffer' }),
            links: {
                '/massOffer': formatMessage({ id: 'massOffer' }),
            }
        },
        {
            title: formatMessage({ id: 'masses' }),
            links: {
                '/masses': formatMessage({ id: 'masses' }),
            }
        },
        {
            title: formatMessage({ id: 'finances' }),
            links: {
                '/finances': formatMessage({ id: 'finances' }),
                'finances/withdrawal': formatMessage({ id: 'withdrawal' }),
            }
        },
    ]

    useEffect(() => (
        // TODO fetch data profile from API
        setProfileData({
            name: 'Saint Martin de Tour',
            email: 'saintmartin@gmail.com'
        })

    ), [])

    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            height: '100svh'
        }}>
            <SideBar
                sideBarSection={sideBarSectionParish}
                profile={profileData}

            />
            <Box sx={{
                display: 'grid',
                gridTemplateRows: 'auto 1fr'
            }}>
                <Header breadcrumbsNameMap={breadcrumbsNameMap} />
                <Box sx={{
                    padding: '25px 50px 0'
                }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
