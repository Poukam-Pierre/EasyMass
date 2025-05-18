
import { EasyMassAdminLayout } from "@easy-messe/shared-ui";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import ParishesDialog from "../components/Parishes/Dialog/Parishes";
import ParishesTable, { ParishData } from "../components/Parishes/ParishesTables";
import AppLayout from "../components/Layout";
import { useRouter } from "next/navigation";
import { apiMiddleware, errorHandling } from "@easy-messe/libs/utils";



export default function Index() {
    const { formatMessage } = useIntl()
    const [parishData, setParishData] = useState<ParishData[]>()
    const [isOpenCreate, setIsOpenCreate] = useState<boolean>(false)
    const [isParishDataLoading, setIsParishDataLoading] = useState<boolean>(false)
    const { push } = useRouter()

    const handleParishCreationDialog = () => {
        setIsOpenCreate((prev) => !prev)
    }

    const fetchParishes = async () => {
        setIsParishDataLoading(true);
        const token = localStorage.getItem('token')
        if (!token) {
            push('/login')
            return
        }
        await apiMiddleware({
            url: '/parishes',
            method: 'GET',
            accessToken: token,
            onSuccess: (response: any) => {
                setParishData(response.parishes)
            },
            onFailure: (error) => {
                errorHandling({ error, formatMessage, redirect: push })
            },
            onFinally: () => {
                setIsParishDataLoading(false)
            }
        })
    }
    useEffect(() => {
        fetchParishes()
    }, [])

    return (
        <>
            <ParishesDialog
                title={formatMessage({ id: 'createParish' })}
                labelBtn={formatMessage({ id: 'create' })}
                isOpen={isOpenCreate}
                handleClose={handleParishCreationDialog}
                usage="CREATION"
                reload={fetchParishes}
            />
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
                        {formatMessage({ id: 'listOfParish' })}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleParishCreationDialog}
                    >
                        + {formatMessage({ id: 'addParish' })}
                    </Button>
                </Box>
            </Box>
            {isParishDataLoading ? (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '70%'
                }}>
                    <CircularProgress size={40} />
                </Box>
            ) : parishData && parishData.length !== 0 ? (
                <ParishesTable
                    parishDataTable={parishData}
                    reload={fetchParishes}
                />
            ) : (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '70%'
                }}>
                    <Typography variant="h4">
                        {formatMessage({ id: 'noParish' })}
                    </Typography>
                </Box>
            )}
        </>

    );
}

Index.getLayout = function getLayout(page: ReactNode) {
    return (
        <EasyMassAdminLayout>
            <AppLayout>
                {page}
            </AppLayout>
        </EasyMassAdminLayout>
    );
};