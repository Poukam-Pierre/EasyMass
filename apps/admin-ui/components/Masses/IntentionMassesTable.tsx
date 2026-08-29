import { theme } from "@easy-messe/libs/theme";
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { Icon } from "@iconify/react";
import warningIcon from '@iconify-icons/fluent/warning-24-regular';

export interface MassIntentionRow {
    massOrderId: string;
    intension: string;
    price: number;
    currency: string;
    createdAt: string;
    orderByBeliever: { fullName: string };
}

export default function IntentionMassesTable({
    intentions
}: {
    intentions: MassIntentionRow[]
}) {
    const { formatMessage, formatDate, formatNumber } = useIntl()
    const titles: string[] = ['applicant', 'massIntention', 'amount', 'date']

    return (
        <>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ bgcolor: theme.palette.secondary.main, fontWeight: 600 }}>No</TableCell>
                        {titles.map((title, index) => (
                            <TableCell
                                key={index}
                                sx={{
                                    bgcolor: theme.palette.secondary.main,
                                    fontWeight: 600
                                }}
                            >
                                {formatMessage({ id: title }).toUpperCase()}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {intentions.map(({ massOrderId, intension, price, currency, createdAt, orderByBeliever }, index) => (
                        <TableRow key={massOrderId} sx={{ color: 'var(--label)' }}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{orderByBeliever.fullName}</TableCell>
                            <TableCell>{intension}</TableCell>
                            <TableCell>{formatNumber(price, { style: 'currency', currency: currency.toLowerCase() })}</TableCell>
                            <TableCell>{formatDate(createdAt)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {
                !intentions.length && (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '50%',
                        padding: '40px 0'
                    }}>
                        <Icon icon={warningIcon} fontSize={24} />
                        <Typography variant='body2'>
                            {formatMessage({ id: 'noIntentionMass' })}
                        </Typography>
                    </Box>
                )
            }
        </>

    );
}
