import { EasyMassAdminLayout } from "@easy-messe/shared-ui";
import calendarIcon from '@iconify-icons/material-symbols/calendar-month-outline';
import { Icon } from "@iconify/react";
import { Box, Button, Typography } from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import AppLayout from "../../components/Layout";
import IntentionMassesTable from "../../components/Masses/IntentionMassesTable";
import { TableMassOwnerData } from "../../components/Masses/tableMassOwnerData";

export default function Historics() {
    const [massDateTime, setMassDateTime] = useState<TableMassOwnerData[]>([])

    const { query: { massesId } } = useRouter()

    const tableData: TableMassOwnerData[] = [
        {
            id: 1,
            dayOfMass: dayjs('2024-07-22'),
            massTime: dayjs(),
            massType: 'unique',
            price: 2000,
            status: 'done'
        },
        {
            id: 2,
            dayOfMass: dayjs('2024-07-20'),
            massTime: dayjs(),
            massType: 'unique',
            price: 3500,
            status: 'in process',
        },
        {
            id: 3,
            dayOfMass: dayjs('2024-07-19'),
            massTime: dayjs(),
            massType: 'unique',
            price: 2500,
            status: 'locked',
        },
    ]

    useEffect(() => (
        // TODO: Fetch data from API using ID for masses created between
        //  the actual date and the date of the mass creation.
        setMassDateTime(tableData)
    ), [massesId])

    return (
        <>
            <Box sx={{
                display: 'grid',
                rowGap: 5
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
                        Intention de messe
                        {/* {formatMessage({ id: 'listOfMasses' })} */}
                    </Typography>
                    <Button
                        variant="contained"
                    >
                        Download All
                        {/* + {formatMessage({ id: 'addMass' })} */}
                    </Button>
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridAutoFlow: 'column',
                    width: 'fit-content',
                    columnGap: 3
                }}>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        alignItems: 'center',
                        columnGap: 1,
                        marginBottom: 1
                    }}
                    >
                        <Icon icon={calendarIcon} fontSize={24} />
                        <DesktopDatePicker
                            label='Rechercher'
                            closeOnSelect
                            slotProps={{
                                textField: {
                                    size: 'small'
                                }
                            }}
                        />
                    </Box>
                </Box>
            </Box>
            <IntentionMassesTable
                massDateTime={massDateTime}
            />
        </>

    );
}

Historics.getLayout = function getLayout(page: ReactNode) {
    return (
        <EasyMassAdminLayout>
            <AppLayout>
                {page}
            </AppLayout>
        </EasyMassAdminLayout>
    );
};