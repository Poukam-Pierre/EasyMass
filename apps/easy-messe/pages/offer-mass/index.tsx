import { Box, Divider, Typography } from "@mui/material";
import HeroMass from "../../components/OfferMass/HeroMass";
import LetOfferMass from "../../components/OfferMass/LetOfferMass";
import OfferList from "apps/easy-messe/components/OfferMass/OfferList";
import warningIcon from '@iconify-icons/fluent/warning-24-regular'
import { Icon } from "@iconify/react";

export default function OrderMass() {
    return (
        <>
            <HeroMass />
            <Box sx={{
                padding: '20px 90px'
            }}>
                <Typography> Demande de messe</Typography>
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
        </>
    );
}
