import { Box, Button, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import * as yup from 'yup';
import { withAdminLayout } from "../../components/withAdminLayout";
import api, { apiErrorMessage } from "../../lib/api";

interface PlatformSettings {
    platformFeePercentage: number;
    platformFeeFixedAmount: number;
    updatedAt: string;
}

export default function Settings() {
    const { formatMessage, formatDate } = useIntl()
    const [settings, setSettings] = useState<PlatformSettings | null>(null)

    useEffect(() => {
        api.get('/platform-settings')
            .then(({ data }) => setSettings(data))
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))));
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const { handleChange, handleSubmit, errors, touched, values, isSubmitting, dirty } = useFormik({
        enableReinitialize: true,
        initialValues: {
            platformFeePercentage: settings?.platformFeePercentage ?? 0,
            platformFeeFixedAmount: settings?.platformFeeFixedAmount ?? 0,
        },
        validationSchema: yup.object().shape({
            platformFeePercentage: yup.number().min(0, formatMessage({ id: 'numberChecked' })).required(),
            platformFeeFixedAmount: yup.number().min(0, formatMessage({ id: 'numberChecked' })).required(),
        }),
        onSubmit: async (formValues) => {
            try {
                const { data } = await api.patch('/platform-settings', formValues);
                setSettings(data);
                toast.success(formatMessage({ id: 'saved' }));
            } catch (error) {
                toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
            }
        },
    });

    if (!settings) {
        return <Typography sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'loading' })}</Typography>;
    }

    return (
        <Box sx={{ display: 'grid', rowGap: '20px', maxWidth: '480px' }}>
            <Typography variant="h2" color="primary" sx={{ paddingBottom: 0 }}>
                {formatMessage({ id: 'settings' })}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--body)' }}>
                {formatMessage({ id: 'platformFeeHelp' })}
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', rowGap: 2 }}>
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
                <Typography variant="caption" sx={{ color: 'var(--body)' }}>
                    {formatMessage({ id: 'lastUpdated' })}: {formatDate(settings.updatedAt)}
                </Typography>
                <Button variant="contained" type="submit" disabled={isSubmitting || !dirty} sx={{ justifySelf: 'start' }}>
                    {formatMessage({ id: isSubmitting ? 'processing' : 'save' })}
                </Button>
            </Box>
        </Box>
    );
}

Settings.getLayout = function getLayout(page: ReactNode) {
    return withAdminLayout(page);
};
