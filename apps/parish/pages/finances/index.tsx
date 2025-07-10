import checkmarkIcon from '@iconify-icons/fluent/checkmark-circle-24-regular';
import filterIcon from '@iconify-icons/fluent/filter-24-regular';
import searchIcon from '@iconify-icons/fluent/search-24-regular';
import { Icon } from "@iconify/react";
import { Box, Button, InputBase, Typography } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import FinanceTable from "../../components/Finances/FinanceTable";
import MassMenu, { MenuItem } from "../../components/Menus/MassMenu";
import { EasyMassAdminLayout } from '@easy-messe/shared-ui';
import AppLayout from '../../components/Layout';



export default function Finances() {
    const { formatNumber, formatMessage } = useIntl()
    const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null);
    const [amountReceived, setAmountReceived] = useState<number>(0);

    const menuItem: MenuItem[] = [
        {
            title: 'Valide',
            icon: checkmarkIcon
        },
        {
            title: 'Echec',
            icon: checkmarkIcon
        },
        {
            title: 'MOMO',
            icon: checkmarkIcon
        },
        {
            title: 'OM',
            icon: checkmarkIcon
        },
        {
            title: 'CARD',
            icon: checkmarkIcon
        }
    ]
    useEffect(() => (
        // TODO fetch data amount received.
        setAmountReceived(0)
    ), [])
    return (
        <>
            <MassMenu
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                menuItem={menuItem}
            />

            <Box>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '50px'
                }}>
                    <Box>
                        <Typography
                            variant='body2'
                        >
                            {formatMessage({ id: 'cashRegister' })}
                        </Typography>
                        <Typography
                            variant="h1"
                        >
                            {formatNumber(amountReceived, { style: 'currency', currency: 'xaf' })}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        disabled
                    >
                        {formatMessage({ id: 'withdrawal' })}
                    </Button>
                </Box>
                <Box sx={{
                    border: '1px solid var(--line)',
                    borderRadius: '10px'
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 1,
                        padding: '0 16px'
                    }}>
                        <Typography
                            variant='h3'
                            color='primary'
                            sx={{
                                padding: '10px 0'
                            }}
                        >

                            {formatMessage({ id: 'transactionHistory' })}
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
                    <FinanceTable />
                </Box>
            </Box>
        </>
    );
}

Finances.getLayout = function getLayout(page: ReactNode) {
    return (
        <EasyMassAdminLayout>
            <AppLayout>
                {page}
            </AppLayout>
        </EasyMassAdminLayout>
    );
};