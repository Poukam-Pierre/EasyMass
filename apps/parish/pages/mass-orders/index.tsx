import { theme } from "@easy-messe/libs/theme";
import { DateRangeFilter, DEFAULT_PAGE_SIZE, dateRangeParams } from "@easy-messe/shared-ui";
import { Box, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import { Dayjs } from "dayjs";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import { withParishLayout } from "../../components/withParishLayout";
import api, { apiErrorMessage } from "../../lib/api";

interface MassOrderRow {
    massOrderId: string;
    intension: string;
    createdAt: string;
    mass: { massId: string; startAt: string; massType: string };
    orderByBeliever: { fullName: string; phone: string | null };
}

export default function MassOrders() {
    const { formatMessage, formatDate } = useIntl()
    const { push } = useRouter()
    const [orders, setOrders] = useState<MassOrderRow[]>([])
    const [total, setTotal] = useState<number>(0)
    const [page, setPage] = useState<number>(0)
    const [dateFrom, setDateFrom] = useState<Dayjs | null>(null)
    const [dateTo, setDateTo] = useState<Dayjs | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        setIsLoading(true)
        api.get('/mass-order/active', {
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
    }, [page, dateFrom, dateTo])

    const handleClearFilters = () => {
        setPage(0)
        setDateFrom(null)
        setDateTo(null)
    }

    return (
        <Box sx={{ display: 'grid', rowGap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 2 }}>
                <Typography variant="h2" color="primary" sx={{ paddingBottom: 0 }}>
                    {formatMessage({ id: 'massRequest' })}
                </Typography>
                <DateRangeFilter
                    from={dateFrom}
                    to={dateTo}
                    onFromChange={(value) => { setPage(0); setDateFrom(value) }}
                    onToChange={(value) => { setPage(0); setDateTo(value) }}
                    onClear={handleClearFilters}
                />
            </Box>
            {isLoading ? (
                <Typography variant="body2">{formatMessage({ id: 'loading' })}</Typography>
            ) : (
            <>
            <Table>
                <TableHead>
                    <TableRow>
                        {['applicant', 'massIntention', 'dateOfMass', 'massType', 'date'].map((key) => (
                            <TableCell key={key} sx={{ bgcolor: theme.palette.secondary.main, fontWeight: 600 }}>
                                {formatMessage({ id: key }).toUpperCase()}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow
                            key={order.massOrderId}
                            hover
                            sx={{ cursor: 'pointer' }}
                            onClick={() => push(`/masses/${order.mass.massId}`)}
                        >
                            <TableCell sx={{ fontWeight: 600 }}>{order.orderByBeliever.fullName}</TableCell>
                            <TableCell>{order.intension}</TableCell>
                            <TableCell>{formatDate(order.mass.startAt)}</TableCell>
                            <TableCell>{order.mass.massType}</TableCell>
                            <TableCell>{formatDate(order.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                        </TableRow>
                    ))}
                    {orders.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} sx={{ color: 'var(--body)' }}>
                                {formatMessage({ id: 'noProcessMass' })}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
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
        </Box>
    );
}

MassOrders.getLayout = function getLayout(page: ReactNode) {
    return withParishLayout(page);
};
