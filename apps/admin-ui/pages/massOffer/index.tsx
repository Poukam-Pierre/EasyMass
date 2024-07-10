import checkmarkIcon from '@iconify-icons/fluent/checkmark-circle-24-regular';
import filterIcon from '@iconify-icons/fluent/filter-24-regular';
import searchIcon from '@iconify-icons/fluent/search-24-regular';
import { Icon } from "@iconify/react";
import { Box, InputBase, Typography } from "@mui/material";
import { useState } from "react";
import { useIntl } from "react-intl";
import MassOfferTable from "../../components/Masses/MassOffer/MassofferTable";
import MassMenu, { MenuItem } from '../../components/Menus/MassMenu';


export default function MassOffer() {
    const { formatMessage } = useIntl()
    const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null);
    const menuItem: MenuItem[] = [
        {
            title: formatMessage({ id: 'year' }),
            icon: checkmarkIcon
        },
        {
            title: formatMessage({ id: 'month' }),
            icon: checkmarkIcon
        },
        {
            title: formatMessage({ id: 'week' }),
            icon: checkmarkIcon
        }
    ]

    return (
        <>
            <MassMenu
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                menuItem={menuItem}
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
        </>
    );
}
