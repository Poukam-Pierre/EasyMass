import { Icon } from "@iconify/react";
import {
    Box,
    InputBase,
    Table,
    Typography,
    IconButton,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@mui/material";
import searchIcon from '@iconify-icons/fluent/search-24-regular';
import refreshIcon from '@iconify-icons/material-symbols/refresh';
import { useIntl } from "react-intl";
import { theme } from "@easy-messe/libs/theme";
import verticalDotsIcon from '@iconify-icons/ph/dots-three-outline-vertical-fill'



export interface ParishData {
    name: string;
    city: string;
    email: string;
    contact: string;

}

export default function ParishesTable({
    parishDataTable
}: {
    parishDataTable: ParishData[]
}) {
    const { formatMessage } = useIntl()

    const titles: string[] = ['name', 'city', 'email', 'contact', 'action']
    return (
        <>
            <Box sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                width: 'fit-content',
                columnGap: 2
            }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    alignItems: 'center',
                    columnGap: 0.5,
                    cursor: 'pointer',
                }}
                >
                    <Icon icon={refreshIcon} fontSize={20} />
                    <Typography
                        variant='body2'
                    >
                        Reload
                    </Typography>
                </Box>

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    alignItems: 'center',
                    columnGap: 0.5
                }}>
                    <Icon icon={searchIcon} fontSize={20} />
                    <InputBase
                        placeholder={formatMessage({ id: 'search' })}
                    />
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
                    {parishDataTable.map(({
                        name, city,
                        email, contact
                    }, index) => (
                        <TableRow
                            key={`${index} + ${contact}`}
                            sx={{
                                color: 'var(--label)'
                            }}
                        >
                            <TableCell sx={{
                                fontWeight: 600,
                                color: 'var(--label)'
                            }}>{name}</TableCell>
                            <TableCell sx={{
                                fontWeight: 600,
                                color: 'var(--label)'
                            }}>
                                {city}
                            </TableCell>
                            <TableCell sx={{
                                fontWeight: 600,
                                color: 'var(--label)'
                            }}>{email}</TableCell>
                            <TableCell sx={{
                                fontWeight: 600,
                                color: 'var(--label)'
                            }}>{contact}</TableCell>
                            <TableCell align='right'>
                                <IconButton
                                    size="small"
                                >
                                    <Icon icon={verticalDotsIcon} fontSize={18} />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

        </>

    );
}
