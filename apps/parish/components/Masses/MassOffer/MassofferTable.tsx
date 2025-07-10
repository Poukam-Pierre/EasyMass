import { theme } from "@easy-messe/libs/theme";
import { Icon } from "@iconify/react";
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import warningIcon from '@iconify-icons/fluent/warning-24-regular';

export interface TableData {
    id: number;
    name: string;
    registrationDate: string;
    massType: string;
    startDate: string;
    endDate: string;
    status: string
}

export default function MassOfferTable({
    massDataTable
}: {
    massDataTable: TableData[]
}) {
    const titles = ['name', 'registrationDate', 'massType', 'startDate', 'endDate', 'status']
    const { formatMessage } = useIntl()
    return !massDataTable.length ? (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70%'
        }}>
            <Icon icon={warningIcon} fontSize={24} />
            <Typography variant='body2'>
                {formatMessage({ id: 'noProcessMass' })}
            </Typography>
        </Box>
    ) : (

        <Table>
            <TableHead>
                <TableRow>
                    <TableCell sx={{
                        bgcolor: theme.palette.secondary.main,
                        fontWeight: 600
                    }}
                    >
                        No
                    </TableCell>
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
                {massDataTable?.map(({
                    id, name, registrationDate,
                    massType, startDate, endDate,
                    status
                }, index) => (
                    <TableRow
                        key={`${index} + ${id} + ${name}`}
                        sx={{
                            color: 'var(--label)'
                        }}
                    >
                        <TableCell>{id}</TableCell>
                        <TableCell sx={{
                            fontWeight: 600,
                            color: 'var(--label)'
                        }}>
                            {name}
                        </TableCell>
                        <TableCell>{registrationDate}</TableCell>
                        <TableCell>{massType}</TableCell>
                        <TableCell>{startDate}</TableCell>
                        <TableCell>{endDate}</TableCell>
                        <TableCell>{status}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
