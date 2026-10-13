import { theme } from "@easy-messe/libs/theme";
import {
    Box,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import { useIntl } from "react-intl";
import verticalDotsIcon from '@iconify-icons/ph/dots-three-outline-vertical-fill'
import { Icon } from "@iconify/react";
import { MouseEvent, useState } from "react";
import MassOwnerTableMenu from "../Menus/MassOwnerTableMenu";
import MassesDialog, { MassTypeEnum } from "./Dialogs/Masses";
import CancelMassDialog from "./Dialogs/CanceMass";
import { MenuItem } from "../Menus/MassMenu";
import trashIcon from '@iconify-icons/ph/trash-light';
import editIcon from '@iconify-icons/fluent/edit-28-regular';
import detailsIcon from '@iconify-icons/fluent/document-text-24-regular';
import warningIcon from '@iconify-icons/fluent/warning-24-regular';
import { Dayjs } from "dayjs";

const massStatusColor: Record<string, { bg: string; color: string }> = {
    open: { bg: 'rgba(92, 179, 96, 0.15)', color: 'var(--success)' },
    processing: { bg: 'rgba(255, 184, 0, 0.3)', color: 'var(--warning)' },
    closed: { bg: 'rgba(199, 0, 0, 0.15)', color: 'var(--error)' },
    completed: { bg: 'rgba(2, 109, 169, 0.3)', color: 'var(--primary)' },
};

const showMassStatus = (label: string) => {
    const style = massStatusColor[label];
    if (!style) return undefined;
    return (
        <Typography sx={{
            bgcolor: style.bg,
            color: style.color,
            width: 'fit-content',
            borderRadius: '20px',
            padding: 1,
            fontWeight: 'bold',
        }}>
            {label}
        </Typography>
    );
};

export interface TableMassOwnerData {
    id: string;
    dayOfMass: Dayjs | null;
    massTime: Dayjs | null;
    massType: MassTypeEnum | string;
    price: number;
    estimatedDurationMinutes?: number;
    status?: string
}

export interface MenuItemForMassOwner extends MenuItem {
    color?: string
}

export default function MassOwnerTable({
    massDataTable,
    parishId,
    onChanged,
}: {
    massDataTable: TableMassOwnerData[]
    parishId: string
    onChanged: () => void
}) {
    const { formatMessage, formatNumber } = useIntl()
    const titles = ['dayOfMass', 'massHour', 'massType', 'price', 'status', 'action']
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [isMassModify, setIsMassModify] = useState<boolean>(false)
    const [idSelected, setIdSelected] = useState<string | undefined>()
    const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false)
    const [massSelected, setMassSelected] = useState<TableMassOwnerData>()
    const dayOfWeek: Record<number, string> = {
        1: 'monday',
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: 'saturday',
        7: 'sunday',
    }

    const menuItem: MenuItemForMassOwner[] = [
        {
            title: formatMessage({ id: 'modify' }),
            icon: editIcon
        },
        {
            title: formatMessage({ id: 'details' }),
            icon: detailsIcon
        },
        {
            title: formatMessage({ id: 'delete' }),
            icon: trashIcon,
            color: 'var(--error)'
        },
    ]

    const handleActionOnRow = (event: MouseEvent<HTMLElement>, id: string) => {
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
                parishId={parishId}
                onSaved={onChanged}
            />
            <CancelMassDialog
                isOpen={isOpenDelete}
                handleClose={handleCancelClose}
                idSelected={idSelected}
                onDeleted={onChanged}
            />

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
                    {massDataTable.map(({
                        id, dayOfMass, massTime,
                        massType, price, status

                    }, index) => (
                        <TableRow
                            key={id}
                            sx={{
                                color: 'var(--label)'
                            }}
                        >
                            <TableCell>{index + 1}</TableCell>
                            <TableCell sx={{
                                fontWeight: 600,
                                color: 'var(--label)'
                            }}>
                                {dayOfMass ? formatMessage({ id: dayOfWeek[dayOfMass.day() === 0 ? 7 : dayOfMass.day()] })
                                    .toUpperCase() : '-'
                                }
                            </TableCell>
                            <TableCell>{massTime ? massTime.format('HH:mm') : '-'}</TableCell>
                            <TableCell>{massType}</TableCell>
                            <TableCell sx={{
                                fontWeight: 600,
                                color: 'var(--label)'
                            }}>{formatNumber(price, {
                                style: 'currency',
                                currency: 'xaf'
                            })}</TableCell>
                            <TableCell>
                                {showMassStatus(status as string) ?? status}
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
            {
                !massDataTable.length && (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '50%'
                    }}>
                        <Icon icon={warningIcon} fontSize={24} />
                        <Typography variant='body2'>
                            {formatMessage({ id: 'warningMassCreation' })}
                        </Typography>
                    </Box>
                )
            }
        </>

    );
}
