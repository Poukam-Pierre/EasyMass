import filterIcon from '@iconify-icons/fluent/filter-24-regular';
import searchIcon from '@iconify-icons/fluent/search-24-regular';
import { Icon } from "@iconify/react";
import { Box, InputBase, Typography } from "@mui/material";
import { useState } from "react";
import { useIntl } from "react-intl";
import AppLayout from "../../components/Layout";
import MassOfferTable from "../../components/Masses/MassOffer/MassofferTable";
import MassOfferMenu from "../../components/Menus/MassOfferMenu";



export default function MassOffer() {
    const { formatMessage } = useIntl()
    const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null);
    return (
        <AppLayout>
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
                    {formatMessage({ id: 'listOfMassSupply' })}
                </Typography>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    alignItems: 'center',
                    columnGap: 1
                }}>
                    <Icon icon={searchIcon} fontSize={20} />
                    <InputBase
                        placeholder={formatMessage({ id: 'search' })}
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
                    >
                        {formatMessage({ id: 'filter' })}
                    </Typography>
                </Box>
            </Box>
            <MassOfferTable />
        </AppLayout>
    );
}
