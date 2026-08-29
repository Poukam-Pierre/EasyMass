import { Avatar, Box, Button, Chip, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { ReactNode } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import * as yup from 'yup';
import { withAdminLayout } from "../../components/withAdminLayout";
import { useAuth } from "../../contexts/AuthContext";
import api, { apiErrorMessage } from "../../lib/api";

export default function Profile() {
    const { formatMessage, formatDate } = useIntl()
    const { admin, setAdmin } = useAuth()

    const { handleChange, handleSubmit, errors, touched, values, isSubmitting, dirty } = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: admin?.name ?? '',
            phone: admin?.phone ?? '',
        },
        validationSchema: yup.object().shape({
            name: yup.string().required(),
            phone: yup.string().required(),
        }),
        onSubmit: async (formValues) => {
            if (!admin) return;
            try {
                const { data } = await api.patch('/administrators/me', formValues);
                setAdmin({ ...admin, name: data.name, phone: data.phone });
                toast.success(formatMessage({ id: 'saved' }));
            } catch (error) {
                toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
            }
        },
    });

    if (!admin) return null;

    return (
        <Box sx={{ display: 'grid', rowGap: '20px', maxWidth: '480px' }}>
            <Typography variant="h2" color="primary" sx={{ paddingBottom: 0 }}>
                {formatMessage({ id: 'profile' })}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', columnGap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'var(--primary)' }}>
                    {admin.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                    <Typography sx={{ fontWeight: 600 }}>{admin.name}</Typography>
                    <Chip size="small" label={admin.role} sx={{ marginTop: '4px' }} />
                </Box>
            </Box>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', rowGap: 2 }}>
                <TextField
                    name="name" size="small" label={formatMessage({ id: 'name' })}
                    value={values.name} onChange={handleChange}
                    error={!!(errors.name && touched.name)} helperText={touched.name && errors.name}
                />
                <TextField
                    name="phone" size="small" label={formatMessage({ id: 'phoneNumber' })}
                    value={values.phone} onChange={handleChange}
                    error={!!(errors.phone && touched.phone)} helperText={touched.phone && errors.phone}
                />
                <TextField
                    size="small" label={formatMessage({ id: 'email' })}
                    value={admin.email} disabled
                    helperText={formatMessage({ id: 'viewOnlyField' })}
                />
                <TextField
                    size="small" label={formatMessage({ id: 'role' })}
                    value={admin.role} disabled
                    helperText={formatMessage({ id: 'viewOnlyField' })}
                />
                <Typography variant="caption" sx={{ color: 'var(--body)' }}>
                    {formatMessage({ id: 'memberSince' })}: {formatDate(admin.createdAt)}
                </Typography>
                <Button variant="contained" type="submit" disabled={isSubmitting || !dirty} sx={{ justifySelf: 'start' }}>
                    {formatMessage({ id: isSubmitting ? 'processing' : 'save' })}
                </Button>
            </Box>
        </Box>
    );
}

Profile.getLayout = function getLayout(page: ReactNode) {
    return withAdminLayout(page);
};
