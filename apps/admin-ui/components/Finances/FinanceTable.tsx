import { theme } from "@easy-messe/libs/theme";
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useIntl } from "react-intl";


enum paymentType {
    orange = 'OM',
    mtn = 'MOMO',
    card = 'CARD',
}
interface TableData {
    id: number;
    amount: number;
    paymentType: paymentType;
    date: string;
    status: string;
    transactionId: string;
}
export default function FinanceTable() {
    const { formatNumber } = useIntl()
    const titles = ['amount', 'numero de payement', 'date', 'status', 'transaction id#']
    const tableData: TableData[] = [
        {
            id: 1,
            amount: 2000,
            paymentType: paymentType.mtn,
            date: '12-01-2023',
            status: 'valide',
            transactionId: 'JDUFL25461UBHS'
        },
        {
            id: 2,
            amount: 1000,
            paymentType: paymentType.orange,
            date: '12-01-2023',
            status: 'echec',
            transactionId: 'JDUFL25461UBHS'
        },
        {
            id: 3,
            amount: 2000,
            paymentType: paymentType.card,
            date: '12-01-2023',
            status: 'valide',
            transactionId: 'JDUFL25461UBHS'
        },
    ]
    const showTransactionStatus = (label: string) => {
        switch (label) {
            case 'valide':
                return (
                    <Typography sx={{
                        bgcolor: 'rgba(92, 179, 96, 0.15)',
                        color: 'var(--success)',
                        width: 'fit-content',
                        borderRadius: '20px',
                        padding: 1,
                        fontWeight: 'bold',
                    }}>
                        {label}
                    </Typography>
                )
            case 'echec':
                return (
                    <Typography sx={{
                        bgcolor: 'rgba(199, 0, 0, 0.15)',
                        color: 'var(--error)',
                        width: 'fit-content',
                        borderRadius: '20px',
                        padding: 1,
                        fontWeight: 'bold',
                    }}>
                        {label}
                    </Typography>
                )
        }
    }
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell sx={{
                        bgcolor: theme.palette.secondary.main
                    }}>
                        No
                    </TableCell>
                    {titles.map((title, index) => (
                        <TableCell sx={{
                            bgcolor: theme.palette.secondary.main
                        }}
                            key={index}
                        >
                            {title.toUpperCase()}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {tableData.map(({
                    id, amount, paymentType,
                    date, status, transactionId
                }, index) => (
                    <TableRow
                        key={`${index} + ${paymentType} + ${id}`}
                        sx={{
                            color: 'var(--label)'
                        }}
                    >
                        <TableCell>{id}</TableCell>
                        <TableCell sx={{
                            fontWeight: 600,
                            color: 'var(--label)'
                        }}>{formatNumber(amount, { style: 'currency', currency: 'xaf' })}</TableCell>
                        <TableCell>{paymentType}</TableCell>
                        <TableCell>{date}</TableCell>
                        <TableCell>
                            {showTransactionStatus(status)}
                        </TableCell>
                        <TableCell>{transactionId}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
