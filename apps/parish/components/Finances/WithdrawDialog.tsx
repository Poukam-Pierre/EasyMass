import axios from "axios";
import { Box, Button, Dialog, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { IntlShape, useIntl } from "react-intl";
import { toast } from "react-toastify";
import * as yup from 'yup';
import api from "../../lib/api";

interface WithdrawDialogProps {
    isOpen: boolean;
    handleClose: () => void;
    onWithdrawn: () => void;
}

// The withdrawal endpoint returns a stable i18n key as `message` (see
// payment.service.ts's withdrawMoney/createOrRetreiveRecipient) instead of a
// hardcoded English string. Whitelisted so an unexpected backend message
// never renders as a raw, untranslated key string.
const WITHDRAWAL_ERROR_KEYS = new Set([
    'withdrawalNoPayoutNumber',
    'withdrawalRecipientFailed',
    'withdrawalBlocked',
    'withdrawalInsufficientBalance',
    'withdrawalNotAccepted',
    'withdrawalFailed',
]);

function getWithdrawErrorMessage(error: unknown, formatMessage: IntlShape['formatMessage']): string {
    if (axios.isAxiosError(error)) {
        const message = (error.response?.data as { message?: string } | undefined)?.message;
        if (message && WITHDRAWAL_ERROR_KEYS.has(message)) {
            return formatMessage({ id: message });
        }
    }
    return formatMessage({ id: 'genericErrorMsg' });
}

export default function WithdrawDialog({ isOpen, handleClose, onWithdrawn }: WithdrawDialogProps) {
    const { formatMessage } = useIntl()

    const { handleChange, handleSubmit, errors, touched, values, isSubmitting, resetForm } = useFormik({
        initialValues: { amount: '' },
        validationSchema: yup.object().shape({
            amount: yup.number().min(1, formatMessage({ id: 'numberChecked' })).required(formatMessage({ id: 'numberChecked' })),
        }),
        onSubmit: async (formValues) => {
            try {
                await api.post('/payment/withdraw', { amount: Number(formValues.amount) });
                toast.success(formatMessage({ id: 'saved' }));
                resetForm();
                onWithdrawn();
                handleClose();
            } catch (error) {
                toast.error(getWithdrawErrorMessage(error, formatMessage));
            }
        },
    });

    if (!isOpen) return null

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            sx={{ '& .MuiPaper-root': { borderRadius: '15px', maxWidth: 'fit-content' } }}
        >
            <Box sx={{ padding: '48px 60px', minWidth: '440px', display: 'grid', rowGap: 2 }} component="form" onSubmit={handleSubmit}>
                <Typography variant="h2" textAlign="center">{formatMessage({ id: 'withdrawal' })}</Typography>
                <TextField
                    name="amount" type="number" size="small"
                    placeholder={formatMessage({ id: 'amount' })}
                    value={values.amount} onChange={handleChange}
                    error={!!(errors.amount && touched.amount)}
                    helperText={touched.amount && errors.amount}
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '20px', marginTop: '10px' }}>
                    <Button variant="outlined" type="button" onClick={handleClose}>{formatMessage({ id: 'cancel' })}</Button>
                    <Button variant="contained" type="submit" disabled={isSubmitting}>
                        {formatMessage({ id: isSubmitting ? 'processing' : 'withdrawal' })}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
