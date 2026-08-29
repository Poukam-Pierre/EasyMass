import searchIcon from '@iconify-icons/fluent/search-24-regular';
import trashIcon from '@iconify-icons/ph/trash-light';
import { Icon } from "@iconify/react";
import {
    Box, Button, IconButton, InputBase, Switch, Table, TableBody,
    TableCell, TableHead, TableRow, Tooltip, Typography
} from "@mui/material";
import { theme } from "@easy-messe/libs/theme";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import ParishFormDialog from "../../components/Parishes/ParishFormDialog";
import { withAdminLayout } from "../../components/withAdminLayout";
import api, { apiErrorMessage } from "../../lib/api";

interface ParishRow {
    parishId: string;
    name: string;
    phone: string;
    managerName: string;
    createdAt: string;
    isBlocked: boolean;
    payoutBlocked: boolean;
    city: { city_name: string } | null;
    user: { email: string };
}

export default function Parishes() {
    const { formatMessage, formatDate } = useIntl()
    const { push } = useRouter()
    const [parishes, setParishes] = useState<ParishRow[]>([])
    const [search, setSearch] = useState<string>('')
    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const loadParishes = () => {
        setIsLoading(true)
        api.get('/parishes', { params: search ? { name: search } : {} })
            .then(({ data }) => setParishes(data))
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
            .finally(() => setIsLoading(false))
    }

    useEffect(loadParishes, [search]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleToggleBlock = async (parish: ParishRow) => {
        try {
            await api.patch(`/parishes/${parish.parishId}/block`, { isBlocked: !parish.isBlocked });
            toast.success(formatMessage({ id: parish.isBlocked ? 'parishUnblocked' : 'parishBlocked' }));
            loadParishes();
        } catch (error) {
            toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
        }
    }

    const handleTogglePayoutBlock = async (parish: ParishRow) => {
        try {
            await api.patch(`/parishes/${parish.parishId}/payout-block`, { payoutBlocked: !parish.payoutBlocked });
            toast.success(formatMessage({ id: 'saved' }));
            loadParishes();
        } catch (error) {
            toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
        }
    }

    const handleDelete = async (parish: ParishRow, event: React.MouseEvent) => {
        event.stopPropagation();
        if (!window.confirm(formatMessage({ id: 'deleteParishMsg' }))) return;
        try {
            await api.delete(`/parishes/${parish.parishId}`);
            toast.success(formatMessage({ id: 'saved' }));
            loadParishes();
        } catch (error) {
            toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
        }
    }

    return (
        <Box sx={{ display: 'grid', rowGap: '20px' }}>
            <ParishFormDialog isOpen={isCreateOpen} handleClose={() => setIsCreateOpen(false)} onCreated={loadParishes} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h2" color="primary" sx={{ paddingBottom: 0 }}>
                    {formatMessage({ id: 'listOfParish' })}
                </Typography>
                <Button variant="contained" onClick={() => setIsCreateOpen(true)}>
                    + {formatMessage({ id: 'addParish' })}
                </Button>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', columnGap: 1, width: '320px' }}>
                <Icon icon={searchIcon} fontSize={20} />
                <InputBase
                    placeholder={formatMessage({ id: 'search' })}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </Box>
            <Table>
                <TableHead>
                    <TableRow>
                        {['name', 'parishCity', 'leadParishName', 'parishPhoneNumber', 'registrationDate', 'status', 'withdrawal', 'action'].map((key) => (
                            <TableCell key={key} sx={{ bgcolor: theme.palette.secondary.main, fontWeight: 600 }}>
                                {formatMessage({ id: key }).toUpperCase()}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {parishes.map((parish) => (
                        <TableRow
                            key={parish.parishId}
                            hover
                            sx={{ cursor: 'pointer' }}
                            onClick={() => push(`/parishes/${parish.parishId}`)}
                        >
                            <TableCell sx={{ fontWeight: 600 }}>{parish.name}</TableCell>
                            <TableCell>{parish.city?.city_name ?? '-'}</TableCell>
                            <TableCell>{parish.managerName}</TableCell>
                            <TableCell>{parish.phone}</TableCell>
                            <TableCell>{formatDate(parish.createdAt)}</TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Tooltip title={formatMessage({ id: parish.isBlocked ? 'parishBlockedTooltip' : 'parishActiveTooltip' })}>
                                    <Switch checked={!parish.isBlocked} onChange={() => handleToggleBlock(parish)} size="small" />
                                </Tooltip>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Tooltip title={formatMessage({ id: 'payoutBlockToggleTooltip' })}>
                                    <Switch checked={!parish.payoutBlocked} onChange={() => handleTogglePayoutBlock(parish)} size="small" />
                                </Tooltip>
                            </TableCell>
                            <TableCell align="right">
                                <IconButton size="small" onClick={(e) => handleDelete(parish, e)}>
                                    <Icon icon={trashIcon} fontSize={18} color="var(--error)" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {!isLoading && parishes.length === 0 && (
                <Typography variant="body2" sx={{ color: 'var(--body)', textAlign: 'center', padding: '20px' }}>
                    {formatMessage({ id: 'noDataYet' })}
                </Typography>
            )}
        </Box>
    );
}

Parishes.getLayout = function getLayout(page: ReactNode) {
    return withAdminLayout(page);
};
