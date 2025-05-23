/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiMiddleware, errorHandling } from '@easy-messe/libs/utils';
import { EasyMassAdminLayout } from '@easy-messe/shared-ui';
import { TableMassOwnerData } from '@easyMesseLibs/types';
import checkmarkIcon from '@iconify-icons/fluent/checkmark-circle-24-regular';
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import AppLayout from '../../components/Layout';
import MassesDialog from "../../components/Masses/Dialogs/Masses";
import MassOwnerTable from "../../components/Masses/tableMassOwnerData";
import MassMenu, { MenuItem } from "../../components/Menus/MassMenu";

export default function Masses() {
    const { formatMessage } = useIntl()
    const [isOpenModify, setIsOpenModify] = useState<boolean>(false)
    const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null);
    const [massData, setMassData] = useState<TableMassOwnerData[]>([])
    const [isMassPending, setIsMassPending] = useState<boolean>(false);
    const { push } = useRouter();

    const menuItem: MenuItem[] = [
        {
            title: formatMessage({ id: 'day' }),
            icon: checkmarkIcon
        },
        {
            title: formatMessage({ id: 'hour' }),
            icon: checkmarkIcon
        },
        {
            title: formatMessage({ id: 'massType' }),
            icon: checkmarkIcon
        }
    ]

    const fetchMasses = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            push('/')
            return
        };
        setIsMassPending(true);
        apiMiddleware({
            url: '/masses',
            method: 'GET',
            accessToken: token,
            onSuccess: (response: any) => {
                console.log(response);
                setMassData(response.masses)
            },
            onFailure: (error) => {
                errorHandling({ error, formatMessage, redirect: push })
            },
            onFinally: () => {
                setIsMassPending(false)
            }
        })
    }
    useEffect(() => {
        fetchMasses();
    }, [])

    const handleMassCreationDialog = () => {
        setIsOpenModify((prev) => !prev)
    }
    return (
        <>
            <MassMenu
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                menuItem={menuItem}
            />
            <MassesDialog
                title={formatMessage({ id: 'createMass' })}
                replicatLabel={formatMessage({ id: 'duplicateAll' })}
                labelBtn={formatMessage({ id: 'create' })}
                isOpen={isOpenModify}
                handleClose={() => {
                    handleMassCreationDialog();
                    fetchMasses()
                }
                }
            />
            <Box sx={{
                padding: '0 16px 16px'
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
                        {formatMessage({ id: 'listOfMasses' })}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleMassCreationDialog}
                    >
                        + {formatMessage({ id: 'addMass' })}
                    </Button>
                </Box>
            </Box>
            {
                isMassPending ?
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '70%'
                    }}>
                        <CircularProgress size={40} />
                    </Box> :
                    <MassOwnerTable massDataTable={massData} />
            }

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