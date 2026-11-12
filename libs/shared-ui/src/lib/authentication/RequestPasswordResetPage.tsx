import { extractApiErrorKey } from "@easy-messe/libs/utils";
import { Box } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { useIntl } from "react-intl";
import { Footer } from "../adminLayout/Footer";
import { GetMailVerification } from "./getMailVerification";
import { StatusScreen } from "./StatusScreen";

export interface RequestPasswordResetPageProps {
    /** The portal's own request route, e.g. '/password-reset/request-parish'
     * — scoped per portal, like login. */
    requestPath: string;
}

const REQUEST_ERROR_KEYS = new Set(['tooManyAttempts']);

/** "Forgot password?" page: asks for the account email, then always shows
 * the same "check your inbox" screen — the backend doesn't say whether the
 * email has an account, and neither does this page. */
export function RequestPasswordResetPage({ requestPath }: RequestPasswordResetPageProps) {
    const { formatMessage } = useIntl()
    const [isSent, setIsSent] = useState<boolean>(false)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>('')

    const handleSubmit = async (email: string) => {
        setErrorMessage('')
        setIsSubmitting(true)
        try {
            // Plain axios: there's no session on this page.
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${requestPath}`, { email })
            setIsSent(true)
        } catch (error) {
            const key = extractApiErrorKey(error, REQUEST_ERROR_KEYS)
            setErrorMessage(formatMessage({ id: key ?? 'genericErrorMsg' }))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Box sx={{
            height: '100svh',
            display: 'grid',
            gridTemplateRows: '1fr auto'
        }}>
            {isSent ? (
                <StatusScreen variant="mail" titleId="resetEmailSentTitle" messageId="resetEmailSentMessage" />
            ) : (
                <GetMailVerification
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    errorMessage={errorMessage}
                />
            )}
            <Footer />
        </Box>
    );
}
