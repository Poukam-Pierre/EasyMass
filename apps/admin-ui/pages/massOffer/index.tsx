import { apiMiddleware, errorHandling } from '@easy-messe/libs/utils';
import { EasyMassAdminLayout } from '@easy-messe/shared-ui';
import checkmarkIcon from '@iconify-icons/fluent/checkmark-circle-24-regular';
import { Box, CircularProgress, Typography } from "@mui/material";
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import AppLayout from '../../components/Layout';
import MassOfferTable, { TableData } from "../../components/Masses/MassOffer/MassofferTable";
import MassMenu, { MenuItem } from '../../components/Menus/MassMenu';



export default function MassOffer() {
    const { formatMessage } = useIntl()
    const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null);
    const [massDate, setMassData] = useState<TableData[]>([])
    const [isMassRequestPending, setIsMassRequestPending] = useState<boolean>(false);

    const { push } = useRouter()
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

    useEffect(() => {
        const fetchMassRequested = async () => {
            setIsMassRequestPending(true);
            const token = localStorage.getItem('token');
            if (!token) {
                push('/login')
                return
            };
            apiMiddleware({
                url: '/mass-order',
                method: 'GET',
                accessToken: token,
                onSuccess: (response: any) => {
                    setMassData(response.data);
                },
                onFailure: (error) => {
                    errorHandling({ error, formatMessage, redirect: push })
                },
                onFinally: () => {
                    setIsMassRequestPending(false)
                }
            })
        };
        fetchMassRequested();
    }, [])
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
            </Box>
            {isMassRequestPending ?
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '70%'
                }}>
                    <CircularProgress size={40} />
                </Box> :
                <MassOfferTable massDataTable={massDate} />
            }
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