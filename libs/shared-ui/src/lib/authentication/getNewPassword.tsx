import { ACCOUNT_PASSWORD_PATTERN } from "@easy-messe/libs/utils";
import checkIcon from '@iconify-icons/ph/check-light';
import copyIcon from '@iconify-icons/ph/copy-light';
import { Icon } from "@iconify/react";
import { Box, Button, Checkbox, FormControlLabel, FormHelperText, IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import HeroHeader from "./HeroHeader";
import { useIntl } from "react-intl";
import { useState } from "react";
import { useFormik } from "formik";
import * as yup from 'yup';

export interface GetNewPasswordProps {
    /** Receives the confirmed new password. The caller owns the API call
     * and what happens after it (e.g. redirecting to login). */
    onSubmit?: (password: string) => void | Promise<void>;
    errorMessage?: string;
    isSubmitting?: boolean;
    /** i18n key for the heading — the same form serves several flows
     * (account setup, password recovery). */
    greetingId?: string;
    /** i18n key for the line under the heading. */
    actionMsgId?: string;
    /** A password to pre-fill (both fields) and show in clear, which the
     * user can keep as-is or overwrite with their own. */
    initialPassword?: string;
}

export function GetNewPassword({
    onSubmit,
    errorMessage,
    isSubmitting,
    greetingId = 'passwordRecovery',
    actionMsgId = 'fillPassword',
    initialPassword = '',
}: GetNewPasswordProps = {}) {
    const { formatMessage } = useIntl()
    // A suggested password is useless if the user can't read it.
    const [isVisible, setIsVisible] = useState<boolean>(!!initialPassword)
    const [isCopied, setIsCopied] = useState<boolean>(false)


    const {
        handleChange,
        handleSubmit,
        errors,
        touched,
        values
    } = useFormik({
        initialValues: {
            newPassword: initialPassword,
            confirmPassword: initialPassword
        },
        onSubmit: async (values) => {
            await onSubmit?.(values.newPassword)
        },
        validationSchema: yup.object().shape({
            newPassword: yup
                .string()
                .matches(ACCOUNT_PASSWORD_PATTERN, {
                    message: formatMessage({ id: 'accountPasswordRule' })
                })
                .required(formatMessage({ id: 'fillPassword' })),
            confirmPassword: yup
                .string()
                .oneOf([yup.ref('newPassword'), undefined], formatMessage({ id: 'comparePassword' }))
                .required(formatMessage({ id: 'fillPassword' })),
        }),
    })

    const copyPassword = async () => {
        try {
            await navigator.clipboard.writeText(values.newPassword)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch {
            // Clipboard can be unavailable (permissions, insecure context) —
            // the password is visible on screen, so copying stays optional.
        }
    }

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
                greeting={formatMessage({ id: greetingId })}
                getActionMsg={formatMessage({ id: actionMsgId })}
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
                    helperText={(errors.newPassword && touched.newPassword) ? errors.newPassword : formatMessage({ id: 'accountPasswordRule' })}
                    onChange={handleChange}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <Tooltip title={formatMessage({ id: isCopied ? 'copied' : 'copy' })}>
                                    <IconButton size="small" onClick={copyPassword} disabled={!values.newPassword} edge="end">
                                        <Icon icon={isCopied ? checkIcon : copyIcon} fontSize={18} />
                                    </IconButton>
                                </Tooltip>
                            </InputAdornment>
                        ),
                    }}

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
                    label={formatMessage({ id: 'passwordVisible' })}
                    control={
                        <Checkbox
                            checked={isVisible}
                            onChange={(event) => setIsVisible(event.target.checked)}
                        />
                    }
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
                    {formatMessage({ id: isSubmitting ? 'processing' : 'save' })}
                </Button>
            </Box>
        </Box>

    )
}
