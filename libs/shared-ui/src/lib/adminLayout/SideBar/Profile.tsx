import { apiMiddleware, errorHandling } from "@easy-messe/libs/utils";
import { Avatar, Box, Button, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useIntl } from "react-intl";

export interface ProfileProps {
    name: string;
    email: string;
}
export default function Profile({
    profile: {
        name,
        email
    }
}: {
    profile: ProfileProps
}) {
    const { formatMessage } = useIntl()
    const { push } = useRouter()
    const [isDisconnectionLoading, setIsDisconnectionLoading] = useState(false)
    return (
        <Box sx={{
            display: 'grid',
            rowGap: 1,
            alignSelf: 'end'
        }}>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                alignItems: 'center',
                columnGap: 1
            }}>
                <Avatar
                    alt={name}
                    src={name}
                />
                <Box>
                    <Typography
                        variant='body2'
                        sx={{
                            fontWeight: 700
                        }}
                    >
                        {name}
                    </Typography>
                    <Typography
                        variant='caption'
                        sx={{
                            fontWeight: 500
                        }}
                    >
                        {email}
                    </Typography>
                </Box>
            </Box>
            <Button
                variant='outlined'
                onClick={() => {
                    setIsDisconnectionLoading(true);
                    apiMiddleware({
                        url: '/auth/logout',
                        method: 'POST',
                        data: {
                            refreshToken: localStorage.getItem('refreshToken')
                        },
                        onSuccess: (response: any) => {
                            const { code } = response;
                            if (code === 200) {
                                localStorage.removeItem('token')
                                localStorage.removeItem('refreshToken')
                                push('/login')
                            }
                        },
                        onFailure: (error) => {
                            errorHandling({ error, formatMessage, redirect: push })
                        },
                        onFinally: () => setIsDisconnectionLoading(false)
                    })
                }}
                disabled={isDisconnectionLoading}
            >
                {isDisconnectionLoading
                    ? <CircularProgress size={20} />
                    : formatMessage({ id: 'logout' })}
            </Button>
        </Box>
    );
}
