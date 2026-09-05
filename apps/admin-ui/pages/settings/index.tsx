import trashIcon from '@iconify-icons/ph/trash-light';
import editIcon from '@iconify-icons/fluent/edit-28-regular';
import { Icon } from "@iconify/react";
import {
    Autocomplete, Box, Button, Dialog, IconButton, Table, TableBody, TableCell,
    TableHead, TableRow, TextField, Typography
} from "@mui/material";
import { theme } from "@easy-messe/libs/theme";
import { extractApiErrorKey } from "@easy-messe/libs/utils";
import { useFormik } from "formik";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import * as yup from 'yup';
import { withAdminLayout } from "../../components/withAdminLayout";
import api, { apiErrorMessage } from "../../lib/api";

// Matches the backend's Currency enum exactly (Prisma's @map only affects
// the DB column value, not the string the API actually sends/expects).
const CURRENCIES = ['XAF', 'USD', 'EUR', 'GBP', 'NGN', 'XOF', 'GHS'] as const;
const BASE_CURRENCY = 'XAF';

// PlatformSettingsService returns a stable i18n key (not raw English text)
// for these two failures — whitelisted so an unexpected message still
// falls back to the generic toast instead of rendering a raw key.
const KNOWN_DELETE_ERROR_KEYS = new Set([
    'baseCurrencyCannotBeRemoved',
    'platformFeeNotConfiguredForCurrency',
])

interface PlatformSettingsRow {
    currency: typeof CURRENCIES[number];
    platformFeePercentage: number;
    platformFeeFixedAmount: number;
    updatedAt: string;
}

