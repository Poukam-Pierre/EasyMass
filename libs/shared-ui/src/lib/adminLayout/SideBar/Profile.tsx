import { Avatar, Box, Typography, Button } from "@mui/material";
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
            >
                {formatMessage({ id: 'logout' })}
            </Button>
        </Box>
    );
}
