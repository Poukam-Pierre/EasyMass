import { EasyMassAdminLayout } from "@easy-messe/shared-ui";
import AppLayout from "../../components/Layout";
import { ReactNode, useEffect, useState } from "react";
import { Box, Button, CircularProgress, Grid, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { Icon } from "@iconify/react";
import editIcon from '@iconify-icons/fluent/edit-28-regular';
import { useRouter } from "next/router";
import MassesStatTable from "./MassesStatTable";
import ParishesDialog from "../../components/Parishes/Dialog/Parishes";
import { ParishData } from "../../components/Parishes/ParishesTables";
import { apiMiddleware, errorHandling } from "@easy-messe/libs/utils";
import { useRouter as Router } from 'next/navigation'

interface ParishStatistics {
    parishInfo: ParishData,
    statistics: Record<string, object>
}
export default function ParishOverview() {
    const staticData: string[] = ['name', 'city', 'Email', 'Responsable', 'phoneNumber', 'balance']
    const { formatMessage, formatNumber } = useIntl()
    const [parishData, setParishData] = useState<ParishStatistics>()
    const { query: { parishId } } = useRouter()
    const [isOpenDialogModif, setIsOpenDialogModif] = useState<boolean>(false);
    const [isPending, setIsPending] = useState<boolean>(false);
    const { push } = Router()

    const fetchMassDetails = async () => {
        setIsPending(true);
        const token = localStorage.getItem('token')
        if (!token) {
            push('/login')
            return
        }
        if (!parishId)
            return

        await apiMiddleware({
            url: `/parishes/${parishId}`,
            method: 'GET',
            accessToken: token,
            onSuccess: (response: any) => {
                setParishData(response);
                console.log(response);
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
        fetchMassDetails();
    }, [parishId])


    if (isPending) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '80%',
                    p: 4,
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <ParishesDialog
                title={formatMessage({ id: 'parishModify' })}
                labelBtn={formatMessage({ id: 'save' })}
                isOpen={isOpenDialogModif}
                handleClose={() => setIsOpenDialogModif(false)}
                parishData={parishData?.parishInfo}
                usage="MODIFICATION"
                reload={fetchMassDetails}
            />

            <Box sx={{
                display: 'grid',
                gap: 2
            }}>
                <Box sx={{
                    display: 'grid',
                    gridAutoFlow: 'column',
                    alignItems: 'center',
                    justifyContent: "flex-start",
                    columnGap: 5
                }}>
                    <Typography
                        variant="h4"
                        color="primary"
                        sx={{
                            letterSpacing: 0,
                            paddingBottom: 0,
                        }}

                    >
                        {formatMessage({ id: 'parishInformations' })}
                    </Typography>
                    <Button
                        startIcon={
                            <Icon icon={editIcon} fontSize={10} />
                        }
                        variant="outlined"
                        size="small"
                        sx={{
                            color: 'var(--body)',
                            borderColor: 'var(--line)',
                            borderRadius: '30px',
                            padding: '5px'
                        }}
                        onClick={() => setIsOpenDialogModif(true)}
                    >
                        {formatMessage({ id: 'edit' })}

                    </Button>
                </Box>
                <Grid
                    container
                    spacing={7}
                    direction="row"
                    sx={{
                        width: 'fit-content',
                    }}
                >
                    <Grid item>
                        {staticData.map((element, index) => (
                            <Typography
                                key={index}
                                variant="body2"
                                paddingBottom='20px'
                            >
                                {formatMessage({ id: element })} :
                            </Typography>
                        ))}
                    </Grid>
                    <Grid item>
                        {parishData && Object
                            .values(parishData.parishInfo)
                            .slice(1)
                            .map((value, index) => (
                                <Typography
                                    variant="h5"
                                    color="var(--body)"
                                    paddingBottom='20px'
                                    key={index}
                                >
                                    {typeof value === 'number'
                                        ? formatNumber(value ?? 0, {
                                            style: 'currency',
                                            currency: 'xaf'
                                        }) : typeof value !== 'string'
                                            ? value.city_name : value}
                                </Typography>
                            ))}
                    </Grid>
                </Grid>
            </Box >
            {parishData && Object.values(parishData.statistics).length !== 0 && (
                <MassesStatTable statistics={parishData.statistics} />
            )}
        </>
    );
}


ParishOverview.getLayout = function getLayout(page: ReactNode) {
    return (
        <EasyMassAdminLayout>
            <AppLayout>
                {page}
            </AppLayout>
        </EasyMassAdminLayout>
    );
};