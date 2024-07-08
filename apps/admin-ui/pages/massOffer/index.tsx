import { Box, Typography } from "@mui/material";
import AppLayout from "../../components/Layout";
import MassOfferTable from "../../components/MassOffer/MassofferTable";
import filterIcon from '@iconify-icons/fluent/filter-24-regular'
import searchIcon from '@iconify-icons/fluent/search-24-regular'
import { Icon } from "@iconify/react";



export default function MassOrder() {
    return (
        <AppLayout>
            <Box>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    marginBottom: 1

                }}>
                    <Typography
                        variant='h3'
                        color='primary'
                    >
                        Liste des différentes offres de messe
                    </Typography>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        alignItems: 'center',
                        columnGap: 1
                    }}>
                        <Icon icon={searchIcon} fontSize={20} />
                        <Typography
                            variant='body2'
                        >Recherche</Typography>
                    </Box>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        alignItems: 'center',
                        columnGap: 1
                    }}>
                        <Icon icon={filterIcon} fontSize={20} />
                        <Typography
                            variant='body2'
                        >Filtres</Typography>
                    </Box>
                </Box>
                <MassOfferTable />
            </Box>
        </AppLayout>
    );
}
