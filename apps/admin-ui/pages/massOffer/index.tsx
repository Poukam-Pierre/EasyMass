import { Box, InputAdornment, InputBase, TextField, Typography } from "@mui/material";
import AppLayout from "../../components/Layout";
import MassOfferTable from "../../components/MassOffer/MassofferTable";
import filterIcon from '@iconify-icons/fluent/filter-24-regular'
import searchIcon from '@iconify-icons/fluent/search-24-regular'
import { Icon } from "@iconify/react";
import { useState } from "react";
import MassOfferMenu from "../../components/Menus/MassOfferMenu";



export default function MassOrder() {
    const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null);
    return (
        <AppLayout>
            <Box>
                <MassOfferMenu
                    anchorEl={anchorEl}
                    setAnchorEl={setAnchorEl}
                />
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
                        sx={{
                            paddingBottom: 0
                        }}
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
                        <InputBase
                            placeholder="Rechercher"
                        />
                    </Box>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        alignItems: 'center',
                        columnGap: 1,
                        cursor: 'pointer',
                    }}
                        onClick={(event) => setAnchorEl(event.target as HTMLAnchorElement)}
                    >
                        <Icon icon={filterIcon} fontSize={20} />
                        <Typography
                            variant='body2'
                        >Filtrer</Typography>
                    </Box>
                </Box>
                <MassOfferTable />
            </Box>
        </AppLayout>
    );
}
