import searchIcon from '@iconify-icons/fluent/search-24-regular';
import { Icon } from "@iconify/react";
import { Box, Button, InputBase, Typography } from "@mui/material";
import dayjs from 'dayjs';
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import MassesDialog from "../../components/Masses/Dialogs/Masses";
import MassOwnerTable, { TableMassOwnerData } from "../../components/Masses/tableMassOwnerData";
import { withParishLayout } from "../../components/withParishLayout";
import { useAuth } from "../../contexts/AuthContext";
import api, { apiErrorMessage } from "../../lib/api";

interface MassApiRow {
    massId: string;
    price: number;
    startAt: string;
    estimatedDurationMinutes: number;
    status: string;
    massType: string;
}

export default function Masses() {
    const { formatMessage } = useIntl()
    const { parish } = useAuth()
    const [isOpenCreate, setIsOpenCreate] = useState<boolean>(false)
    const [massData, setMassData] = useState<TableMassOwnerData[]>([])
    const [search, setSearch] = useState<string>('')

    const loadMasses = () => {
        if (!parish) return
        api.get('/masses', { params: { parishId: parish.parishId } })
            .then(({ data }: { data: MassApiRow[] }) => {
                setMassData(data.map((row) => ({
                    id: row.massId,
                    dayOfMass: dayjs(row.startAt),
                    massTime: dayjs(row.startAt),
                    massType: row.massType,
                    price: row.price,
                    estimatedDurationMinutes: row.estimatedDurationMinutes,
                    status: row.status.toLowerCase(),
                })));
            })
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))));
    }

    useEffect(loadMasses, [parish]) // eslint-disable-line react-hooks/exhaustive-deps

    const filteredMassData = search
        ? massData.filter((mass) => mass.massType.toLowerCase().includes(search.toLowerCase()))
        : massData

    return (
        <>
            <MassesDialog
                title={formatMessage({ id: 'createMass' })}
                replicatLabel={formatMessage({ id: 'duplicateAll' })}
                labelBtn={formatMessage({ id: 'create' })}
                isOpen={isOpenCreate}
                handleClose={() => setIsOpenCreate(false)}
                onSaved={loadMasses}
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
                        onClick={() => setIsOpenCreate(true)}
                    >
                        + {formatMessage({ id: 'addMass' })}
                    </Button>
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridAutoFlow: 'column',
                    width: 'fit-content',
                    columnGap: 3,
                    alignItems: 'center',
                    paddingTop: '16px'
                }}>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        alignItems: 'center',
                        columnGap: 1
                    }}>
                        <Icon icon={searchIcon} fontSize={20} />
                        <InputBase
                            placeholder={formatMessage({ id: 'search' })}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </Box>
                </Box>
            </Box>
            <MassOwnerTable massDataTable={filteredMassData} onChanged={loadMasses} />
        </>
    );
}

Masses.getLayout = function getLayout(page: ReactNode) {
    return withParishLayout(page);
};
