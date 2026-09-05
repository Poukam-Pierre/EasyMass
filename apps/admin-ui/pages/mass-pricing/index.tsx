import trashIcon from '@iconify-icons/ph/trash-light';
import editIcon from '@iconify-icons/fluent/edit-28-regular';
import { Icon } from "@iconify/react";
import {
    Autocomplete, Box, Button, Dialog, IconButton, Table, TableBody, TableCell,
    TableHead, TableRow, TextField, Typography
} from "@mui/material";
import { theme } from "@easy-messe/libs/theme";
import { useFormik } from "formik";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import * as yup from 'yup';
import { withAdminLayout } from "../../components/withAdminLayout";
import api, { apiErrorMessage } from "../../lib/api";
import { CURRENCIES } from "../../lib/currencies";

interface PriceBandRow {
    massPriceBandId: string;
    currency: typeof CURRENCIES[number];
    minPrice: number;
    maxPrice: number;
    amount: number;
}

export default function MassPricing() {
    const { formatMessage } = useIntl()
    const [bands, setBands] = useState<PriceBandRow[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
    const [editing, setEditing] = useState<PriceBandRow | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const loadBands = () => {
        api.get('/mass-price-bands')
            .then(({ data }) => setBands(data))
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
            .finally(() => setIsLoading(false))
    }

    useEffect(loadBands, []) // eslint-disable-line react-hooks/exhaustive-deps

    const openCreate = () => { setEditing(null); setIsDialogOpen(true); }
    const openEdit = (row: PriceBandRow) => { setEditing(row); setIsDialogOpen(true); }
    const handleClose = () => setIsDialogOpen(false)

    const { handleChange, handleSubmit, errors, touched, values, setFieldValue, isSubmitting, resetForm } = useFormik({
        enableReinitialize: true,
        initialValues: {
            currency: editing?.currency ?? '',
            minPrice: editing?.minPrice ?? 0,
            maxPrice: editing?.maxPrice ?? 0,
            amount: editing?.amount ?? 0,
        },
        validationSchema: yup.object().shape({
            currency: yup.string().required(formatMessage({ id: 'currencyWarningMsg' })),
            minPrice: yup.number().min(0, formatMessage({ id: 'numberChecked' })).required(),
            maxPrice: yup.number()
                .moreThan(yup.ref('minPrice'), formatMessage({ id: 'numberChecked' }))
                .required(),
            amount: yup.number().min(0, formatMessage({ id: 'numberChecked' })).required(),
        }),
        onSubmit: async (formValues) => {
            try {
                if (editing) {
                    await api.patch(`/mass-price-bands/${editing.massPriceBandId}`, {
                        minPrice: formValues.minPrice,
                        maxPrice: formValues.maxPrice,
                        amount: formValues.amount,
                    });
                } else {
                    await api.post('/mass-price-bands', formValues);
                }
                toast.success(formatMessage({ id: 'saved' }));
                resetForm();
                loadBands();
                handleClose();
            } catch (error) {
                toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
            }
        },
    });

    const handleDelete = async (row: PriceBandRow) => {
        if (!window.confirm(formatMessage({ id: 'deleteMassMsgWarning' }))) return;
        setDeletingId(row.massPriceBandId)
        try {
            await api.delete(`/mass-price-bands/${row.massPriceBandId}`);
            toast.success(formatMessage({ id: 'saved' }));
            loadBands();
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
            <Dialog
                open={isDialogOpen}
                onClose={handleClose}
                sx={{ '& .MuiPaper-root': { borderRadius: '15px', maxWidth: 'fit-content' } }}
            >
                <Box sx={{ padding: '48px 60px', minWidth: '440px', display: 'grid', rowGap: 2 }} component="form" onSubmit={handleSubmit}>
                    <Typography variant="h2" textAlign="center">
                        {formatMessage({ id: editing ? 'editPriceBand' : 'addPriceBand' })}
                    </Typography>
                    <Autocomplete
                        disabled={!!editing}
                        options={CURRENCIES}
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
                        name="minPrice" type="number" size="small"
                        label={formatMessage({ id: 'minPrice' })}
                        value={values.minPrice} onChange={handleChange}
                        error={!!(errors.minPrice && touched.minPrice)}
                        helperText={touched.minPrice && errors.minPrice}
                    />
                    <TextField
                        name="maxPrice" type="number" size="small"
                        label={formatMessage({ id: 'maxPrice' })}
                        value={values.maxPrice} onChange={handleChange}
                        error={!!(errors.maxPrice && touched.maxPrice)}
                        helperText={touched.maxPrice && errors.maxPrice}
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

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h2" color="primary" sx={{ paddingBottom: 0 }}>
                        {formatMessage({ id: 'priceBands' })}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--body)', maxWidth: '640px' }}>
                        {formatMessage({ id: 'priceBandsHelp' })}
                    </Typography>
                </Box>
                <Button variant="contained" onClick={openCreate}>
                    + {formatMessage({ id: 'addPriceBand' })}
                </Button>
            </Box>

            <Table>
                <TableHead>
                    <TableRow>
                        {['currency', 'minPrice', 'maxPrice', 'amount', 'action'].map((key) => (
                            <TableCell key={key} sx={{ bgcolor: theme.palette.secondary.main, fontWeight: 600 }}>
                                {formatMessage({ id: key }).toUpperCase()}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {bands.map((row) => (
                        <TableRow key={row.massPriceBandId}>
                            <TableCell sx={{ fontWeight: 600 }}>{row.currency}</TableCell>
                            <TableCell>{row.minPrice}</TableCell>
                            <TableCell>{row.maxPrice}</TableCell>
                            <TableCell>{row.amount}</TableCell>
                            <TableCell align="right">
                                <IconButton size="small" onClick={() => openEdit(row)} disabled={deletingId === row.massPriceBandId}>
                                    <Icon icon={editIcon} fontSize={18} />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDelete(row)}
                                    disabled={deletingId === row.massPriceBandId}
                                >
                                    <Icon icon={trashIcon} fontSize={18} color="var(--error)" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {bands.length === 0 && (
                        <TableRow><TableCell colSpan={5} sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'noDataYet' })}</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </Box>
    );
}

MassPricing.getLayout = function getLayout(page: ReactNode) {
    return withAdminLayout(page);
};
