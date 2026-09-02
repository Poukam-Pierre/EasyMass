import searchIcon from '@iconify-icons/fluent/search-24-regular';
import { Icon } from "@iconify/react";
import { Box, InputBase, Typography } from "@mui/material";
import dayjs from 'dayjs';
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import MassOwnerTable, { TableMassOwnerData } from "../../components/Masses/tableMassOwnerData";
import ParishSelector, { ParishOption } from "../../components/ParishSelector";
import { withAdminLayout } from "../../components/withAdminLayout";
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
    const [parish, setParish] = useState<ParishOption | null>(null)
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
            <Box sx={{
                padding: '0 16px 8px'
            }}>
                <Box>
                    <Typography
                        variant="h3"
                        color='primary'
                        sx={{
                            paddingBottom: 0
                        }}
                    >
                        {formatMessage({ id: 'listOfMasses' })}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--body)' }}>
                        {formatMessage({ id: 'massesCreateHint' })}
                    </Typography>
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridAutoFlow: 'column',
                    width: 'fit-content',
                    columnGap: 3,
                    alignItems: 'center',
                    paddingTop: '16px'
                }}>
                    <ParishSelector value={parish} onChange={setParish} />
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
            {parish ? (
                <MassOwnerTable massDataTable={filteredMassData} parishId={parish.parishId} onChanged={loadMasses} />
            ) : (
                <Typography variant="body2" sx={{ color: 'var(--body)', textAlign: 'center', padding: '40px' }}>
                    {formatMessage({ id: 'selectParishPrompt' })}
                </Typography>
            )}
        </>
    );
}

Masses.getLayout = function getLayout(page: ReactNode) {
    return withAdminLayout(page);
};
