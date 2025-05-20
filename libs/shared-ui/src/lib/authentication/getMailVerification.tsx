import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { useIntl } from "react-intl";
import * as yup from 'yup';
import HeroHeader from "./HeroHeader";
import { apiMiddleware, errorHandling } from "@easy-messe/libs/utils";
import { toast } from "react-toastify";
import { useState } from "react";

export function GetMailVerification() {
    const { formatMessage } = useIntl()
    const [isMailSend, setIsMailSend] = useState<boolean>(false);
    const [isPendingCheck, setIsPendingCheck] = useState<boolean>(false);


    const { handleChange, handleSubmit, errors, touched } = useFormik({
        initialValues: {
            email: ''
        },
        onSubmit: (values) => {
            setIsPendingCheck(true)
            apiMiddleware({
                url: '/auth/forgot-password',
                method: 'POST',
                data: {
                    email: values.email
                },
                onSuccess: (response: any) => {
                    toast.success(formatMessage({ id: response.message }))
                    setIsMailSend(true)
                },
                onFailure: (error) => {
                    errorHandling({
                        error,
                        formatMessage,
                    })
                },
                onFinally: () => {
                    setIsPendingCheck(false)
                }
            })
        },
        validationSchema: yup.object().shape({
            email: yup.string()
                .required(formatMessage({ id: 'fillEmail' }))
        }),
    })
    return (
        <Box sx={{
            width: 464,
            display: 'grid',
            height: 'fit-content',
            marginTop: '70px',
            justifySelf: 'center',
            rowGap: 3
        }}>
            <HeroHeader
                slogan={formatMessage({ id: 'slogan' })}
                greeting={formatMessage({ id: 'passwordRecovery' })}
                getActionMsg={formatMessage({ id: 'fillEmail' })}
            />
            <Typography variant="h5"
                sx={{
                    color: 'success.main',
                    textAlign: 'center',
                    display: isMailSend ? 'inherit' : 'none'
                }}>
                {formatMessage({ id: 'sendOTPlinkDone' })}
            </Typography>
            <Box
                sx={{
                    display: 'grid',
                    rowGap: 2
                }}
                component='form'
                onSubmit={handleSubmit}
            >
                <TextField
                    name="email"
                    size="small"
                    placeholder="Email"
                    type="email"
                    onChange={handleChange}
                    error={errors.email && touched.email ? true : false}
                    helperText={(errors.email && touched.email) && errors.email}
                    disabled={isPendingCheck}
                />
                <Button
                    variant="contained"
                    type="submit"
                    disabled={isPendingCheck}
                >
                    {isPendingCheck ?
                        <CircularProgress size={20} /> :
                        formatMessage({ id: 'send' })
                    }
                </Button>
            </Box>
        </Box>

    );
}
