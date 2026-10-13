import churchIcon from '@iconify-icons/ph/church';
import handCoinsIcon from '@iconify-icons/ph/hand-coins';
import bankIcon from '@iconify-icons/ph/bank';
import checkCircleIcon from '@iconify-icons/ph/check-circle';
import { Box, Chip, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import StatTile from "../components/Dashboard/StatTile";
import { withParishLayout } from "../components/withParishLayout";
import api, { apiErrorMessage } from "../lib/api";

interface PriestSummary {
    priestId: string;
    firstName: string;
    secondName: string;
    available: boolean;
}

interface ParishDashboard {
    massesCreatedCount: number;
    massesByStatus: { status: string; count: number }[];
    moneyEarned: number;
    moneyWithdrawn: number;
    intentionsTreatedCount: number;
    priests: PriestSummary[];
}

const statusColor: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
    OPEN: 'success',
    CLOSED: 'warning',
    PROCESSING: 'info',
    COMPLETED: 'default',
};

export default function Dashboard() {
    const { formatMessage, formatNumber } = useIntl()
    const { push } = useRouter()
    const [data, setData] = useState<ParishDashboard | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        api.get('/parishes/me/dashboard')
            .then(({ data }) => setData(data))
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
            .finally(() => setIsLoading(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Box sx={{ display: 'grid', rowGap: '32px' }}>
            <Typography variant="h2" color="primary" sx={{ paddingBottom: 0 }}>
                {formatMessage({ id: 'dashboard' })}
            </Typography>

            {isLoading ? (
                <Typography variant="body2">{formatMessage({ id: 'loading' })}</Typography>
            ) : (
                <>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '16px' }}>
                        <StatTile
                            label={formatMessage({ id: 'massesCreatedCount' })}
                            value={String(data?.massesCreatedCount ?? 0)}
                            icon={churchIcon}
                            accentColor="#026DA9"
                        />
                        <StatTile
                            label={formatMessage({ id: 'moneyEarned' })}
                            value={formatNumber(data?.moneyEarned ?? 0, { style: 'currency', currency: 'xaf' })}
                            icon={handCoinsIcon}
                            accentColor="#5CB360"
                        />
                        <StatTile
                            label={formatMessage({ id: 'moneyWithdrawn' })}
                            value={formatNumber(data?.moneyWithdrawn ?? 0, { style: 'currency', currency: 'xaf' })}
                            icon={bankIcon}
                            accentColor="#F59300"
                        />
                        <StatTile
                            label={formatMessage({ id: 'intentionsTreatedCount' })}
                            value={String(data?.intentionsTreatedCount ?? 0)}
                            icon={checkCircleIcon}
                            accentColor="#026DA9"
                        />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '24px' }}>
                        <Box sx={{ border: '1px solid var(--line)', borderRadius: '12px', padding: '20px' }}>
                            <Typography variant="h4">{formatMessage({ id: 'massesByStatus' })}</Typography>
                            {(data?.massesByStatus ?? []).length === 0 ? (
                                <Typography variant="body2" sx={{ color: 'var(--body)' }}>
                                    {formatMessage({ id: 'noDataYet' })}
                                </Typography>
                            ) : (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, paddingTop: '12px' }}>
                                    {(data?.massesByStatus ?? []).map((row) => (
                                        <Chip
                                            key={row.status}
                                            color={statusColor[row.status] ?? 'default'}
                                            label={`${row.status}: ${row.count}`}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                        <Box sx={{ border: '1px solid var(--line)', borderRadius: '12px', padding: '20px' }}>
                            <Typography variant="h4">{formatMessage({ id: 'priests' })}</Typography>
                            <Table size="small">
                                <TableBody>
                                    {(data?.priests ?? []).slice(0, 5).map((priest) => (
                                        <TableRow
                                            key={priest.priestId}
                                            hover
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => push('/priests')}
                                        >
                                            <TableCell>{priest.firstName} {priest.secondName}</TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    size="small"
                                                    color={priest.available ? 'success' : 'default'}
                                                    label={formatMessage({ id: priest.available ? 'priestAvailable' : 'priestUnavailable' })}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(data?.priests ?? []).length === 0 && (
                                        <TableRow>
                                            <TableCell sx={{ color: 'var(--body)' }}>
                                                {formatMessage({ id: 'noDataYet' })}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
}

Dashboard.getLayout = function getLayout(page: ReactNode) {
    return withParishLayout(page);
};
