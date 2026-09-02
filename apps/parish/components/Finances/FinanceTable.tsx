import { theme } from "@easy-messe/libs/theme";
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useIntl } from "react-intl";

export interface TransactionRow {
    transactionId: string;
    createdAt: string;
    amount: number;
    balanceAfter: number;
    transactionType: 'INCOME' | 'INCOME_REVERSAL' | 'WITHDRAWAL' | 'PLATFORM_FEE' | 'ADMIN_CORRECTION';
    payment: { paymentMethod: string; status: string; currency: string } | null;
}

const statusColor: Record<string, { bg: string; color: string }> = {
    INCOME: { bg: 'rgba(92, 179, 96, 0.15)', color: 'var(--success)' },
    INCOME_REVERSAL: { bg: 'rgba(199, 0, 0, 0.15)', color: 'var(--error)' },
    WITHDRAWAL: { bg: 'rgba(255, 184, 0, 0.3)', color: 'var(--warning)' },
    PLATFORM_FEE: { bg: 'rgba(2, 109, 169, 0.3)', color: 'var(--primary)' },
    ADMIN_CORRECTION: { bg: 'rgba(156, 213, 245, 0.3)', color: 'var(--secondary)' },
};

export const showTransactionStatus = (label: string) => {
    const style = statusColor[label];
    if (!style) return undefined;
    return (
        <Typography sx={{
            bgcolor: style.bg,
            color: style.color,
            width: 'fit-content',
            borderRadius: '20px',
            padding: 1,
            fontWeight: 'bold',
        }}>
            {label}
        </Typography>
    )
}

export default function FinanceTable({ transactions }: { transactions: TransactionRow[] }) {
    const { formatNumber, formatMessage, formatDate } = useIntl()
    const titles = ['action', 'amount', 'paymentMethod', 'date', 'cashRegister']

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell sx={{
                        bgcolor: theme.palette.secondary.main,
                        fontWeight: 600
                    }}>
                        No
                    </TableCell>
                    {titles.map((title, index) => (
                        <TableCell sx={{
                            bgcolor: theme.palette.secondary.main,
                            fontWeight: 600
                        }}
                            key={index}
                        >
                            {formatMessage({ id: title }).toUpperCase()}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {transactions.map(({
                    transactionId, amount, payment,
                    createdAt, transactionType, balanceAfter
                }, index) => (
                    <TableRow
                        key={transactionId}
                        sx={{
                            color: 'var(--label)'
                        }}
                    >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{showTransactionStatus(transactionType)}</TableCell>
                        <TableCell sx={{
                            fontWeight: 600,
                            color: amount < 0 ? 'var(--error)' : 'var(--success)'
                        }}>{formatNumber(amount, { style: 'currency', currency: 'xaf' })}</TableCell>
                        <TableCell>{payment?.paymentMethod ?? '-'}</TableCell>
                        <TableCell>{formatDate(createdAt)}</TableCell>
                        <TableCell>{formatNumber(balanceAfter, { style: 'currency', currency: 'xaf' })}</TableCell>
                    </TableRow>
                ))}
                {transactions.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} sx={{ color: 'var(--body)' }}>
                            {formatMessage({ id: 'noDataYet' })}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
