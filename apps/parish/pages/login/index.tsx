import { Footer, LoginCretentials } from '@easy-messe/shared-ui';
import { Box } from "@mui/material";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
    const { login, accessToken, isLoading } = useAuth()
    const { push } = useRouter()
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    useEffect(() => {
        if (!isLoading && accessToken) {
            push('/')
        }
    }, [isLoading, accessToken, push])

    const handleSubmit = async ({ email, password }: { email: string; password: string }) => {
        setErrorMessage('')
        setIsSubmitting(true)
        const result = await login(email, password)
        setIsSubmitting(false)
        if (result.ok) {
            push('/')
        } else {
            setErrorMessage(result.message)
        }
    }

    return (
        <Box sx={{
            height: '100svh',
            display: 'grid',
            gridTemplateRows: '1fr auto'
        }}>
            <LoginCretentials
                onSubmit={handleSubmit}
                errorMessage={errorMessage}
                isSubmitting={isSubmitting}
            />
            <Footer />
        </Box>
    );
}
