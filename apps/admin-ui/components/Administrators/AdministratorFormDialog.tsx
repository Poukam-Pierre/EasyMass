import { Autocomplete, Box, Button, Dialog, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import * as yup from 'yup';
import api, { apiErrorMessage } from "../../lib/api";

interface AdministratorFormDialogProps {
    isOpen: boolean;
    handleClose: () => void;
    onCreated: () => void;
}

const ROLE_OPTIONS = ['ADMIN', 'ENGINEER'] as const;

export default function AdministratorFormDialog({ isOpen, handleClose, onCreated }: AdministratorFormDialogProps) {
    const { formatMessage } = useIntl()

    const { handleChange, handleSubmit, errors, touched, values, setFieldValue, resetForm, isSubmitting } = useFormik({
        initialValues: { name: '', email: '', password: '', phone: '', role: 'ADMIN' as typeof ROLE_OPTIONS[number] },
        validationSchema: yup.object().shape({
            name: yup.string().required(),
            email: yup.string().email(formatMessage({ id: 'invalidEmail' })).required(formatMessage({ id: 'emailWarningMsg' })),
            phone: yup.string().required(),
            password: yup.string()
                .min(5, formatMessage({ id: 'minPassword' }))
                .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/, { message: formatMessage({ id: 'passwordCarateristics' }) })
                .required(formatMessage({ id: 'fillPassword' })),
        }),
        onSubmit: async (formValues) => {
            try {
                await api.post('/auth/signup-admin', formValues);
                toast.success(formatMessage({ id: 'saved' }));
                resetForm();
                onCreated();
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
                <Typography variant="h1" textAlign="center">{formatMessage({ id: 'createAdministrator' })}</Typography>
                <TextField
                    name="name" placeholder={formatMessage({ id: 'name' })} size="small"
                    value={values.name} onChange={handleChange}
                    error={!!(errors.name && touched.name)} helperText={touched.name && errors.name}
                />
                <TextField
                    name="email" type="email" placeholder="Email" size="small"
                    value={values.email} onChange={handleChange}
                    error={!!(errors.email && touched.email)} helperText={touched.email && errors.email}
                />
                <TextField
                    name="phone" placeholder={formatMessage({ id: 'phoneNumber' })} size="small"
                    value={values.phone} onChange={handleChange}
                    error={!!(errors.phone && touched.phone)} helperText={touched.phone && errors.phone}
                />
                <TextField
                    name="password" type="password" placeholder={formatMessage({ id: 'password' })} size="small"
                    value={values.password} onChange={handleChange}
                    error={!!(errors.password && touched.password)} helperText={touched.password && errors.password}
                />
                <Autocomplete
                    options={[...ROLE_OPTIONS]}
                    value={values.role}
                    onChange={(_, role) => setFieldValue('role', role)}
                    renderInput={(params) => <TextField {...params} size="small" placeholder={formatMessage({ id: 'role' })} />}
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '20px', marginTop: '10px' }}>
                    <Button variant="outlined" type="button" onClick={handleClose}>{formatMessage({ id: 'cancel' })}</Button>
                    <Button variant="contained" type="submit" disabled={isSubmitting}>
                        {formatMessage({ id: isSubmitting ? 'processing' : 'create' })}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
