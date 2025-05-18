import { Box, CircularProgress, Typography } from "@mui/material";
import { EasyMassAdminLayout } from "@easy-messe/shared-ui";
import AppLayout from "../../components/Layout";
import { ReactNode, useEffect, useState } from "react";
import FinancialTableParishes, { FinanceParish } from "../../components/Masses/FinancialTableParishes";
import { useIntl } from "react-intl";
import { apiMiddleware, errorHandling } from "@easy-messe/libs/utils";
import { useRouter } from "next/navigation";


export default function Masses() {
    const [parishData, setParishData] = useState<FinanceParish[]>([]);
    const { formatMessage } = useIntl();
    const { push } = useRouter()
    const [isPending, setIsPending] = useState<boolean>(false);


    const fetchParishWithMass = async () => {
        setIsPending(true);
        const token = localStorage.getItem('token')
        if (!token) {
            push('/login')
            return
        }
        await apiMiddleware({
            url: '/parishes/masses',
            method: 'GET',
            accessToken: token,
            onSuccess: (response: any) => {
                setParishData(response.data);
            },
            onFailure: (error) => {
                errorHandling({ error, formatMessage, redirect: push })
            },
            onFinally: () => {
                setIsPending(false)
            }
        })
    }
    useEffect(() => {
        fetchParishWithMass()
    }, [])

    return (
        <>
            <Box sx={{
                padding: '0 16px 40px 0'
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <Typography
                        variant="h3"
                        color='primary'
                        sx={{
                            paddingBottom: 0
                        }}
                    >
                        {formatMessage({ id: 'parishAndmassInfo' })}
                    </Typography>
                </Box>
            </Box>
            {isPending ? (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '70%'
                }}>
                    <CircularProgress size={40} />
                </Box>
            ) : parishData && parishData.length !== 0 ? (
                <FinancialTableParishes
                    financeParishData={parishData}
                    reload={fetchParishWithMass}
                />
            ) : (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '70%'
                }}>
                    <Typography variant="h4">
                        {formatMessage({ id: 'noMass' })}
                    </Typography>
                </Box>
            )}
        </>
    );
}

Masses.getLayout = function getLayout(page: ReactNode) {
    return (
        <EasyMassAdminLayout>
            <AppLayout>
                {page}
            </AppLayout>
        </EasyMassAdminLayout>
    );
};