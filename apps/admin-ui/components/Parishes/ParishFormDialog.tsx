import { Autocomplete, Box, Button, Dialog, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import * as yup from 'yup';
import api, { apiErrorMessage } from "../../lib/api";

export interface City {
    city_id: string;
    city_name: string;
}

interface ParishFormValues {
    name: string;
    phone: string;
    managerName: string;
    email: string;
    password: string;
    city: City | null;
}

interface ParishFormDialogProps {
    isOpen: boolean;
    handleClose: () => void;
    onCreated: () => void;
}

export default function ParishFormDialog({ isOpen, handleClose, onCreated }: ParishFormDialogProps) {
    const { formatMessage } = useIntl()
    const [cities, setCities] = useState<City[]>([])

    useEffect(() => {
        if (!isOpen) return
        api.get('/cities')
            .then(({ data }) => setCities(data))
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
    }, [isOpen, formatMessage])

    const { handleChange, handleSubmit, errors, touched, values, setFieldValue, resetForm, isSubmitting } =
        useFormik<ParishFormValues>({
            initialValues: { name: '', phone: '', managerName: '', email: '', password: '', city: null },
            validationSchema: yup.object().shape({
                name: yup.string().required(formatMessage({ id: 'parishNameWarningMsg' })),
                phone: yup.string().required(formatMessage({ id: 'parishPhoneWarningMsg' })),
                managerName: yup.string().required(formatMessage({ id: 'leadParishNameWarningMsg' })),
                email: yup.string().email(formatMessage({ id: 'invalidEmail' })).required(formatMessage({ id: 'emailWarningMsg' })),
                password: yup.string()
                    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{4,}$/, {
                        message: formatMessage({ id: 'passwordCarateristics' })
                    })
                    .required(formatMessage({ id: 'fillPassword' })),
                city: yup.object().nullable().required(formatMessage({ id: 'parishCityWarningMsg' })),
            }),
            onSubmit: async (formValues) => {
                try {
                    await api.post('/parishes/new', {
                        name: formValues.name,
                        phone: formValues.phone,
                        managerName: formValues.managerName,
                        email: formValues.email,
                        password: formValues.password,
                        city: { city_id: formValues.city?.city_id, city_name: formValues.city?.city_name },
                    });
                    toast.success(formatMessage({ id: 'parishCreatedSuccess' }));
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
            <Box sx={{ padding: '48px 60px', minWidth: '520px', display: 'grid', rowGap: 2 }} component="form" onSubmit={handleSubmit}>
                <Typography variant="h1" textAlign="center">{formatMessage({ id: 'createParish' })}</Typography>
                <TextField
                    name="name" placeholder={formatMessage({ id: 'parishName' })} size="small"
                    value={values.name} onChange={handleChange}
                    error={!!(errors.name && touched.name)} helperText={touched.name && errors.name}
                />
                <TextField
                    name="managerName" placeholder={formatMessage({ id: 'leadParishName' })} size="small"
                    value={values.managerName} onChange={handleChange}
                    error={!!(errors.managerName && touched.managerName)} helperText={touched.managerName && errors.managerName}
                />
                <TextField
                    name="phone" placeholder={formatMessage({ id: 'parishPhoneNumber' })} size="small"
                    value={values.phone} onChange={handleChange}
                    error={!!(errors.phone && touched.phone)} helperText={touched.phone && errors.phone}
                />
                <TextField
                    name="email" type="email" placeholder={formatMessage({ id: 'parishMailAddress' })} size="small"
                    value={values.email} onChange={handleChange}
                    error={!!(errors.email && touched.email)} helperText={touched.email && errors.email}
                />
                <TextField
                    name="password" type="password" placeholder={formatMessage({ id: 'password' })} size="small"
                    value={values.password} onChange={handleChange}
                    error={!!(errors.password && touched.password)} helperText={touched.password && errors.password}
                />
                <Autocomplete
                    options={cities}
                    getOptionLabel={(city) => city.city_name}
                    value={values.city}
                    onChange={(_, city) => setFieldValue('city', city)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder={formatMessage({ id: 'parishCity' })}
                            size="small"
                            error={!!(errors.city && touched.city)}
                            helperText={touched.city && (errors.city as string)}
                        />
                    )}
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '20px', marginTop: '10px' }}>
                    <Button variant="outlined" onClick={handleClose} type="button">
                        {formatMessage({ id: 'cancel' })}
                    </Button>
                    <Button variant="contained" type="submit" disabled={isSubmitting}>
                        {formatMessage({ id: isSubmitting ? 'processing' : 'create' })}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
