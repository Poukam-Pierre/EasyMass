import { Box, Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { useState } from "react";
import { useIntl } from "react-intl";
import HeroHeader from '../../../components/HeroHeader';
import { Footer } from "@easy-messe/shared-ui";


export default function ChangePassword() {
    const [isVisible, setIsVisible] = useState<boolean>(false)
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
                    getActionMsg={formatMessage({ id: 'fillPassword' })}
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
                        placeholder={formatMessage({ id: 'newPassword' })}
                        type={isVisible ? 'text' : 'password'}
                    />
                    <TextField
                        size="small"
                        placeholder={formatMessage({ id: 'confirmPassword' })}
                        type={isVisible ? 'text' : 'password'}
                    />
                    <FormControlLabel
                        label='Get password visible'
                        control={
                            <Checkbox
                                checked={isVisible}
                                onChange={(event) => setIsVisible(event.target.checked)}
                            />
                        }
                    />
                    <Button
                        variant="contained"
                    >
                        {formatMessage({ id: 'save' })}
                    </Button>
                </Box>
            </Box>
            <Footer />
        </Box>

    );
}
