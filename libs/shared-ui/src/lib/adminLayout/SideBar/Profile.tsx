import { Avatar, Box, Typography, Button } from "@mui/material";
import { useRouter } from "next/router";
import { useIntl } from "react-intl";

export interface ProfileProps {
    name: string;
    email: string;
}
export default function Profile({
    profile: {
        name,
        email
    },
    onLogout
}: {
    profile: ProfileProps
    onLogout?: () => void
}) {
    const { formatMessage } = useIntl()
    const { push } = useRouter()
    return (
        <Box sx={{
            display: 'grid',
            rowGap: 1,
            alignSelf: 'end'
        }}>
            <Box
                onClick={() => push('/profile')}
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    alignItems: 'center',
                    columnGap: 1,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    padding: '4px',
                    '&:hover': { bgcolor: 'var(--line)' }
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
                onClick={onLogout}
            >
                {formatMessage({ id: 'logout' })}
            </Button>
        </Box>
    );
}
