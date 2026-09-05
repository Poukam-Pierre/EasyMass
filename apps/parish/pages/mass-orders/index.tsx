import { theme } from "@easy-messe/libs/theme";
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import { withParishLayout } from "../../components/withParishLayout";
import api, { apiErrorMessage } from "../../lib/api";

interface MassOrderRow {
    massOrderId: string;
    intension: string;
    price: number;
    currency: string;
    createdAt: string;
    mass: { massId: string; startAt: string; massType: string };
    orderByBeliever: { fullName: string; phone: string | null };
}

export default function MassOrders() {
    const { formatMessage, formatDate, formatNumber } = useIntl()
    const { push } = useRouter()
    const [orders, setOrders] = useState<MassOrderRow[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        api.get('/mass-order/active')
            .then(({ data }) => setOrders(data.data))
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
            .finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Box sx={{ display: 'grid', rowGap: 3 }}>
            <Typography variant="h2" color="primary" sx={{ paddingBottom: 0 }}>
                {formatMessage({ id: 'massRequest' })}
            </Typography>
            {isLoading ? (
                <Typography variant="body2">{formatMessage({ id: 'loading' })}</Typography>
            ) : (
            <Table>
                <TableHead>
                    <TableRow>
                        {['applicant', 'massIntention', 'amount', 'dateOfMass', 'massType', 'date'].map((key) => (
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
                            <TableCell>{formatNumber(order.price, { style: 'currency', currency: order.currency.toLowerCase() })}</TableCell>
                            <TableCell>{formatDate(order.mass.startAt)}</TableCell>
                            <TableCell>{order.mass.massType}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                        </TableRow>
                    ))}
                    {orders.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} sx={{ color: 'var(--body)' }}>
                                {formatMessage({ id: 'noProcessMass' })}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            )}
        </Box>
    );
}

MassOrders.getLayout = function getLayout(page: ReactNode) {
    return withParishLayout(page);
};
