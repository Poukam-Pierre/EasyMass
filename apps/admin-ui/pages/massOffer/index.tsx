import { DateRangeFilter, DEFAULT_PAGE_SIZE, dateRangeParams } from "@easy-messe/shared-ui";
import { Box, TablePagination, Typography } from "@mui/material";
import { Dayjs } from "dayjs";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import IntentionMassesTable, { MassIntentionRow } from "../../components/Masses/IntentionMassesTable";
import MassSelector, { MassOption } from "../../components/MassSelector";
import ParishSelector, { ParishOption } from "../../components/ParishSelector";
import { withAdminLayout } from "../../components/withAdminLayout";
import api, { apiErrorMessage } from "../../lib/api";

// GET /masses/:massId/intentions/paginated and the mass detail page's own
// intentions table call the exact same backend method
// (MassOrderService.findPaginatedMassOrderByMass) — this page is just a
// different entry point into the same data: browse by parish → mass
// instead of drilling in from a specific mass's row.
export default function MassOffer() {
    const { formatMessage } = useIntl()
    const [parish, setParish] = useState<ParishOption | null>(null)
    const [mass, setMass] = useState<MassOption | null>(null)
    const [orders, setOrders] = useState<MassIntentionRow[]>([])
    const [total, setTotal] = useState<number>(0)
    const [page, setPage] = useState<number>(0)
    const [dateFrom, setDateFrom] = useState<Dayjs | null>(null)
    const [dateTo, setDateTo] = useState<Dayjs | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (!mass) { setOrders([]); setTotal(0); return }
        setIsLoading(true)
        api.get(`/masses/${mass.massId}/intentions/paginated`, {
            params: {
                page: page + 1,
                limit: DEFAULT_PAGE_SIZE,
                ...dateRangeParams(dateFrom, dateTo),
            }
        })
            .then(({ data }) => { setOrders(data.data); setTotal(data.total) })
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
            .finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mass, page, dateFrom, dateTo])

    const handleClearFilters = () => {
        setPage(0)
        setDateFrom(null)
        setDateTo(null)
    }

    return (
        <>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                rowGap: 2,
                marginBottom: 2

            }}>
                <Typography
                    variant='h3'
                    color='primary'
                    sx={{
                        paddingBottom: 0
                    }}
                >
                    {formatMessage({ id: 'listOfMassSupply' })}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <ParishSelector value={parish} onChange={(p) => { setParish(p); setMass(null); }} />
                    <MassSelector parishId={parish?.parishId ?? null} value={mass} onChange={setMass} />
                    {mass && (
                        <DateRangeFilter
                            from={dateFrom}
                            to={dateTo}
                            onFromChange={(value) => { setPage(0); setDateFrom(value) }}
                            onToChange={(value) => { setPage(0); setDateTo(value) }}
                            onClear={handleClearFilters}
                        />
                    )}
                </Box>
            </Box>
            {mass ? (
                isLoading ? (
                    <Typography variant="body2" sx={{ color: 'var(--body)', textAlign: 'center', padding: '40px' }}>
                        {formatMessage({ id: 'loading' })}
                    </Typography>
                ) : (
                    <>
                        <IntentionMassesTable intentions={orders} />
                        <TablePagination
                            component="div"
                            count={total}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            rowsPerPage={DEFAULT_PAGE_SIZE}
                            rowsPerPageOptions={[DEFAULT_PAGE_SIZE]}
                        />
                    </>
                )
            ) : (
                <Typography variant="body2" sx={{ color: 'var(--body)', textAlign: 'center', padding: '40px' }}>
                    {formatMessage({ id: 'selectMassPrompt' })}
                </Typography>
            )}
        </>
    );
}

MassOffer.getLayout = function getLayout(page: ReactNode) {
    return withAdminLayout(page);
};
