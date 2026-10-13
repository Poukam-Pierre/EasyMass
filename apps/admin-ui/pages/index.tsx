import handCoinsIcon from '@iconify-icons/ph/hand-coins';
import percentIcon from '@iconify-icons/ph/percent';
import bankIcon from '@iconify-icons/ph/bank';
import churchIcon from '@iconify-icons/ph/church';
import checkCircleIcon from '@iconify-icons/ph/check-circle';
import warningCircleIcon from '@iconify-icons/ph/warning-circle';
import { Box, Divider, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useRouter } from "next/router";
import RevenueChart from "../components/Dashboard/RevenueChart";
import StatTile from "../components/Dashboard/StatTile";
import { withAdminLayout } from "../components/withAdminLayout";
import api, { apiErrorMessage } from "../lib/api";
import { toast } from "react-toastify";

interface MoneyOverview {
    totalParishIncome: number;
    totalPlatformFeeRevenue: number;
    totalWithdrawn: number;
    revenueByMonth: { month: string; amount: number }[];
}

interface ParishOverview {
    totalParishes: number;
    activeParishes: number;
    blockedParishes: number;
    parishesByCity: { cityName: string; count: number }[];
    topParishesByMassesCreated: { parishId: string; name: string; massCount: number }[];
    topParishesByIncome: { parishId: string; name: string; totalIncome: number }[];
    recentlyOnboarded: { parishId: string; name: string; createdAt: string }[];
}

export default function Dashboard() {
    const { formatMessage, formatNumber, formatDate } = useIntl()
    const { push } = useRouter()
    const [money, setMoney] = useState<MoneyOverview | null>(null)
    const [parishes, setParishes] = useState<ParishOverview | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        Promise.all([
            api.get('/admin/dashboard/money-overview'),
            api.get('/admin/dashboard/parish-overview'),
        ])
            .then(([moneyRes, parishRes]) => {
                setMoney(moneyRes.data)
                setParishes(parishRes.data)
            })
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
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', columnGap: '16px' }}>
                        <StatTile
                            label={formatMessage({ id: 'totalParishIncome' })}
                            value={formatNumber(money?.totalParishIncome ?? 0, { style: 'currency', currency: 'xaf' })}
                            icon={handCoinsIcon}
                            accentColor="#026DA9"
                        />
                        <StatTile
                            label={formatMessage({ id: 'platformFeeRevenue' })}
                            value={formatNumber(money?.totalPlatformFeeRevenue ?? 0, { style: 'currency', currency: 'xaf' })}
                            icon={percentIcon}
                            accentColor="#5CB360"
                        />
                        <StatTile
                            label={formatMessage({ id: 'totalWithdrawn' })}
                            value={formatNumber(money?.totalWithdrawn ?? 0, { style: 'currency', currency: 'xaf' })}
                            icon={bankIcon}
                            accentColor="#F59300"
                        />
                        <StatTile
                            label={formatMessage({ id: 'totalParishes' })}
                            value={String(parishes?.totalParishes ?? 0)}
                            icon={churchIcon}
                            accentColor="#026DA9"
                        />
                        <StatTile
                            label={formatMessage({ id: 'activeParishes' })}
                            value={String(parishes?.activeParishes ?? 0)}
                            icon={checkCircleIcon}
                            accentColor="#5CB360"
                        />
                        <StatTile
                            label={formatMessage({ id: 'blockedParishes' })}
                            value={String(parishes?.blockedParishes ?? 0)}
                            icon={warningCircleIcon}
                            accentColor="#DD0303"
                        />
                    </Box>

                    <Box sx={{ border: '1px solid var(--line)', borderRadius: '12px', padding: '20px' }}>
                        <Typography variant="h4">{formatMessage({ id: 'revenueByMonth' })}</Typography>
                        <RevenueChart data={money?.revenueByMonth ?? []} />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '24px' }}>
                        <Box sx={{ border: '1px solid var(--line)', borderRadius: '12px', padding: '20px' }}>
                            <Typography variant="h4">{formatMessage({ id: 'topParishesByIncome' })}</Typography>
                            <RankedList
                                rows={(parishes?.topParishesByIncome ?? []).map((p) => ({
                                    id: p.parishId,
                                    label: p.name,
                                    value: formatNumber(p.totalIncome, { style: 'currency', currency: 'xaf' }),
                                }))}
                                onRowClick={(id) => push(`/parishes/${id}`)}
                            />
                        </Box>
                        <Box sx={{ border: '1px solid var(--line)', borderRadius: '12px', padding: '20px' }}>
                            <Typography variant="h4">{formatMessage({ id: 'topParishesByMasses' })}</Typography>
                            <RankedList
                                rows={(parishes?.topParishesByMassesCreated ?? []).map((p) => ({
                                    id: p.parishId,
                                    label: p.name,
                                    value: String(p.massCount),
                                }))}
                                onRowClick={(id) => push(`/parishes/${id}`)}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '24px' }}>
                        <Box sx={{ border: '1px solid var(--line)', borderRadius: '12px', padding: '20px' }}>
                            <Typography variant="h4">{formatMessage({ id: 'recentlyOnboarded' })}</Typography>
                            <Table size="small">
                                <TableBody>
                                    {(parishes?.recentlyOnboarded ?? []).map((p) => (
                                        <TableRow
                                            key={p.parishId}
                                            hover
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => push(`/parishes/${p.parishId}`)}
                                        >
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell align="right" sx={{ color: 'var(--body)' }}>
                                                {formatDate(p.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(parishes?.recentlyOnboarded ?? []).length === 0 && (
                                        <TableRow>
                                            <TableCell sx={{ color: 'var(--body)' }}>
                                                {formatMessage({ id: 'noDataYet' })}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                        <Box sx={{ border: '1px solid var(--line)', borderRadius: '12px', padding: '20px' }}>
                            <Typography variant="h4">{formatMessage({ id: 'parishesByCity' })}</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{formatMessage({ id: 'city' })}</TableCell>
                                        <TableCell align="right">{formatMessage({ id: 'parishes' })}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(parishes?.parishesByCity ?? []).map((row) => (
                                        <TableRow key={row.cityName}>
                                            <TableCell>{row.cityName}</TableCell>
                                            <TableCell align="right">{row.count}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
}

function RankedList({ rows, onRowClick }: { rows: { id: string; label: string; value: string }[]; onRowClick: (id: string) => void }) {
    const { formatMessage } = useIntl()
    if (rows.length === 0) {
        return <Typography variant="body2" sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'noDataYet' })}</Typography>
    }
    return (
        <Box sx={{ display: 'grid', rowGap: '4px' }}>
            {rows.map((row, index) => (
                <Box key={row.id}>
                    {index > 0 && <Divider />}
                    <Box
                        onClick={() => onRowClick(row.id)}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '10px 4px',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'var(--line)' }
                        }}
                    >
                        <Typography variant="body2">{index + 1}. {row.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.value}</Typography>
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

Dashboard.getLayout = function getLayout(page: ReactNode) {
    return withAdminLayout(page);
};
