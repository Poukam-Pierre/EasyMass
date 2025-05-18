import { theme } from "@easy-messe/libs/theme";
import editIcon from '@iconify-icons/fluent/edit-28-regular';
import searchIcon from '@iconify-icons/fluent/search-24-regular';
import refreshIcon from '@iconify-icons/material-symbols/refresh';
import verticalDotsIcon from '@iconify-icons/ph/dots-three-outline-vertical-fill';
import trashIcon from '@iconify-icons/ph/trash-light';
import { Icon, IconifyIcon } from "@iconify/react";
import {
    Box,
    IconButton,
    InputBase,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { MouseEvent, useState } from "react";
import { useIntl } from "react-intl";
import ParishTableMenu from "../Menu/ParishTableMenu";
import ParishesDialog, { CitiesDto } from "./Dialog/Parishes";
import CancelParishDialog from "./Dialog/CancelParish";


export interface ParishData {
    id: number;
    name: string;
    city: CitiesDto;
    email: string;
    contact: string;
    leadName: string;
    balance?: number;
    createdAt?: string;

}

export interface MenuItems {
    title: string;
    icon: IconifyIcon;
    color?: string;
}

interface ParishTableProps {
    parishDataTable: ParishData[],
    reload: () => void
}
export default function ParishesTable({
    parishDataTable,
    reload
}: ParishTableProps) {
    const { formatMessage } = useIntl()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [idSelected, setIdSelected] = useState<number | undefined>();
    const [isOpenDialogModif, setIsOpenDialogModif] = useState<boolean>(false);
    const [isOpenDialogDelete, setIsOpenDialogDelete] = useState<boolean>(false);
    const [parishSelected, setParishSelected] = useState<ParishData>(parishDataTable[0]);


    const titles: string[] = ['name', 'cities', 'email', 'contact', 'balance(xaf)', 'action']

    const handleActionOnRow = (event: MouseEvent<HTMLElement>, id: number) => {
        setAnchorEl(event.currentTarget);
        setIdSelected(id)
    }

    const handleParishshModif = () => {
        setIsOpenDialogModif(true);
        setParishSelected(parishDataTable.find(
            (data) => data.id === idSelected) as ParishData)
    }
    const handleCancelClose = () => {
        setIsOpenDialogDelete((prev) => !prev)
    }

    const menuItem: MenuItems[] = [
        {
            title: formatMessage({ id: 'modify' }),
            icon: editIcon
        },
        {
            title: formatMessage({ id: 'delete' }),
            icon: trashIcon,
            color: 'var(--error)'
        },
    ]


    return (
        <>
            <ParishTableMenu
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                menuItem={menuItem}
                handleModify={handleParishshModif}
                handleCancel={handleCancelClose}
            />
            <ParishesDialog
                title={formatMessage({ id: 'parishModify' })}
                labelBtn={formatMessage({ id: 'save' })}
                isOpen={isOpenDialogModif}
                handleClose={() => setIsOpenDialogModif(false)}
                parishData={parishSelected}
                usage="MODIFICATION"
            />
            <CancelParishDialog
                isOpen={isOpenDialogDelete}
                handleClose={handleCancelClose}
                idSelected={idSelected}
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
                    onClick={reload}
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
                    {/* TODO: Set up search buttom over parish name. */}
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
                        name, city, id,
                        email, contact, balance
                    }, index) => (
                        <TableRow
                            key={`${index} + ${contact}`}
                            sx={{
                                color: 'var(--label)'
                            }}
                        >
                            <TableCell>
                                <Typography sx={{
                                    width: '300px',
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
                                {city.city_name}
                            </TableCell>
                            <TableCell sx={{
                                fontWeight: 600,
                                color: 'var(--label)'
                            }}>{email}</TableCell>
                            <TableCell sx={{
                                fontWeight: 600,
                                color: 'var(--label)'
                            }}>{contact}</TableCell>
                            <TableCell align="center"
                                sx={{
                                    fontWeight: 600,
                                    color: 'var(--label)'
                                }}>{balance}</TableCell>
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
