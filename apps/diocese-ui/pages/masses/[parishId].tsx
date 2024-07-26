import { EasyMassAdminLayout } from "@easy-messe/shared-ui";
import AppLayout from "../../components/Layout";
import { ReactNode, useEffect, useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { Icon } from "@iconify/react";
import editIcon from '@iconify-icons/fluent/edit-28-regular';
import { useRouter } from "next/router";
import MassesStatTable from "./MassesStatTable";
import ParishesDialog from "../../components/Parishes/Dialog/Parishes";
import { ParishData } from "../../components/Parishes/ParishesTables";

export default function ParishOverview() {
    const staticData: string[] = ['name', 'city', 'Email', 'Responsable', 'phoneNumber']
    const { formatMessage } = useIntl()
    const [parishData, setParishData] = useState<ParishData>()
    const { query: { parishId } } = useRouter()
    const [isOpenDialogModif, setIsOpenDialogModif] = useState<boolean>(false);

    const parishinfo: ParishData = {
        id: 1,
        name: 'Saint Paul Apôtre',
        city: 'Bangangté',
        email: 'saintp@gmail.com',
        contact: '+237 680 090 489',
        leadName: 'Père tata',
    }
    useEffect(() => (
        // TODA Fetch data from API according to a specific parish
        setParishData(parishinfo)
    ), [parishId])

    return (
        <>
            <ParishesDialog
                title={formatMessage({ id: 'parishModify' })}
                labelBtn={formatMessage({ id: 'save' })}
                isOpen={isOpenDialogModif}
                handleClose={() => setIsOpenDialogModif(false)}
                parishData={parishData}
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
                        Informations Personnelles
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
                        Edit
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
                            .values(parishData)
                            .slice(1)
                            .map((value, index) => (
                                <Typography
                                    variant="h5"
                                    color="var(--body)"
                                    paddingBottom='20px'
                                    key={index}
                                >
                                    {value}
                                </Typography>
                            ))}
                    </Grid>
                </Grid>
            </Box >
            <MassesStatTable />
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