import checkmarkIcon from '@iconify-icons/fluent/checkmark-circle-24-regular';
import filterIcon from '@iconify-icons/fluent/filter-24-regular';
import searchIcon from '@iconify-icons/fluent/search-24-regular';
import { Icon } from "@iconify/react";
import { Box, Button, InputBase, Typography } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import MassesDialog from "../../components/Masses/Dialogs/Masses";
import MassOwnerTable, { TableMassOwnerData } from "../../components/Masses/tableMassOwnerData";
import MassMenu, { MenuItem } from "../../components/Menus/MassMenu";
import { EasyMassAdminLayout } from '@easy-messe/shared-ui';
import AppLayout from '../../components/Layout';
import dayjs from 'dayjs';


export default function Masses() {
    const { formatMessage } = useIntl()
    const [isOpenModify, setIsOpenModify] = useState<boolean>(false)
    const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null);
    const [massData, setMassData] = useState<TableMassOwnerData[]>([])
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

    const tableData: TableMassOwnerData[] = [
        {
            id: 1,
            dayOfMass: dayjs('2024-07-22'),
            massTime: dayjs(),
            massType: 'unique',
            price: 2000
        },
        {
            id: 2,
            dayOfMass: dayjs('2024-07-15'),
            massTime: dayjs(),
            massType: 'unique',
            price: 5000
        },
        {
            id: 3,
            dayOfMass: null,
            massTime: null,
            massType: 'triduum',
            price: 3000
        },
    ]

    useEffect(() => (
        // TODO fetch data for all masses ordered into the church.
        setMassData(tableData)
    ), [])

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
                handleClose={handleMassCreationDialog}
            />
            <Box sx={{
                padding: '0 16px 8px'
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
                </Box>
            </Box>
            <MassOwnerTable massDataTable={massData} />
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