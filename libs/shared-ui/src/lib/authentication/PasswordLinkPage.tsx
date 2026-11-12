import { extractApiErrorKey } from "@easy-messe/libs/utils";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import { Footer } from "../adminLayout/Footer";
import { GetNewPassword } from "./getNewPassword";
import { StatusScreen } from "./StatusScreen";

export interface PasswordLinkPageProps {
    /** API path of the flow, e.g. '/account-setup' or '/password-reset':
     * `${apiPath}/preview` checks the link, `${apiPath}` sets the password. */
    apiPath: string;
    /** Error key the backend answers with for an invalid or expired link;
     * also the message shown for it. */
    invalidLinkKey: string;
    invalidLinkTitleId: string;
    greetingId: string;
    /** Toast shown on success, before going to the login page. */
    successMsgId: string;
}

type LinkState =
    | { step: 'checking' }
    | { step: 'invalid' }
    /** The link couldn't be checked (rate limit, network, server) — it
     * may be fine, so offer a retry rather than calling it invalid. */
    | { step: 'error'; message: string }
    | { step: 'ready'; suggestedPassword: string };

/** Readable text of an API error, for errors without a translated key. */
function apiMessage(error: unknown): string | undefined {
    if (!axios.isAxiosError(error)) return undefined;
    const message = (error.response?.data as { message?: string | string[] } | undefined)?.message;
    return Array.isArray(message) ? message[0] : message;
}

/** Landing page of an emailed one-time password link (account setup,
 * password reset). Opening it only checks the link and suggests a password
 * (mail scanners open links too, so this must not change anything); saving
 * is what sets the password — the suggested one or the owner's own. */
export function PasswordLinkPage({
    apiPath,
    invalidLinkKey,
    invalidLinkTitleId,
    greetingId,
    successMsgId,
}: PasswordLinkPageProps) {
    const { formatMessage } = useIntl()
    const { query, isReady, push } = useRouter()
    const [state, setState] = useState<LinkState>({ step: 'checking' })
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const token = typeof query.token === 'string' ? query.token : ''
    // Plain axios, not an app's authenticated `api` instance — there's no
    // session here, and its 401 handling would bounce to /login.
    const url = `${process.env.NEXT_PUBLIC_API_URL}${apiPath}`
    const knownKeys = new Set([invalidLinkKey, 'tooManyAttempts'])

    const messageFor = (error: unknown) => {
        const key = extractApiErrorKey(error, knownKeys)
        return key
            ? formatMessage({ id: key })
            : apiMessage(error) ?? formatMessage({ id: 'genericErrorMsg' })
    }

    const checkLink = () => {
        if (!token) {
            setState({ step: 'invalid' })
            return
        }
        setState({ step: 'checking' })
        axios.post(`${url}/preview`, { token })
            .then(({ data }) => setState({ step: 'ready', suggestedPassword: data.suggestedPassword }))
            .catch((error) => {
                if (extractApiErrorKey(error, knownKeys) === invalidLinkKey) {
                    setState({ step: 'invalid' })
                } else {
                    setState({ step: 'error', message: messageFor(error) })
                }
            })
    }

    useEffect(() => {
        if (isReady) checkLink()
    }, [isReady, token]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = async (password: string) => {
        setErrorMessage('')
        setIsSubmitting(true)
        try {
            await axios.post(url, { token, password })
            toast.success(formatMessage({ id: successMsgId }))
            push('/login')
        } catch (error) {
            if (extractApiErrorKey(error, knownKeys) === invalidLinkKey) {
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
                {/* The URL carries the token — never leak it to another
                    site through the Referer header. */}
                <meta name="referrer" content="no-referrer" />
            </Head>
            {state.step === 'checking' && (
                <Box sx={{ display: 'grid', placeItems: 'center' }}>
                    <CircularProgress />
                </Box>
            )}
            {state.step === 'invalid' && (
                <StatusScreen titleId={invalidLinkTitleId} messageId={invalidLinkKey} />
            )}
            {state.step === 'error' && (
                <Box sx={{
                    display: 'grid',
                    justifyItems: 'center',
                    alignContent: 'baseline',
                    rowGap: 3,
                    width: 464,
                    marginTop: '120px',
                    justifySelf: 'center',
                    textAlign: 'center',
                }}>
                    <Typography variant="h2">
                        {formatMessage({ id: 'linkCheckFailedTitle' })}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'var(--body)' }}>
                        {state.message}
                    </Typography>
                    <Button variant="contained" onClick={checkLink}>
                        {formatMessage({ id: 'retry' })}
                    </Button>
                </Box>
            )}
            {state.step === 'ready' && (
                <GetNewPassword
                    greetingId={greetingId}
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
