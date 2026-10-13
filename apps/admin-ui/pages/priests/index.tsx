import trashIcon from '@iconify-icons/ph/trash-light';
import editIcon from '@iconify-icons/fluent/edit-28-regular';
import { Icon } from "@iconify/react";
import {
    Box, Chip, IconButton, Table, TableBody, TableCell,
    TableHead, TableRow, Tooltip, Typography
} from "@mui/material";
import { theme } from "@easy-messe/libs/theme";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import PriestEditDialog from "../../components/Priests/PriestEditDialog";
import { withAdminLayout } from "../../components/withAdminLayout";
import api, { apiErrorMessage } from "../../lib/api";

export interface PriestRow {
    priestId: string;
    firstName: string;
    secondName: string;
    phoneNumber: string;
    authNumber: string;
    available: boolean;
    homeParish?: { name: string } | null;
}

export default function Priests() {
    const { formatMessage } = useIntl()
    const [priests, setPriests] = useState<PriestRow[]>([])
    const [editing, setEditing] = useState<PriestRow | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const loadPriests = () => {
        api.get('/priest')
            .then(({ data }) => setPriests(data))
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
            .finally(() => setIsLoading(false));
    }

    useEffect(loadPriests, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleDelete = async (priest: PriestRow) => {
        if (!window.confirm(formatMessage({ id: 'deleteMassMsgWarning' }))) return;
        setDeletingId(priest.priestId)
        try {
            await api.delete(`/priest/${priest.priestId}`);
            toast.success(formatMessage({ id: 'saved' }));
            loadPriests();
        } catch (error) {
            toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
        } finally {
            setDeletingId(null)
        }
    }

    if (isLoading) {
        return <Typography sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'loading' })}</Typography>;
    }

    return (
        <Box sx={{ display: 'grid', rowGap: '20px' }}>
            <PriestEditDialog
                isOpen={!!editing}
                handleClose={() => setEditing(null)}
                priest={editing}
                onSaved={loadPriests}
            />
            <Box>
                <Typography variant="h2" color="primary" sx={{ paddingBottom: 0 }}>
                    {formatMessage({ id: 'priests' })}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--body)' }}>
                    {formatMessage({ id: 'priestsCreateHint' })}
                </Typography>
            </Box>
            <Table>
                <TableHead>
                    <TableRow>
                        {['name', 'parishName', 'parishPhoneNumber', 'authNumber', 'status', 'action'].map((key) => (
                            <TableCell key={key} sx={{ bgcolor: theme.palette.secondary.main, fontWeight: 600 }}>
                                {formatMessage({ id: key }).toUpperCase()}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {priests.map((priest) => (
                        <TableRow key={priest.priestId}>
                            <TableCell sx={{ fontWeight: 600 }}>{priest.firstName} {priest.secondName}</TableCell>
                            <TableCell>{priest.homeParish?.name ?? '-'}</TableCell>
                            <TableCell>{priest.phoneNumber}</TableCell>
                            <TableCell>{priest.authNumber}</TableCell>
                            <TableCell>
                                <Tooltip title={formatMessage({ id: priest.available ? 'priestAvailable' : 'priestUnavailable' })}>
                                    <Chip
                                        size="small"
                                        label={formatMessage({ id: priest.available ? 'priestAvailable' : 'priestUnavailable' })}
                                        color={priest.available ? 'success' : 'default'}
                                    />
                                </Tooltip>
                            </TableCell>
                            <TableCell align="right">
                                <IconButton size="small" onClick={() => setEditing(priest)} disabled={deletingId === priest.priestId}>
                                    <Icon icon={editIcon} fontSize={18} />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleDelete(priest)} disabled={deletingId === priest.priestId}>
                                    <Icon icon={trashIcon} fontSize={18} color="var(--error)" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {priests.length === 0 && (
                        <TableRow><TableCell colSpan={6} sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'noDataYet' })}</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </Box>
    );
}

Priests.getLayout = function getLayout(page: ReactNode) {
    return withAdminLayout(page);
};
