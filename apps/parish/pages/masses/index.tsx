import { DateRangeFilter, DEFAULT_PAGE_SIZE, dateRangeParams } from "@easy-messe/shared-ui";
import { Box, Button, TablePagination, Typography } from "@mui/material";
import dayjs, { Dayjs } from 'dayjs';
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
    const [total, setTotal] = useState<number>(0)
    const [page, setPage] = useState<number>(0)
    const [dateFrom, setDateFrom] = useState<Dayjs | null>(null)
    const [dateTo, setDateTo] = useState<Dayjs | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const loadMasses = () => {
        if (!parish) return
        setIsLoading(true)
        api.get('/masses/paginated', {
            params: {
                parishId: parish.parishId,
                page: page + 1,
                limit: DEFAULT_PAGE_SIZE,
                ...dateRangeParams(dateFrom, dateTo),
            }
        })
            .then(({ data }: { data: { data: MassApiRow[]; total: number } }) => {
                setMassData(data.data.map((row) => ({
                    id: row.massId,
                    dayOfMass: dayjs(row.startAt),
                    massTime: dayjs(row.startAt),
                    massType: row.massType,
                    price: row.price,
                    estimatedDurationMinutes: row.estimatedDurationMinutes,
                    status: row.status.toLowerCase(),
                })));
                setTotal(data.total)
            })
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
            .finally(() => setIsLoading(false));
    }

    useEffect(loadMasses, [parish, page, dateFrom, dateTo]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleClearFilters = () => {
        setPage(0)
        setDateFrom(null)
        setDateTo(null)
    }

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
                    flexWrap: 'wrap',
                    rowGap: 2
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
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: '16px'
                }}>
                    <DateRangeFilter
                        from={dateFrom}
                        to={dateTo}
                        onFromChange={(value) => { setPage(0); setDateFrom(value) }}
                        onToChange={(value) => { setPage(0); setDateTo(value) }}
                        onClear={handleClearFilters}
                    />
                </Box>
            </Box>
            {isLoading ? (
                <Typography variant="body2" sx={{ padding: '0 16px' }}>
                    {formatMessage({ id: 'loading' })}
                </Typography>
            ) : (
                <>
                    <MassOwnerTable massDataTable={massData} onChanged={loadMasses} />
                    <TablePagination
                        component="div"
                        count={total}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        rowsPerPage={DEFAULT_PAGE_SIZE}
                        rowsPerPageOptions={[DEFAULT_PAGE_SIZE]}
                    />
                </>
            )}
        </>
    );
}

Masses.getLayout = function getLayout(page: ReactNode) {
    return withParishLayout(page);
};
