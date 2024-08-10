import { theme } from "@easy-messe/libs/theme";
import { Icon } from "@iconify/react";
import {
    Box,
    IconButton,
    InputBase,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import { useIntl } from "react-intl";
import verticalDotsIcon from '@iconify-icons/ph/dots-three-outline-vertical-fill';
import { MouseEvent, useState } from "react";
import searchIcon from '@iconify-icons/fluent/search-24-regular';
import refreshIcon from '@iconify-icons/material-symbols/refresh';
import overviewIcon from '@iconify-icons/material-symbols/overview-outline';
import FinancialTableMenu from "../Menu/FinancialTableMenu";


export interface FinanceParish {
    id: number;
    name: string;
    city: string;
    massType: string;
    price: number;
}

export default function FinancialTableParishes({
    financeParishData
}: {
    financeParishData: FinanceParish[]
}) {
    const { formatMessage, formatNumber } = useIntl();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [idSelected, setIdSelected] = useState<number | undefined>();
    const titles: string[] = ['parishes', 'city', 'massType', 'price', 'action'];


    const handleActionOnRow = (event: MouseEvent<HTMLElement>, id: number) => {
        setAnchorEl(event.currentTarget);
        setIdSelected(id)
    }

    return (
        <>
            <FinancialTableMenu
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                menuItem={[
                    {
                        title: 'Stat de Messes.',
                        icon: overviewIcon
                    }
                ]}
                idSelected={idSelected as number}
                parishData={financeParishData.find((data) => data.id === idSelected)}
            />
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
                        {formatMessage({ id: 'reload' })}
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
                    {financeParishData.map(({
                        id, name, city,
                        massType, price
                    }, index) => (
                        <TableRow
                            key={`${index} + ${name}`}
                            sx={{
                                color: 'var(--label)'
                            }}
                        >
                            <TableCell>
                                <Typography sx={{
                                    width: '400px',
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    fontWeight: 600,
                                    color: 'var(--label)'
                                }}>
                                    {name}
                                </Typography>
                            </TableCell>
                            <TableCell sx={{
                                fontWeight: 600,
                                color: 'var(--label)'
                            }}>
                                {city}
                            </TableCell>
                            <TableCell sx={{
                                fontWeight: 600,
                                color: 'var(--label)'
                            }}>{massType}</TableCell>
                            <TableCell sx={{
                                fontWeight: 600,
                                color: 'var(--label)'
                            }}>
                                {formatNumber(price, {
                                    style: 'currency',
                                    currency: 'xaf'
                                })}
                            </TableCell>
                            <TableCell align='right'>
                                <IconButton
                                    size="small"
                                    onClick={(event) => handleActionOnRow(event, id)}
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
