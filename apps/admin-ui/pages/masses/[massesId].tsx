import trashIcon from '@iconify-icons/ph/trash-light';
import editIcon from '@iconify-icons/fluent/edit-28-regular';
import { Icon } from "@iconify/react";
import {
    Autocomplete, Box, Button, Dialog, IconButton, Table, TableBody, TableCell,
    TableHead, TableRow, TextField, Typography
} from "@mui/material";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import * as yup from 'yup';
import IntentionMassesTable, { MassIntentionRow } from "../../components/Masses/IntentionMassesTable";
import { withAdminLayout } from "../../components/withAdminLayout";
import api, { apiErrorMessage } from "../../lib/api";
import { CURRENCIES } from "../../lib/currencies";
import { downloadFile } from "../../lib/downloadFile";

interface MassPriceRow {
    massPriceId: string;
    currency: typeof CURRENCIES[number];
    amount: number;
}

export default function Historics() {
    const [intentions, setIntentions] = useState<MassIntentionRow[]>([])
    const [prices, setPrices] = useState<MassPriceRow[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isDownloading, setIsDownloading] = useState<boolean>(false)
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
    const [editing, setEditing] = useState<MassPriceRow | null>(null)
    const [deletingCurrency, setDeletingCurrency] = useState<string | null>(null)
    const { formatMessage, formatNumber } = useIntl()
    const { query: { massesId } } = useRouter()

    const loadPrices = () => {
        if (typeof massesId !== 'string') return
        api.get(`/masses/${massesId}/prices`)
            .then(({ data }) => setPrices(data))
            .catch(() => undefined);
    }

    useEffect(() => {
        if (typeof massesId !== 'string') return
        setIsLoading(true)
        Promise.all([
            api.get(`/masses/${massesId}/intentions`)
                .then(({ data }) => setIntentions(data))
                .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' })))),
            api.get(`/masses/${massesId}/prices`)
                .then(({ data }) => setPrices(data))
                .catch(() => undefined),
        ]).finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [massesId])

    const handleDownloadAll = async () => {
        if (typeof massesId !== 'string') return
        setIsDownloading(true)
        try {
            await downloadFile(`/masses/${massesId}/intentions/download`, `intentions-${massesId}.pdf`);
        } catch (error) {
            toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
        } finally {
            setIsDownloading(false)
        }
    }

    const configuredCurrencies = new Set(prices.map((p) => p.currency))
    const availableToAdd = CURRENCIES.filter((c) => !configuredCurrencies.has(c))

    const openCreate = () => { setEditing(null); setIsDialogOpen(true); }
    const openEdit = (row: MassPriceRow) => { setEditing(row); setIsDialogOpen(true); }
    const handleClose = () => setIsDialogOpen(false)

    const { handleChange, handleSubmit, errors, touched, values, setFieldValue, isSubmitting, resetForm } = useFormik({
        enableReinitialize: true,
        initialValues: {
            currency: editing?.currency ?? (availableToAdd[0] ?? ''),
            amount: editing?.amount ?? 0,
        },
        validationSchema: yup.object().shape({
            currency: yup.string().required(formatMessage({ id: 'currencyWarningMsg' })),
            amount: yup.number().min(0, formatMessage({ id: 'numberChecked' })).required(),
        }),
        onSubmit: async (formValues) => {
            if (typeof massesId !== 'string') return
            try {
                await api.post(`/masses/${massesId}/prices`, formValues);
                toast.success(formatMessage({ id: 'saved' }));
                resetForm();
                loadPrices();
                handleClose();
            } catch (error) {
                toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
            }
        },
    });

    const handleDeletePrice = async (row: MassPriceRow) => {
        if (typeof massesId !== 'string') return
        if (!window.confirm(formatMessage({ id: 'deleteMassMsgWarning' }))) return;
        setDeletingCurrency(row.currency)
        try {
            await api.delete(`/masses/${massesId}/prices`, { params: { currency: row.currency } });
            toast.success(formatMessage({ id: 'saved' }));
            loadPrices();
        } catch (error) {
            toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
        } finally {
            setDeletingCurrency(null)
        }
    }

    return (
        <>
            <Dialog
                open={isDialogOpen}
                onClose={handleClose}
                sx={{ '& .MuiPaper-root': { borderRadius: '15px', maxWidth: 'fit-content' } }}
            >
                <Box sx={{ padding: '48px 60px', minWidth: '440px', display: 'grid', rowGap: 2 }} component="form" onSubmit={handleSubmit}>
                    <Typography variant="h2" textAlign="center">
                        {formatMessage({ id: 'setMassPrice' })}
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
                        name="amount" type="number" size="small"
                        label={formatMessage({ id: 'amount' })}
                        value={values.amount} onChange={handleChange}
                        error={!!(errors.amount && touched.amount)}
                        helperText={touched.amount && errors.amount}
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

            <Box sx={{
                display: 'grid',
                rowGap: 5
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <Typography
                        variant="h3"
                        color='primary'
                        sx={{
                            paddingBottom: 0
                        }}
                    >
                        {formatMessage({ id: 'massIntention' })}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleDownloadAll}
                        disabled={isDownloading || intentions.length === 0}
                    >
                        {formatMessage({ id: isDownloading ? 'processing' : 'downloadAll' })}
                    </Button>
                </Box>
            </Box>
            {isLoading ? (
                <Typography variant="body2" sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'loading' })}</Typography>
            ) : (
                <>
                    <IntentionMassesTable
                        intentions={intentions}
                    />

                    <Box sx={{ marginTop: 5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h4">{formatMessage({ id: 'massPrices' })}</Typography>
                                <Typography variant="body2" sx={{ color: 'var(--body)' }}>
                                    {formatMessage({ id: 'ownPriceHint' })}
                                </Typography>
                            </Box>
                            <Button variant="contained" onClick={openCreate} disabled={availableToAdd.length === 0}>
                                + {formatMessage({ id: 'setMassPrice' })}
                            </Button>
                        </Box>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>{formatMessage({ id: 'currency' })}</TableCell>
                                    <TableCell align="right">{formatMessage({ id: 'amount' })}</TableCell>
                                    <TableCell align="right">{formatMessage({ id: 'action' })}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {prices.map((price) => (
                                    <TableRow key={price.massPriceId}>
                                        <TableCell>{price.currency}</TableCell>
                                        <TableCell align="right">
                                            {formatNumber(price.amount, { style: 'currency', currency: price.currency.toLowerCase() })}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => openEdit(price)} disabled={deletingCurrency === price.currency}>
                                                <Icon icon={editIcon} fontSize={18} />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeletePrice(price)}
                                                disabled={deletingCurrency === price.currency}
                                            >
                                                <Icon icon={trashIcon} fontSize={18} color="var(--error)" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {prices.length === 0 && (
                                    <TableRow><TableCell colSpan={3} sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'noDataYet' })}</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                </>
            )}
        </>

    );
}

Historics.getLayout = function getLayout(page: ReactNode) {
    return withAdminLayout(page);
};
