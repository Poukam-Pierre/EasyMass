import { Box, Button, Dialog, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import * as yup from 'yup';
import api, { apiErrorMessage } from "../../lib/api";

interface CorrectionDialogProps {
    isOpen: boolean;
    handleClose: () => void;
    parishId: string;
    onSaved: () => void;
}

export default function CorrectionDialog({ isOpen, handleClose, parishId, onSaved }: CorrectionDialogProps) {
    const { formatMessage } = useIntl()

    const { handleChange, handleSubmit, errors, touched, values, resetForm, isSubmitting } = useFormik({
        initialValues: { amount: '', note: '' },
        validationSchema: yup.object().shape({
            amount: yup.number().typeError(formatMessage({ id: 'numberChecked' })).required(formatMessage({ id: 'priceWarningMsg' })),
            note: yup.string().required(formatMessage({ id: 'intentionChecked' })),
        }),
        onSubmit: async (formValues) => {
            try {
                await api.post('/transactions/correction', {
                    ownerId: parishId,
                    ownerType: 'PARISH',
                    amount: Number(formValues.amount),
                    note: formValues.note,
                });
                toast.success(formatMessage({ id: 'saved' }));
                resetForm();
                onSaved();
                handleClose();
            } catch (error) {
                toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
            }
        },
    });

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            sx={{ '& .MuiPaper-root': { borderRadius: '15px', maxWidth: 'fit-content' } }}
        >
            <Box sx={{ padding: '48px 60px', minWidth: '440px', display: 'grid', rowGap: 2 }} component="form" onSubmit={handleSubmit}>
                <Typography variant="h2" textAlign="center">{formatMessage({ id: 'ledgerCorrection' })}</Typography>
                <Typography variant="body2" sx={{ color: 'var(--body)' }}>
                    {formatMessage({ id: 'ledgerCorrectionHelp' })}
                </Typography>
                <TextField
                    name="amount" type="number" placeholder={formatMessage({ id: 'ledgerCorrectionAmount' })} size="small"
                    value={values.amount} onChange={handleChange}
                    error={!!(errors.amount && touched.amount)} helperText={touched.amount && errors.amount}
                />
                <TextField
                    name="note" placeholder={formatMessage({ id: 'ledgerCorrectionNote' })} size="small" multiline rows={3}
                    value={values.note} onChange={handleChange}
                    error={!!(errors.note && touched.note)} helperText={touched.note && errors.note}
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '20px', marginTop: '10px' }}>
                    <Button variant="outlined" type="button" onClick={handleClose}>{formatMessage({ id: 'cancel' })}</Button>
                    <Button variant="contained" type="submit" disabled={isSubmitting}>
                        {formatMessage({ id: isSubmitting ? 'processing' : 'save' })}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
