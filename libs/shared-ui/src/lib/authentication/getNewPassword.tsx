import { Box, Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import HeroHeader from "./HeroHeader";
import { useIntl } from "react-intl";
import { useState } from "react";
import { useFormik } from "formik";
import * as yup from 'yup';


export function GetNewPassword() {
    const { formatMessage } = useIntl()
    const [isVisible, setIsVisible] = useState<boolean>(false)


    const {
        handleChange,
        handleSubmit,
        errors,
        touched,
        values
    } = useFormik({
        initialValues: {
            newPassword: '',
            confirmPassword: ''
        },
        onSubmit: (values, { resetForm }) => {
            // TODO send password data to API to change password
            console.log(values)
            resetForm()
        },
        validationSchema: yup.object().shape({
            newPassword: yup
                .string()
                .min(5,
                    formatMessage({ id: 'min 5 caractères,au moins 1 lettre et 1 chiffre' })
                )
                .max(10, formatMessage({ id: 'Max 10 caratères, au moins 1 lettre et 1 chiffre' }))
                .matches(/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d][A-Za-z\d!@#$%^&*()_+]{4,10}$/, {
                    message: formatMessage({ id: 'Au moins 1 lettre et 1 chiffre' }),
                })
                .required(formatMessage({ id: 'Nouveau mot de passe obligatoire' })),
            confirmPassword: yup
                .string()
                .oneOf([yup.ref('newPassword'), undefined], formatMessage({ id: 'Mot de passe non identique' }))
                .required(formatMessage({ id: 'Entrer votre nouveau mot de passe' })),
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
                getActionMsg={formatMessage({ id: 'fillPassword' })}
            />
            <Box
                sx={{
                    display: 'grid',
                    rowGap: 2
                }}
                component='form'
                onSubmit={handleSubmit}
            >
                <TextField
                    name="newPassword"
                    size="small"
                    value={values.newPassword}
                    placeholder={formatMessage({ id: 'newPassword' })}
                    type={isVisible ? 'text' : 'password'}
                    error={errors.newPassword && touched.newPassword ? true : false}
                    helperText={(errors.newPassword && touched.newPassword) && errors.newPassword}
                    onChange={handleChange}

                />
                <TextField
                    name="confirmPassword"
                    size="small"
                    value={values.confirmPassword}
                    placeholder={formatMessage({ id: 'confirmPassword' })}
                    type={isVisible ? 'text' : 'password'}
                    error={errors.confirmPassword && touched.confirmPassword ? true : false}
                    helperText={(errors.confirmPassword && touched.confirmPassword) && errors.confirmPassword}
                    onChange={handleChange}

                />
                <FormControlLabel
                    label={formatMessage({ id: 'Get password visible' })}
                    control={
                        <Checkbox
                            checked={isVisible}
                            onChange={(event) => setIsVisible(event.target.checked)}
                        />
                    }
                />
                <Button
                    variant="contained"
                    type="submit"
                >
                    {formatMessage({ id: 'save' })}
                </Button>
            </Box>
        </Box>

    )
}