export default function Settings() {
    const { formatMessage, formatDate } = useIntl()
    const [settings, setSettings] = useState<PlatformSettingsRow[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
    const [editing, setEditing] = useState<PlatformSettingsRow | null>(null)
    const [deletingCurrency, setDeletingCurrency] = useState<string | null>(null)

    const loadSettings = () => {
        api.get('/platform-settings')
            .then(({ data }) => setSettings(data))
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
            .finally(() => setIsLoading(false))
    }

    useEffect(loadSettings, []) // eslint-disable-line react-hooks/exhaustive-deps

    const configuredCurrencies = new Set(settings.map((s) => s.currency))
    const availableToAdd = CURRENCIES.filter((c) => !configuredCurrencies.has(c))

    const openCreate = () => { setEditing(null); setIsDialogOpen(true); }
    const openEdit = (row: PlatformSettingsRow) => { setEditing(row); setIsDialogOpen(true); }
    const handleClose = () => setIsDialogOpen(false)

    const { handleChange, handleSubmit, errors, touched, values, setFieldValue, isSubmitting, resetForm } = useFormik({
        enableReinitialize: true,
        initialValues: {
            currency: editing?.currency ?? (availableToAdd[0] ?? ''),
            platformFeePercentage: editing?.platformFeePercentage ?? 0,
            platformFeeFixedAmount: editing?.platformFeeFixedAmount ?? 0,
        },
        validationSchema: yup.object().shape({
            currency: yup.string().required(formatMessage({ id: 'currencyWarningMsg' })),
            platformFeePercentage: yup.number().min(0, formatMessage({ id: 'numberChecked' })).required(),
            platformFeeFixedAmount: yup.number().min(0, formatMessage({ id: 'numberChecked' })).required(),
        }),
        onSubmit: async (formValues) => {
            try {
                await api.patch('/platform-settings', formValues);
                toast.success(formatMessage({ id: 'saved' }));
                resetForm();
                loadSettings();
                handleClose();
            } catch (error) {
                toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
            }
        },
    });

    const handleDelete = async (row: PlatformSettingsRow) => {
        if (!window.confirm(formatMessage({ id: 'deleteMassMsgWarning' }))) return;
        setDeletingCurrency(row.currency)
        try {
            await api.delete('/platform-settings', { params: { currency: row.currency } });
            toast.success(formatMessage({ id: 'saved' }));
            loadSettings();
        } catch (error) {
            const key = extractApiErrorKey(error, KNOWN_DELETE_ERROR_KEYS);
            toast.error(
                key
                    ? formatMessage({ id: key })
                    : apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' }))
            );
        } finally {
            setDeletingCurrency(null)
        }
    }

    if (isLoading) {
        return <Typography sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'loading' })}</Typography>;
    }

    return (
        <Box sx={{ display: 'grid', rowGap: '20px' }}>
            <Dialog
                open={isDialogOpen}
                onClose={handleClose}
                sx={{ '& .MuiPaper-root': { borderRadius: '15px', maxWidth: 'fit-content' } }}
            >
                <Box sx={{ padding: '48px 60px', minWidth: '440px', display: 'grid', rowGap: 2 }} component="form" onSubmit={handleSubmit}>
                    <Typography variant="h2" textAlign="center">
                        {formatMessage({ id: editing ? 'modify' : 'addCurrencyFee' })}
                    </Typography>
                    <Autocomplete
                        disabled={!!editing}
                        options={editing ? [editing.currency] : availableToAdd}
                        value={values.currency || null}
                        size="small"
                        onChange={(_, currency) => setFieldValue('currency', currency)}
                        renderInput={(params) =>
                            <TextField {...params} placeholder={formatMessage({ id: 'currency' })}
                                error={!!(errors.currency && touched.currency)}
                                helperText={touched.currency && errors.currency}
                            />
                        }
                    />
                    <TextField
                        name="platformFeePercentage" type="number" size="small"
                        label={formatMessage({ id: 'platformFeePercentage' })}
                        value={values.platformFeePercentage} onChange={handleChange}
                        error={!!(errors.platformFeePercentage && touched.platformFeePercentage)}
                        helperText={touched.platformFeePercentage && errors.platformFeePercentage}
                        inputProps={{ step: '0.01' }}
                    />
                    <TextField
                        name="platformFeeFixedAmount" type="number" size="small"
                        label={formatMessage({ id: 'platformFeeFixedAmount' })}
                        value={values.platformFeeFixedAmount} onChange={handleChange}
                        error={!!(errors.platformFeeFixedAmount && touched.platformFeeFixedAmount)}
                        helperText={touched.platformFeeFixedAmount && errors.platformFeeFixedAmount}
                        inputProps={{ step: '0.01' }}
                    />
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '20px', marginTop: '10px' }}>
                        <Button variant="outlined" type="button" onClick={handleClose}>{formatMessage({ id: 'cancel' })}</Button>
                        <Button variant="contained" type="submit" disabled={isSubmitting}>
                            {formatMessage({ id: isSubmitting ? 'processing' : 'save' })}
                        </Button>
                    </Box>
                </Box>
            </Dialog>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h2" color="primary" sx={{ paddingBottom: 0 }}>
                        {formatMessage({ id: 'settings' })}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--body)' }}>
                        {formatMessage({ id: 'platformFeeHelp' })}
                    </Typography>
                </Box>
                <Button variant="contained" onClick={openCreate} disabled={availableToAdd.length === 0}>
                    + {formatMessage({ id: 'addCurrencyFee' })}
                </Button>
            </Box>

            <Table>
                <TableHead>
                    <TableRow>
                        {['currency', 'platformFeePercentage', 'platformFeeFixedAmount', 'lastUpdated', 'action'].map((key) => (
                            <TableCell key={key} sx={{ bgcolor: theme.palette.secondary.main, fontWeight: 600 }}>
                                {formatMessage({ id: key }).toUpperCase()}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {settings.map((row) => (
                        <TableRow key={row.currency}>
                            <TableCell sx={{ fontWeight: 600 }}>{row.currency}</TableCell>
                            <TableCell>{row.platformFeePercentage}%</TableCell>
                            <TableCell>{row.platformFeeFixedAmount}</TableCell>
                            <TableCell>{formatDate(row.updatedAt)}</TableCell>
                            <TableCell align="right">
                                <IconButton size="small" onClick={() => openEdit(row)} disabled={deletingCurrency === row.currency}>
                                    <Icon icon={editIcon} fontSize={18} />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDelete(row)}
                                    disabled={row.currency === BASE_CURRENCY || deletingCurrency === row.currency}
                                    title={row.currency === BASE_CURRENCY ? formatMessage({ id: 'baseCurrencyCannotBeRemoved' }) : undefined}
                                >
                                    <Icon icon={trashIcon} fontSize={18} color={row.currency === BASE_CURRENCY ? 'var(--line)' : 'var(--error)'} />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {settings.length === 0 && (
                        <TableRow><TableCell colSpan={5} sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'noDataYet' })}</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </Box>
    );
}

Settings.getLayout = function getLayout(page: ReactNode) {
    return withAdminLayout(page);
};
