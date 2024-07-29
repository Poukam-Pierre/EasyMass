import checkmarkIcon from '@iconify-icons/fluent/checkmark-circle-24-regular';
import filterIcon from '@iconify-icons/fluent/filter-24-regular';
import searchIcon from '@iconify-icons/fluent/search-24-regular';
import { Icon } from "@iconify/react";
import { Box, InputBase, Typography } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import MassOfferTable, { TableData } from "../../components/Masses/MassOffer/MassofferTable";
import MassMenu, { MenuItem } from '../../components/Menus/MassMenu';
import AppLayout from '../../components/Layout';
import { EasyMassAdminLayout } from '@easy-messe/shared-ui';



export default function MassOffer() {
    const { formatMessage } = useIntl()
    const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null);
    const [massDate, setMassData] = useState<TableData[]>([])
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
    const tableDate: TableData[] = [
        {
            id: 1,
            name: 'Meulak Kouam',
            registrationDate: '2015-01-01',
            massType: 'single',
            startDate: '2015-01-01',
            endDate: '2015-01-01',
            status: '1/1'
        },
        {
            id: 2,
            name: 'Ngamaleu Pierre',
            registrationDate: '2015-01-01',
            massType: 'Tridum',
            startDate: '2015-01-01',
            endDate: '2015-01-01',
            status: '1/2'
        },
        {
            id: 3,
            name: 'Poukam irénée',
            registrationDate: '2015-01-01',
            massType: 'Neuvaine',
            startDate: '2015-01-01',
            endDate: '2015-01-01',
            status: '1/9'
        }
    ]

    useEffect(() => (
        // TODO fetch data for all masses ordered into the church.
        setMassData(tableDate)
    ), [])
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
                        size='small'
                    />
                </Box>
            </Box>
            <MassOfferTable massDataTable={massDate} />
        </>
    );
}

MassOffer.getLayout = function getLayout(page: ReactNode) {
    return (
        <EasyMassAdminLayout>
            <AppLayout>
                {page}
            </AppLayout>
        </EasyMassAdminLayout>
    );
};