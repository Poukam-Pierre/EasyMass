import trashIcon from '@iconify-icons/ph/trash-light';
import { Icon } from "@iconify/react";
import { Box, Button, Chip, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { theme } from "@easy-messe/libs/theme";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import AdministratorFormDialog from "../../components/Administrators/AdministratorFormDialog";
import { withAdminLayout } from "../../components/withAdminLayout";
import { useAuth } from "../../contexts/AuthContext";
import api, { apiErrorMessage } from "../../lib/api";

interface AdministratorRow {
    adminId: string;
    name: string;
    phone: string;
    role: 'ADMIN' | 'ENGINEER';
    createdAt: string;
}

export default function Administrators() {
    const { formatMessage, formatDate } = useIntl()
    const { admin: currentAdmin } = useAuth()
    const [administrators, setAdministrators] = useState<AdministratorRow[]>([])
    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)

    const loadAdministrators = () => {
        api.get('/administrators')
            .then(({ data }) => setAdministrators(data))
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))));
    }

    useEffect(loadAdministrators, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleDelete = async (administrator: AdministratorRow) => {
        if (administrator.adminId === currentAdmin?.adminId) {
            toast.error(formatMessage({ id: 'cannotDeleteSelf' }));
            return;
        }
        if (!window.confirm(formatMessage({ id: 'deleteMassMsgWarning' }))) return;
        try {
            await api.delete(`/administrators/${administrator.adminId}`);
            toast.success(formatMessage({ id: 'saved' }));
            loadAdministrators();
        } catch (error) {
            toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
        }
    }

    return (
        <Box sx={{ display: 'grid', rowGap: '20px' }}>
            <AdministratorFormDialog isOpen={isCreateOpen} handleClose={() => setIsCreateOpen(false)} onCreated={loadAdministrators} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h2" color="primary" sx={{ paddingBottom: 0 }}>
                    {formatMessage({ id: 'administrators' })}
                </Typography>
                <Button variant="contained" onClick={() => setIsCreateOpen(true)}>
                    + {formatMessage({ id: 'createAdministrator' })}
                </Button>
            </Box>
            <Table>
                <TableHead>
                    <TableRow>
                        {['name', 'parishPhoneNumber', 'role', 'registrationDate', 'action'].map((key) => (
                            <TableCell key={key} sx={{ bgcolor: theme.palette.secondary.main, fontWeight: 600 }}>
                                {formatMessage({ id: key }).toUpperCase()}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {administrators.map((administrator) => (
                        <TableRow key={administrator.adminId}>
                            <TableCell sx={{ fontWeight: 600 }}>
                                {administrator.name}
                                {administrator.adminId === currentAdmin?.adminId && (
                                    <Chip size="small" label={formatMessage({ id: 'you' })} sx={{ marginLeft: 1 }} />
                                )}
                            </TableCell>
                            <TableCell>{administrator.phone}</TableCell>
                            <TableCell>{administrator.role}</TableCell>
                            <TableCell>{formatDate(administrator.createdAt)}</TableCell>
                            <TableCell align="right">
                                <IconButton size="small" onClick={() => handleDelete(administrator)}>
                                    <Icon icon={trashIcon} fontSize={18} color="var(--error)" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {administrators.length === 0 && (
                        <TableRow><TableCell colSpan={5} sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'noDataYet' })}</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </Box>
    );
}

Administrators.getLayout = function getLayout(page: ReactNode) {
    return withAdminLayout(page);
};
