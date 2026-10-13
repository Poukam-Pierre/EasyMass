import { useDispatchLanguage } from "@easy-messe/libs/theme";
import { Avatar, Box, Button, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { ReactNode, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import * as yup from 'yup';
import { withParishLayout } from "../../components/withParishLayout";
import { useAuth } from "../../contexts/AuthContext";
import api, { apiErrorMessage } from "../../lib/api";

export default function Profile() {
    const { formatMessage, formatDate } = useIntl()
    const { parish, setParish } = useAuth()
    const languageDispatch = useDispatchLanguage()
    const [isSavingLanguage, setIsSavingLanguage] = useState(false)

    const handleLanguageChange = async (language: 'EN' | 'FR') => {
        if (!parish || language === parish.language) return;
        setIsSavingLanguage(true)
        try {
            await api.patch('/auth/language', { language });
            setParish({ ...parish, language });
            languageDispatch({ type: language === 'FR' ? 'USE_FRENCH' : 'USE_ENGLISH' });
            toast.success(formatMessage({ id: 'saved' }));
        } catch (error) {
            toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
        } finally {
            setIsSavingLanguage(false)
        }
    }

    const profileForm = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: parish?.name ?? '',
            managerName: parish?.managerName ?? '',
            phone: parish?.phone ?? '',
        },
        validationSchema: yup.object().shape({
            name: yup.string().required(),
            managerName: yup.string().required(),
            phone: yup.string().required(),
        }),
        onSubmit: async (formValues) => {
            if (!parish) return;
            try {
                const { data } = await api.patch(`/parishes/${parish.parishId}`, formValues);
                setParish({ ...parish, name: data.name, managerName: data.managerName, phone: data.phone });
                toast.success(formatMessage({ id: 'saved' }));
            } catch (error) {
                toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
            }
        },
    });

    const payoutForm = useFormik({
        enableReinitialize: true,
        initialValues: { payoutNumber: parish?.payoutNumber ?? '' },
        validationSchema: yup.object().shape({
            payoutNumber: yup.string().required(),
        }),
        onSubmit: async (formValues) => {
            if (!parish) return;
            try {
                const { data } = await api.patch(`/parishes/${parish.parishId}/payout-method`, formValues);
                setParish({ ...parish, payoutNumber: data.payoutNumber });
                toast.success(formatMessage({ id: 'saved' }));
            } catch (error) {
                toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
            }
        },
    });

    if (!parish) return null;

    return (
        <Box sx={{ display: 'grid', rowGap: '32px', maxWidth: '480px' }}>
            <Typography variant="h2" color="primary" sx={{ paddingBottom: 0 }}>
                {formatMessage({ id: 'profile' })}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', columnGap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'var(--primary)' }}>
                    {parish.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                    <Typography sx={{ fontWeight: 600 }}>{parish.name}</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--body)' }}>{parish.managerName}</Typography>
                </Box>
            </Box>
            <Box component="form" onSubmit={profileForm.handleSubmit} sx={{ display: 'grid', rowGap: 2 }}>
                <TextField
                    name="name" size="small" label={formatMessage({ id: 'name' })}
                    value={profileForm.values.name} onChange={profileForm.handleChange}
                    error={!!(profileForm.errors.name && profileForm.touched.name)}
                    helperText={profileForm.touched.name && profileForm.errors.name}
                />
                <TextField
                    name="managerName" size="small" label={formatMessage({ id: 'leadParishName' })}
                    value={profileForm.values.managerName} onChange={profileForm.handleChange}
                    error={!!(profileForm.errors.managerName && profileForm.touched.managerName)}
                    helperText={profileForm.touched.managerName && profileForm.errors.managerName}
                />
                <TextField
                    name="phone" size="small" label={formatMessage({ id: 'phoneNumber' })}
                    value={profileForm.values.phone} onChange={profileForm.handleChange}
                    error={!!(profileForm.errors.phone && profileForm.touched.phone)}
                    helperText={profileForm.touched.phone && profileForm.errors.phone}
                />
                <TextField
                    size="small" label={formatMessage({ id: 'email' })}
                    value={parish.email} disabled
                    helperText={formatMessage({ id: 'viewOnlyField' })}
                />
                <Typography variant="caption" sx={{ color: 'var(--body)' }}>
                    {formatMessage({ id: 'memberSince' })}: {formatDate(parish.createdAt)}
                </Typography>
                <Button
                    variant="contained" type="submit"
                    disabled={profileForm.isSubmitting || !profileForm.dirty}
                    sx={{ justifySelf: 'start' }}
                >
                    {formatMessage({ id: profileForm.isSubmitting ? 'processing' : 'save' })}
                </Button>
            </Box>

            <Box component="form" onSubmit={payoutForm.handleSubmit} sx={{ display: 'grid', rowGap: 2 }}>
                <Typography variant="h4">{formatMessage({ id: 'payoutNumber' })}</Typography>
                <Typography variant="body2" sx={{ color: 'var(--body)' }}>
                    {formatMessage({ id: 'payoutNumberHint' })}
                </Typography>
                <TextField
                    name="payoutNumber" size="small" placeholder={formatMessage({ id: 'payoutNumber' })}
                    value={payoutForm.values.payoutNumber} onChange={payoutForm.handleChange}
                    error={!!(payoutForm.errors.payoutNumber && payoutForm.touched.payoutNumber)}
                    helperText={payoutForm.touched.payoutNumber && payoutForm.errors.payoutNumber}
                />
                <Button
                    variant="contained" type="submit"
                    disabled={payoutForm.isSubmitting}
                    sx={{ justifySelf: 'start' }}
                >
                    {formatMessage({ id: payoutForm.isSubmitting ? 'processing' : 'save' })}
                </Button>
            </Box>

            <Box sx={{ display: 'grid', rowGap: 2 }}>
                <Typography variant="h4">{formatMessage({ id: 'settings' })}</Typography>
                <Select
                    size="small"
                    value={parish.language}
                    disabled={isSavingLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value as 'EN' | 'FR')}
                    sx={{ justifySelf: 'start', minWidth: '160px' }}
                >
                    <MenuItem value="EN">English</MenuItem>
                    <MenuItem value="FR">Français</MenuItem>
                </Select>
            </Box>
        </Box>
    );
}

Profile.getLayout = function getLayout(page: ReactNode) {
    return withParishLayout(page);
};
