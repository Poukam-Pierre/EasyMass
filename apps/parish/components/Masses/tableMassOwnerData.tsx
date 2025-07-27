import { theme } from "@easy-messe/libs/theme";
import { showTransactionStatus } from "@easy-messe/shared-ui";
import { TableMassOwnerData } from "@easyMesseLibs/types";
import editIcon from '@iconify-icons/fluent/edit-28-regular';
import historyIcon from '@iconify-icons/fluent/history-28-regular';
import warningIcon from '@iconify-icons/fluent/warning-24-regular';
import verticalDotsIcon from '@iconify-icons/ph/dots-three-outline-vertical-fill';
import trashIcon from '@iconify-icons/ph/trash-light';
import { Icon } from "@iconify/react";
import {
    Box,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    Typography
} from "@mui/material";
import dayjs from "dayjs";
import { MouseEvent, useState } from "react";
import { useIntl } from "react-intl";
import { MenuItem } from "../Menus/MassMenu";
import MassOwnerTableMenu from "../Menus/MassOwnerTableMenu";
import CancelMassDialog from "./Dialogs/CanceMass";
import MassesDialog from "./Dialogs/Masses";
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
export interface MenuItemForMassOwner extends MenuItem {
    color?: string
}

export default function MassOwnerTable({
    massDataTable
}: {
    massDataTable: TableMassOwnerData[]
}) {
    const { formatMessage, formatNumber } = useIntl()
    const titles = ['dayOfMass', 'massHour', 'price', 'created_at', 'status', 'action']
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [isMassModify, setIsMassModify] = useState<boolean>(false)
    const [idSelected, setIdSelected] = useState<number | undefined>()
    const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false)
    const [massSelected, setMassSelected] = useState<TableMassOwnerData>()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);


    // Calculate the current page's data
    const currentPageData = massDataTable.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const menuItem: MenuItemForMassOwner[] = [
        {
            title: formatMessage({ id: 'modify' }),
            icon: editIcon
        },
        {
            title: formatMessage({ id: 'history' }),
            icon: historyIcon
        },
        {
            title: formatMessage({ id: 'delete' }),
            icon: trashIcon,
            color: 'var(--error)'
        },
    ]

    const handleActionOnRow = (event: MouseEvent<HTMLElement>, id: number) => {
        setAnchorEl(event.currentTarget);
        setIdSelected(id)
    }
    const handleMassModifyDialog = () => {
        setIsMassModify(true);
        setMassSelected(massDataTable.find((data) => data.id === idSelected))
    }
    const handleCancelClose = () => {
        setIsOpenDelete((prev) => !prev)
    }

    return (
        <>
            <MassOwnerTableMenu
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                handleModify={handleMassModifyDialog}
                handleCancel={handleCancelClose}
                menuItem={menuItem}
                idSelected={idSelected}
            />
            <MassesDialog
                title={formatMessage({ id: 'massModify' })}
                labelBtn={formatMessage({ id: 'modify' })}
                replicatLabel={formatMessage({ id: 'applyAll' })}
                isOpen={isMassModify}
                handleClose={() => setIsMassModify(false)}
                massData={massSelected}
            />
            <CancelMassDialog
                isOpen={isOpenDelete}
                handleClose={handleCancelClose}
                idSelected={idSelected}
            />

            {
                !massDataTable.length ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '70%'
                    }}>
                        <Icon icon={warningIcon} fontSize={24} />
                        <Typography variant='body2'>
                            {formatMessage({ id: 'warningMassCreation' })}
                        </Typography>
                    </Box>
                ) : (
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
                                {currentPageData.map(({
                                    id, dayOfMass,
                                    price, status, createdAt

                                }, index) => (
                                    <TableRow
                                        key={`${index} + ${id} + ${dayOfMass}`}
                                        sx={{
                                            color: 'var(--label)'
                                        }}
                                    >
                                        <TableCell>{id}</TableCell>
                                        <TableCell sx={{
                                            fontWeight: 600,
                                            color: 'var(--label)'
                                        }}>
                                            {dayjs.utc(dayOfMass).format('dddd, MMMM D')}
                                        </TableCell>
                                        <TableCell>{dayjs(dayOfMass).format('HH:mm')}</TableCell>
                                        <TableCell sx={{
                                            fontWeight: 600,
                                            color: 'var(--label)'
                                        }}>{formatNumber(price, {
                                            style: 'currency',
                                            currency: 'xaf'
                                        })}</TableCell>
                                        <TableCell>{dayjs(createdAt).format('MMMM D, YYYY')}</TableCell>
                                        <TableCell>
                                            {showTransactionStatus(status as string)}
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
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50]} // Options for rows per page
                            component="div"
                            count={massDataTable.length} // Total number of rows
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(_, newPage) => {  // Change the record on the view page
                                setPage(newPage);
                            }}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0); // Reset to first page when changing rows per page
                            }}
                        />
                    </>
                )
            }

        </>

    );
}
