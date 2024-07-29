import { Icon } from "@iconify/react";
import { Box, InputBase, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import filterIcon from '@iconify-icons/fluent/filter-24-regular';
import searchIcon from '@iconify-icons/fluent/search-24-regular';
import { theme } from "@easy-messe/libs/theme";
import warningIcon from '@iconify-icons/fluent/warning-24-regular';
import { useEffect, useState } from "react";
import { Dayjs } from "dayjs";

interface StatisticsData {
    label: string;
    number: number;
    amount: number;
}
export default function MassesStatTable() {
    const { formatMessage, formatNumber } = useIntl()
    const titles = ['period', 'massNumber', 'amount']
    const [statData, setStatData] = useState<StatisticsData[]>([])

    const statisticsData: StatisticsData[] = [
        {
            label: 'January',
            number: 30,
            amount: 60000
        },
        {
            label: 'February',
            number: 150,
            amount: 300000
        },
        {
            label: 'Mars',
            number: 100,
            amount: 200000
        },
    ]
    useEffect(() => (
        // TODO Fetch data table from api corresponding to masses orders, total amount and the occurences
        setStatData(statisticsData)
    ), [])
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
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    alignItems: 'center',
                    columnGap: 1
                }}>
                    <Icon icon={searchIcon} fontSize={20} />
                    <InputBase
                        placeholder={formatMessage({ id: 'search' })}
                    />
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    alignItems: 'center',
                    columnGap: 1,
                    cursor: 'pointer',
                }}
                >
                    <Icon icon={filterIcon} fontSize={20} />
                    <Typography
                        variant='body2'
                    >
                        {formatMessage({ id: 'filter' })}
                    </Typography>
                </Box>
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
                    {statData.map(({
                        label, number, amount
                    }, index) => (
                        <TableRow
                            key={`${index} + ${label}`}
                            sx={{
                                color: 'var(--label)'
                            }}
                        >
                            <TableCell>{label}</TableCell>
                            <TableCell sx={{
                                fontWeight: 600,
                                color: 'var(--label)'
                            }}>
                                {number}
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
            {
                !statData.length && (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '50%'
                    }}>
                        <Icon icon={warningIcon} fontSize={24} />
                        <Typography variant='body2'>
                            Aucune statistique disponible.
                            {/* {formatMessage({ id: 'noProcessMass' })} */}
                        </Typography>
                    </Box>
                )
            }

        </>

    );
}
