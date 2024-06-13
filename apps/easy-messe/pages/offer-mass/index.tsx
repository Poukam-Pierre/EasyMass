import warningIcon from '@iconify-icons/fluent/warning-24-regular';
import { Icon } from "@iconify/react";
import { Box, Divider, Tab, Tabs, Typography } from "@mui/material";
import OfferList from "../../components/OfferMass/OfferList";
import { ReactNode, useState } from "react";
import HeroMass from "../../components/OfferMass/HeroMass";
import LetOfferMass from "../../components/OfferMass/LetOfferMass";
import { useIntl } from 'react-intl';

type TabComponent = Record<number, ReactNode>;

export default function OrderMass() {
    const [activeTabIndex, setActiveTabIndex] = useState<number>(1)
    const tabTitle = ['Liste de demande', 'Demande de messes']
    const { formatMessage } = useIntl()

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
                    <Typography variant='body2'>{formatMessage({ id: 'NoProcessMass' })} </Typography>
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
                <Typography variant="h2">{formatMessage({ id: 'MassRequest' })}</Typography>
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
                            <Typography variant='body2'>{formatMessage({ id: 'NoProcessMass' })}</Typography>
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
