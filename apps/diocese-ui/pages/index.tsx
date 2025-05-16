
import { EasyMassAdminLayout } from "@easy-messe/shared-ui";
import { Box, Button, Typography } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import ParishesDialog from "../components/Parishes/Dialog/Parishes";
import ParishesTable, { ParishData } from "../components/Parishes/ParishesTables";
import AppLayout from "../components/Layout";



export default function Index() {
    const { formatMessage } = useIntl()
    const [parishData, setParishData] = useState<ParishData[]>([])
    const [isOpenCreate, setIsOpenCreate] = useState<boolean>(false)


    const parishesData: ParishData[] = [
        {
            id: 1,
            name: 'Saint Paul Apôtre',
            city: 'Bangangté',
            email: 'saintp@gmail.com',
            contact: '+237 680 090 489',
            leadName: 'Père tata',
        },
        {
            id: 2,
            name: 'Marie Reine des apôtres de Kamtop',
            city: 'Bafoussam',
            email: 'marier@gmail.com',
            contact: '+237 680 090 489',
            leadName: 'Père toto',
        },
        {
            id: 3,
            name: 'Immaculée Conception de la Vierge Marie de Briqueterie',
            city: 'Bangangté',
            email: 'notred@gmail.com',
            contact: '+237 680 090 489',
            leadName: 'Père titi',
        },
    ]

    const handleParishCreationDialog = () => {
        setIsOpenCreate((prev) => !prev)
    }

    useEffect(() => {
        setParishData(parishesData)
    }, [])

    return (
        <>
            <ParishesDialog
                title={formatMessage({ id: 'createParish' })}
                labelBtn={formatMessage({ id: 'create' })}
                isOpen={isOpenCreate}
                handleClose={handleParishCreationDialog}
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
            <ParishesTable parishDataTable={parishData} />
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