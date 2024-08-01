import { BreadcrumbsNameMaps, Header, ProfileProps, SideBar, SideBarSection } from '@easy-messe/shared-ui';
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
                    label: formatMessage({ id: 'parishes' }),
                    icon: <Icon icon={taskIcon} fontSize={24} />,
                    link: '/parishes'
                },
                {
                    label: formatMessage({ id: 'masses' }),
                    icon: <Icon icon={libraryIcon} fontSize={24} />,
                    link: '/masses'
                },
            ]
        },

    ]

    const breadcrumbsNameMap: BreadcrumbsNameMaps[] = [
        {
            title: formatMessage({ id: 'parishes' }),
            links: {
                '/parishes': formatMessage({ id: 'parishes' }),
            }
        },
        {
            title: formatMessage({ id: 'masses' }),
            links: {
                '/masses': formatMessage({ id: 'masses' }),
                '/masses/[id]': 'Saint Paul Apôtre',
            }
        },
    ]

    useEffect(() => (
        // TODO fetch data profile from API
        setProfileData({
            name: 'Diocèse de Bafoussam',
            email: 'diocèsedebaf@gmail.com'
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
