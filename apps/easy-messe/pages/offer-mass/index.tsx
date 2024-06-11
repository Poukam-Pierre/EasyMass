import { Box, Divider, Tabs, Typography, Tab } from "@mui/material";
import HeroMass from "../../components/OfferMass/HeroMass";
import LetOfferMass from "../../components/OfferMass/LetOfferMass";
import OfferList from "apps/easy-messe/components/OfferMass/OfferList";
import warningIcon from '@iconify-icons/fluent/warning-24-regular'
import { Icon } from "@iconify/react";
import { ReactNode, useState } from "react";
import { theme } from "@easy-messe/libs/theme";

type TabComponent = Record<number, ReactNode>;
export default function OrderMass() {
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
    const tabTitle = ['Liste de demande', 'Demande de messes']

    const tabComponent: TabComponent = {
        0: (
            <OfferList>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Icon icon={warningIcon} fontSize={24} />
                    <Typography variant='body2'>Aucune demande de messe en cours</Typography>
                </Box>
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
                <Typography variant="h2"> Demande de messe</Typography>
                <Divider />
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '2fr auto 1fr',
                }}>
                    <LetOfferMass />
                    <Divider orientation="vertical" />
                    <OfferList>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Icon icon={warningIcon} fontSize={24} />
                            <Typography variant='body2'>Aucune demande de messe en cours</Typography>
                        </Box>
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
                        tabTitle.map((tabTitle, index) => (
                            <Tab
                                disableRipple
                                key={index}
                                label={tabTitle}
                            />
                        ))
                    }
                </Tabs>
                {tabComponent[activeTabIndex]}
            </Box>
        </>
    );
}
