import { Avatar, Box, Typography, Button } from "@mui/material";

export default function Profile() {
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
                    alt="Saint Martin de Tour"
                    src="Saint Martin de Tour"
                />
                <Box>
                    <Typography
                        variant='body2'
                        sx={{
                            fontWeight: 700
                        }}
                    >
                        Saint Martin de Tour
                    </Typography>
                    <Typography
                        variant='caption'
                        sx={{
                            fontWeight: 500
                        }}
                    >
                        saintmartin@gmail.com
                    </Typography>
                </Box>
            </Box>
            <Button
                variant='outlined'
            >Deconnexion</Button>
        </Box>
    );
}
