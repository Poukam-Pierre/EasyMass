import { extractApiErrorKey } from "@easy-messe/libs/utils";
import { Footer, GetNewPassword } from "@easy-messe/shared-ui";
import { Box, CircularProgress } from "@mui/material";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import StatusScreen from "../../components/StatusScreen";
import { apiErrorMessage } from "../../lib/api";

const SETUP_ERROR_KEYS = new Set(['setupLinkInvalid', 'tooManyAttempts']);

// Plain axios, not the authenticated `api` instance — there's no session
// yet, and its 401 handling would bounce to /login.
const setupUrl = `${process.env.NEXT_PUBLIC_API_URL}/account-setup`;

type SetupState =
    | { step: 'checking' }
    | { step: 'invalid' }
    | { step: 'ready'; suggestedPassword: string };

/** Landing page of the emailed account-setup link. Opening it only checks
 * the link and suggests a password (mail scanners open links too, so this
 * must not change anything); saving is what verifies the parish's email
 * and sets the password — the suggested one or their own. */
export default function AccountSetup() {
    const { formatMessage } = useIntl()
    const { query, isReady, push } = useRouter()
    const [state, setState] = useState<SetupState>({ step: 'checking' })
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const token = typeof query.token === 'string' ? query.token : ''

    const messageFor = (error: unknown) => {
        const key = extractApiErrorKey(error, SETUP_ERROR_KEYS)
        return key
            ? formatMessage({ id: key })
            : apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' }))
    }

    useEffect(() => {
        if (!isReady) return
        if (!token) {
            setState({ step: 'invalid' })
            return
        }
        axios.post(`${setupUrl}/preview`, { token })
            .then(({ data }) => setState({ step: 'ready', suggestedPassword: data.suggestedPassword }))
            .catch((error) => {
                if (extractApiErrorKey(error, SETUP_ERROR_KEYS) === 'setupLinkInvalid') {
                    setState({ step: 'invalid' })
                } else {
                    // Rate limit / network: the link itself may be fine, so
                    // don't call it invalid — let them retry by reloading.
                    toast.error(messageFor(error))
                }
            })
    }, [isReady, token]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = async (password: string) => {
        setErrorMessage('')
        setIsSubmitting(true)
        try {
            await axios.post(setupUrl, { token, password })
            toast.success(formatMessage({ id: 'accountSetupSuccess' }))
            push('/login')
        } catch (error) {
            if (extractApiErrorKey(error, SETUP_ERROR_KEYS) === 'setupLinkInvalid') {
                setState({ step: 'invalid' })
            } else {
                setErrorMessage(messageFor(error))
            }
            setIsSubmitting(false)
        }
    }

    return (
        <Box sx={{
            height: '100svh',
            display: 'grid',
            gridTemplateRows: '1fr auto'
        }}>
            <Head>
                {/* The URL carries the setup token — never leak it to another
                    site through the Referer header. */}
                <meta name="referrer" content="no-referrer" />
            </Head>
            {state.step === 'checking' && (
                <Box sx={{ display: 'grid', placeItems: 'center' }}>
                    <CircularProgress />
                </Box>
            )}
            {state.step === 'invalid' && (
                <StatusScreen titleId="setupLinkInvalidTitle" messageId="setupLinkInvalid" />
            )}
            {state.step === 'ready' && (
                <GetNewPassword
                    greetingId="accountSetupTitle"
                    actionMsgId="suggestedPasswordHint"
                    initialPassword={state.suggestedPassword}
                    onSubmit={handleSubmit}
                    errorMessage={errorMessage}
                    isSubmitting={isSubmitting}
                />
            )}
            <Footer />
        </Box>
    );
}
