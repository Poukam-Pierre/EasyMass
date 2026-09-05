import { theme } from "@easy-messe/libs/theme";
import {
    Box, Button, Chip, Divider, Switch, Tab, Table, TableBody, TableCell,
    TableHead, TableRow, Tabs, TextField, Typography
} from "@mui/material";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import { withAdminLayout } from "../../components/withAdminLayout";
import api, { apiErrorMessage } from "../../lib/api";

interface ParishDetailData {
    parishId: string;
    name: string;
    phone: string;
    managerName: string;
    createdAt: string;
    isBlocked: boolean;
    payoutBlocked: boolean;
    payoutNumber: string | null;
    city_id: string;
}

interface City { city_id: string; city_name: string }
interface MassRow { massId: string; price: number; startAt: string; status: string; massType: string }
interface PriestRow { priestId: string; firstName: string; secondName: string; phoneNumber: string; available: boolean }
interface TransactionRow {
    transactionId: string; createdAt: string; amount: number; balanceAfter: number;
    transactionType: string; payment: { paymentMethod: string; status: string; currency: string } | null;
}

export default function ParishDetail() {
    const { query, push } = useRouter()
    const parishId = typeof query.parishId === 'string' ? query.parishId : undefined
    const { formatMessage, formatDate, formatNumber } = useIntl()
    const [tab, setTab] = useState<number>(0)
    const [parish, setParish] = useState<ParishDetailData | null>(null)
    const [cities, setCities] = useState<City[]>([])
    const [masses, setMasses] = useState<MassRow[] | null>(null)
    const [priests, setPriests] = useState<PriestRow[] | null>(null)
    const [transactions, setTransactions] = useState<TransactionRow[] | null>(null)
    const [isTabLoading, setIsTabLoading] = useState<boolean>(false)

    useEffect(() => {
        if (!parishId) return
        api.get(`/parishes/${parishId}`)
            .then(({ data }) => setParish(data))
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))));
        api.get('/cities').then(({ data }) => setCities(data)).catch(() => undefined);
    }, [parishId, formatMessage])

    useEffect(() => {
        if (!parishId) return
        if (tab === 1 && masses === null) {
            setIsTabLoading(true)
            api.get('/masses', { params: { parishId } })
                .then(({ data }) => setMasses(data))
                .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
                .finally(() => setIsTabLoading(false));
        }
        if (tab === 2 && priests === null) {
            setIsTabLoading(true)
            api.get('/priest', { params: { parishId } })
                .then(({ data }) => setPriests(data))
                .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
                .finally(() => setIsTabLoading(false));
        }
        if (tab === 3 && transactions === null) {
            setIsTabLoading(true)
            api.get('/transactions', { params: { parishId } })
                .then(({ data }) => setTransactions(data))
                .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
                .finally(() => setIsTabLoading(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, parishId])

    const cityName = cities.find((c) => c.city_id === parish?.city_id)?.city_name ?? '-'

    if (!parish) {
        return <Typography variant="body2">{formatMessage({ id: 'loading' })}</Typography>
    }

    return (
        <Box sx={{ display: 'grid', rowGap: '20px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h2" color="primary" sx={{ paddingBottom: 0 }}>{parish.name}</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--body)' }}>{cityName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                        label={formatMessage({ id: parish.isBlocked ? 'parishBlockedTooltip' : 'parishActiveTooltip' })}
                        color={parish.isBlocked ? 'error' : 'success'}
                        size="small"
                    />
                </Box>
            </Box>

            <Tabs value={tab} onChange={(_, value) => setTab(value)} indicatorColor="primary">
                <Tab label={formatMessage({ id: 'parishInformations' })} />
                <Tab label={formatMessage({ id: 'masses' })} />
                <Tab label={formatMessage({ id: 'priests' })} />
                <Tab label={formatMessage({ id: 'transactionHistory' })} />
            </Tabs>

            {tab === 0 && (
                <OverviewTab parish={parish} onUpdated={setParish} />
            )}

            {tab === 1 && (
                isTabLoading ? (
                    <Typography variant="body2" sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'loading' })}</Typography>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {['dateOfMass', 'massType', 'price', 'status'].map((key) => (
                                    <TableCell key={key} sx={{ bgcolor: theme.palette.secondary.main, fontWeight: 600 }}>
                                        {formatMessage({ id: key }).toUpperCase()}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(masses ?? []).map((mass) => (
                                <TableRow
                                    key={mass.massId}
                                    hover
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => push(`/masses/${mass.massId}`)}
                                >
                                    <TableCell>{formatDate(mass.startAt, { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                                    <TableCell>{mass.massType}</TableCell>
                                    <TableCell>{formatNumber(mass.price, { style: 'currency', currency: 'xaf' })}</TableCell>
                                    <TableCell>{mass.status}</TableCell>
                                </TableRow>
                            ))}
                            {masses?.length === 0 && (
                                <TableRow><TableCell colSpan={4} sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'noDataYet' })}</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                )
            )}

            {tab === 2 && (
                isTabLoading ? (
                    <Typography variant="body2" sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'loading' })}</Typography>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {['name', 'parishPhoneNumber', 'status'].map((key) => (
                                    <TableCell key={key} sx={{ bgcolor: theme.palette.secondary.main, fontWeight: 600 }}>
                                        {formatMessage({ id: key }).toUpperCase()}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(priests ?? []).map((priest) => (
                                <TableRow key={priest.priestId}>
                                    <TableCell>{priest.firstName} {priest.secondName}</TableCell>
                                    <TableCell>{priest.phoneNumber}</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={formatMessage({ id: priest.available ? 'priestAvailable' : 'priestUnavailable' })}
                                            color={priest.available ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {priests?.length === 0 && (
                                <TableRow><TableCell colSpan={3} sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'noDataYet' })}</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                )
            )}

            {tab === 3 && (
                isTabLoading ? (
                    <Typography variant="body2" sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'loading' })}</Typography>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {['date', 'action', 'amount', 'cashRegister'].map((key) => (
                                    <TableCell key={key} sx={{ bgcolor: theme.palette.secondary.main, fontWeight: 600 }}>
                                        {formatMessage({ id: key }).toUpperCase()}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(transactions ?? []).map((transaction) => (
                                <TableRow key={transaction.transactionId}>
                                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                                    <TableCell>{transaction.transactionType}</TableCell>
                                    <TableCell sx={{ color: transaction.amount < 0 ? 'var(--error)' : 'var(--success)', fontWeight: 600 }}>
                                        {formatNumber(transaction.amount, { style: 'currency', currency: 'xaf' })}
                                    </TableCell>
                                    <TableCell>{formatNumber(transaction.balanceAfter, { style: 'currency', currency: 'xaf' })}</TableCell>
                                </TableRow>
                            ))}
                            {transactions?.length === 0 && (
                                <TableRow><TableCell colSpan={4} sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'noDataYet' })}</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                )
            )}
        </Box>
    );
}

function OverviewTab({ parish, onUpdated }: { parish: ParishDetailData; onUpdated: (p: ParishDetailData) => void }) {
    const { formatMessage } = useIntl()
    const [name, setName] = useState(parish.name)
    const [phone, setPhone] = useState(parish.phone)
    const [managerName, setManagerName] = useState(parish.managerName)
    const [payoutNumber, setPayoutNumber] = useState(parish.payoutNumber ?? '')
    const [isSaving, setIsSaving] = useState(false)
    const [isTogglingPayout, setIsTogglingPayout] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const { data } = await api.patch(`/parishes/${parish.parishId}`, { name, phone, managerName });
            if (payoutNumber !== (parish.payoutNumber ?? '')) {
                await api.patch(`/parishes/${parish.parishId}/payout-method`, { payoutNumber });
            }
            onUpdated({ ...data, payoutNumber });
            toast.success(formatMessage({ id: 'saved' }));
        } catch (error) {
            toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
        } finally {
            setIsSaving(false)
        }
    }

    const handleTogglePayoutBlock = async () => {
        setIsTogglingPayout(true)
        try {
            const { data } = await api.patch(`/parishes/${parish.parishId}/payout-block`, { payoutBlocked: !parish.payoutBlocked });
            onUpdated({ ...parish, payoutBlocked: data.payoutBlocked });
        } catch (error) {
            toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
        } finally {
            setIsTogglingPayout(false)
        }
    }

    return (
        <Box sx={{ display: 'grid', rowGap: 2, maxWidth: '480px' }}>
            <TextField label={formatMessage({ id: 'name' })} size="small" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label={formatMessage({ id: 'leadParishName' })} size="small" value={managerName} onChange={(e) => setManagerName(e.target.value)} />
            <TextField label={formatMessage({ id: 'phoneNumber' })} size="small" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <TextField label={formatMessage({ id: 'payoutNumber' })} size="small" value={payoutNumber} onChange={(e) => setPayoutNumber(e.target.value)} />
            <Button variant="contained" onClick={handleSave} disabled={isSaving} sx={{ width: 'fit-content' }}>
                {formatMessage({ id: isSaving ? 'processing' : 'save' })}
            </Button>
            <Divider />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">{formatMessage({ id: 'payoutBlockToggleTooltip' })}</Typography>
                <Switch checked={!parish.payoutBlocked} onChange={handleTogglePayoutBlock} disabled={isTogglingPayout} />
            </Box>
        </Box>
    );
}

ParishDetail.getLayout = function getLayout(page: ReactNode) {
    return withAdminLayout(page);
};
