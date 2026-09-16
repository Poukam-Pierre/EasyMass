import { Box, TextField, Typography } from "@mui/material";
import { ChangeEvent } from "react";
import { useIntl } from "react-intl";

interface PasswordConfirmFieldProps {
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    error?: string | false;
    touched?: boolean;
    /** i18n key for the line explaining why this specific action asks for
     * the password again — differs per caller (a ledger correction vs. a
     * withdrawal), the field itself doesn't. */
    helpTextId: string;
}

/** Step-up re-authentication field — shared by every dialog that re-proves
 * the caller's identity right before a dangerous action (ledger
 * correction, withdrawal, ...), so the "confirm your password" UI exists
 * exactly once instead of once per dialog. Pairs with
 * verifyCurrentPassword on the backend, which does the actual check. */
export function PasswordConfirmField({ value, onChange, error, touched, helpTextId }: PasswordConfirmFieldProps) {
    const { formatMessage } = useIntl()
    return (
        <Box sx={{ display: 'grid', rowGap: 1 }}>
            <Typography variant="body2" sx={{ color: 'var(--body)' }}>
                {formatMessage({ id: helpTextId })}
            </Typography>
            <TextField
                name="password" type="password" placeholder={formatMessage({ id: 'password' })} size="small"
                value={value} onChange={onChange}
                error={!!(error && touched)} helperText={touched && error}
            />
        </Box>
    );
}
