import { theme } from "@easy-messe/libs/theme";
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useIntl } from "react-intl";

export default function MassesStatTable({ statistics }: Record<string, object>) {
    const { formatMessage, formatNumber } = useIntl()
    const titles = ['period', 'massNumber', 'amount']

    return (
        <>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 1

            }}>
                <Typography
                    variant='h3'
                    color='primary'
                    sx={{
                        paddingBottom: 0
                    }}
                >
                    {formatMessage({ id: 'massStatistics' })}
                </Typography>
            </Box>
            <Table>
                <TableHead>
                    <TableRow>
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
                    {Object.entries(statistics).map(([date, { massNumber, amount }], index) => (
                        <TableRow
                            key={`${index} + ${date}`}
                            sx={{
                                color: 'var(--label)'
                            }}
                        >
                            <TableCell>{dayjs(date, "DD/MM/YYYY").format("MMMM")}</TableCell>
                            <TableCell sx={{
                                fontWeight: 600,
                                color: 'var(--label)'
                            }}>
                                {massNumber}
                            </TableCell>
                            <TableCell>{
                                formatNumber(amount,
                                    {
                                        style: 'currency',
                                        currency: 'xaf'
                                    })}
                            </TableCell>
                        </TableRow>

                    ))}
                </TableBody>
            </Table>
        </>

    );
}
