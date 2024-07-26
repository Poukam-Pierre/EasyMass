import { theme } from "@easy-messe/libs/theme";
import { Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { TableMassOwnerData } from "./tableMassOwnerData";
import { Icon } from "@iconify/react";
import downloadIcon from '@iconify-icons/material-symbols/download';
import warningIcon from '@iconify-icons/fluent/warning-24-regular';



export default function IntentionMassesTable({
    massDateTime
}: {
    massDateTime: TableMassOwnerData[]
}) {
    const { formatMessage } = useIntl()
    const titles: string[] = ['dateOfMass', 'massTimes', 'actions']

    return (
        <>
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
                                align="center"
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
                    {massDateTime.map(({
                        id, dayOfMass, massTime,
                    }, index) => (
                        <TableRow
                            key={`${index} + ${id} + ${dayOfMass}`}
                            sx={{
                                color: 'var(--label)'
                            }}
                        >
                            <TableCell>{id}</TableCell>
                            <TableCell
                                align="center"
                            >
                                {dayOfMass?.format('L')}
                            </TableCell>
                            <TableCell align="center"
                            >
                                {massTime && massTime.format('HH:mm')}
                            </TableCell>

                            <TableCell
                                align='center'
                            >
                                <IconButton
                                    size="small"
                                >
                                    <Icon icon={downloadIcon} fontSize={20} />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {
                !massDateTime.length && (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '50%'
                    }}>
                        <Icon icon={warningIcon} fontSize={24} />
                        <Typography variant='body2'>
                            Aucune demande de messes reçu pour le moment.
                        </Typography>
                    </Box>
                )
            }
        </>

    );
}
