import { Box, Button, FormHelperText, TextField } from "@mui/material";
import { useFormik } from "formik";
import { useIntl } from "react-intl";
import * as yup from 'yup';
import HeroHeader from "./HeroHeader";

export interface GetMailVerificationProps {
    /** Receives the email entered. The caller owns the API call and what
     * happens after it. */
    onSubmit?: (email: string) => void | Promise<void>;
    errorMessage?: string;
    isSubmitting?: boolean;
}

export function GetMailVerification({ onSubmit, errorMessage, isSubmitting }: GetMailVerificationProps = {}) {
    const { formatMessage } = useIntl()

    const { handleChange, handleSubmit, errors, touched, values } = useFormik({
        initialValues: {
            email: ''
        },
        onSubmit: async (values) => {
            await onSubmit?.(values.email.trim())
        },
        validationSchema: yup.object().shape({
            email: yup.string()
                .email(formatMessage({ id: 'fillEmail' }))
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
                getActionMsg={formatMessage({ id: 'resetRequestHint' })}
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
                    name="email"
                    size="small"
                    placeholder="Email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    error={errors.email && touched.email ? true : false}
                    helperText={(errors.email && touched.email) && errors.email}
                />
                {errorMessage && (
                    <FormHelperText error sx={{ textAlign: 'center', fontSize: '14px' }}>
                        {errorMessage}
                    </FormHelperText>
                )}
                <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {formatMessage({ id: isSubmitting ? 'processing' : 'send' })}
                </Button>
            </Box>
        </Box>

    );
}
