import { Box, Button, TextField } from "@mui/material";
import HeroHeader from '../../../components/HeroHeader';
import Footer from "../../../components/Layout/Footer/Footer";
import { useIntl } from "react-intl";

export default function MailVerification() {
    const { formatMessage } = useIntl()
    return (
        <Box sx={{
            height: '100svh',
            display: 'grid',
            gridTemplateRows: '1fr auto'
        }}>
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
                    greeting={formatMessage({ id: 'passwordRecovery' })}
                    getActionMsg={formatMessage({ id: 'fillEmail' })}
                />
                <Box
                    sx={{
                        display: 'grid',
                        rowGap: 2
                    }}
                    component='form'
                >
                    <TextField
                        size="small"
                        placeholder="Email"
                        type="email"
                    />
                    <Button variant="contained">{formatMessage({ id: 'send' })}</Button>
                </Box>
            </Box>
            <Footer />
        </Box>

    );
}
