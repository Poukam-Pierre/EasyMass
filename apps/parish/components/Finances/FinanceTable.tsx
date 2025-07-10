import { theme } from "@easy-messe/libs/theme";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { showTransactionStatus } from '@easy-messe/shared-ui'


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
    const { formatNumber, formatMessage } = useIntl()
    const titles = ['amount', 'paymentMethod', 'date', 'status', 'transactionId']
    const [dataTransactions, setDataTransactions] = useState<TableData[]>([])
    const tableData: TableData[] = [
        {
            id: 1,
            amount: 2000,
            paymentType: paymentType.mtn,
            date: '12-01-2023',
            status: 'done',
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
            status: 'in process',
            transactionId: 'JDUFL25461UBHS'
        },
    ]

    useEffect(() => (
        // TODO fetch data for transactions or transfert.
        setDataTransactions(tableData)
    ), [])


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
                {dataTransactions.map(({
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
