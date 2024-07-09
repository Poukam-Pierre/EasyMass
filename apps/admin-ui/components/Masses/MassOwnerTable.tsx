import { theme } from "@easy-messe/libs/theme";
import { IconButton, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { useIntl } from "react-intl";
import verticalDotsIcon from '@iconify-icons/ph/dots-three-outline-vertical-fill'
import { Icon } from "@iconify/react";
import { MouseEvent, useState } from "react";
import MassOwnerTableMenu from "../Menus/MassOwnerTableMenu";
import MassesDialog from "./Dialogs/Masses";
import CancelMassDialog from "./Dialogs/CanceMass";
import { MenuIntem } from "../Menus/MassMenu";
import trashIcon from '@iconify-icons/ph/trash-light';
import editIcon from '@iconify-icons/fluent/edit-28-regular';


export interface TableData {
    id: number;
    dayOfMass: string;
    massHour: string;
    massType: string;
    price: number;
}

export interface MenuItemForMassOwner extends MenuIntem {
    color?: string
}

export default function MassOwnerTable() {
    const { formatMessage, formatNumber } = useIntl()
    const titles = ['No', 'dayOfMass', 'massHour', 'massType', 'price', 'action']
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [isMassModify, setIsMassModify] = useState<boolean>(false)
    const [selectedData, setSelectedData] = useState<number | undefined>()
    const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false)

    const menuItem: MenuItemForMassOwner[] = [
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

    const tableData: TableData[] = [
        {
            id: 1,
            dayOfMass: formatMessage({ id: 'monday' }),
            massHour: '10h30',
            massType: 'Simple',
            price: 2000
        },
        {
            id: 2,
            dayOfMass: formatMessage({ id: 'saturday' }),
            massHour: '08h30',
            massType: 'Simple',
            price: 5000
        },
        {
            id: 3,
            dayOfMass: '-',
            massHour: '-',
            massType: formatMessage({ id: 'triduum' }),
            price: 3000
        },
    ]
    const handleActionOnRow = (event: MouseEvent<HTMLElement>, id: number) => {
        setAnchorEl(event.currentTarget);
        setSelectedData(id)
    }
    const handleMassModifyDialog = () => {
        setIsMassModify((prev) => !prev)
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
            />
            <MassesDialog
                title={formatMessage({ id: 'massModify' })}
                labelBtn={formatMessage({ id: 'modify' })}
                replicatLabel={formatMessage({ id: 'applyAll' })}
                isOpen={isMassModify}
                handleClose={handleMassModifyDialog}
                massData={tableData.find((data) => data.id === selectedData)}
            />
            <CancelMassDialog
                isOpen={isOpenDelete}
                handleClose={handleCancelClose}
            />

            <Table>
                <TableHead>
                    <TableRow>
                        {titles.map((title, index) => (
                            <TableCell
                                key={index}
                                sx={{
                                    bgcolor: theme.palette.secondary.main
                                }}
                            >
                                {formatMessage({ id: title }).toUpperCase()}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tableData.map(({
                        id, dayOfMass, massHour,
                        massType, price

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
                                {dayOfMass.toUpperCase()}
                            </TableCell>
                            <TableCell>{massHour}</TableCell>
                            <TableCell>{massType}</TableCell>
                            <TableCell sx={{
                                fontWeight: 600,
                                color: 'var(--label)'
                            }}>{formatNumber(price, {
                                style: 'currency',
                                currency: 'xaf'
                            })}</TableCell>
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
