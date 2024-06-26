import warningIcon from '@iconify-icons/fluent/warning-24-regular';
import { Icon } from "@iconify/react";
import { Badge, Box, Divider, Tab, Tabs, Typography } from "@mui/material";
import OfferList from "../../components/OfferMass/OfferList";
import { ReactNode, useState } from "react";
import HeroMass from "../../components/OfferMass/HeroMass";
import LetOfferMass from "../../components/OfferMass/LetOfferMass";
import { useIntl } from 'react-intl';
import { useOfferMass } from '@easy-messe/libs/theme';
import OfferMassCart from '../../components/OfferMass/OfferMassCard';

type TabComponent = Record<number, ReactNode>;
interface TabTitle {
    title: string;
    badgeContent?: number;
    color: 'primary';
    invisible: boolean;
}

export default function OrderMass() {
    const [activeTabIndex, setActiveTabIndex] = useState<number>(1)
    const { massRequested } = useOfferMass()
    const { formatMessage } = useIntl()
    const tabTitle: TabTitle[] = [
        {
            title: 'Liste de demandes',
            badgeContent: massRequested.length,
            color: 'primary',
            invisible: false
        },
        {
            title: 'Demande de messes',
            color: 'primary',
            invisible: true
        }
    ]

    const tabComponent: TabComponent = {
        0: (
            <OfferList>
                {massRequested.length !== 0 ? (
                    <OfferMassCart massInfos={massRequested} />

                ) : (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Icon icon={warningIcon} fontSize={24} />
                        <Typography variant='body2'>{formatMessage({ id: 'noProcessMass' })}</Typography>
                    </Box>

                )}
            </OfferList>
        ),
        1: (
            <LetOfferMass />
        )
    }

    return (
        <>
            <HeroMass />
            <Box sx={{
                padding: '40px 90px',
                display: { laptop: 'inherit', mobile: 'none' }
            }}>
                <Typography variant="h2">{formatMessage({ id: 'massRequest' })}</Typography>
                <Divider />
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '2fr auto 1fr',
                }}>
                    <LetOfferMass />
                    <Divider orientation="vertical" />
                    <OfferList>
                        {massRequested.length !== 0 ? (
                            <OfferMassCart massInfos={massRequested} />

                        ) : (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Icon icon={warningIcon} fontSize={24} />
                                <Typography variant='body2'>{formatMessage({ id: 'noProcessMass' })}</Typography>
                            </Box>

                        )}
                    </OfferList>
                </Box>
            </Box>
            <Box sx={{
                display: { laptop: 'none', mobile: 'inherit' }
            }}>
                <Tabs
                    value={activeTabIndex}
                    onChange={(_, tabIndex) => setActiveTabIndex(tabIndex)}
                    textColor='primary'
                    indicatorColor="primary"
                    centered
                >
                    {
                        tabTitle.map(({ title, color, invisible, badgeContent }, index) => (
                            <Tab
                                disableRipple
                                key={index}
                                label={
                                    <Badge
                                        invisible={invisible}
                                        color={color}
                                        badgeContent={badgeContent}
                                    >
                                        {title}
                                    </Badge>
                                }
                            />
                        ))
                    }
                </Tabs>
                {tabComponent[activeTabIndex]}
            </Box>
        </>
    );
}
