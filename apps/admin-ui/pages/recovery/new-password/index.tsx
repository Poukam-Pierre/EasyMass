import { Box, Button, FormControl, IconButton, InputAdornment, OutlinedInput, TextField, Typography } from "@mui/material";
import HeroHeader from '../../../components/HeroHeader';
import { useState } from "react";
import { Icon } from "@iconify/react";
import invisibleIcon from '@iconify-icons/material-symbols/visibility-off-outline';
import visibleIcon from '@iconify-icons/material-symbols/visibility-outline';
import Footer from "../../../components/Layout/Footer/Footer";
import { useIntl } from "react-intl";


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
                    <FormControl
                        variant="outlined"
                        size='small'
                    >
                        <OutlinedInput
                            id="outlined-adornment-password"
                            placeholder={formatMessage({ id: 'newPassword' })}
                            type={isVisible ? 'text' : 'password'}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setIsVisible((val) => !val)}
                                        edge="end"
                                    >
                                        {isVisible ?
                                            <Icon icon={visibleIcon} fontSize={24} /> :
                                            <Icon icon={invisibleIcon} fontSize={24} />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderRadius: '8px'
                                }
                            }}
                        />
                    </FormControl>
                    <TextField
                        size="small"
                        placeholder={formatMessage({ id: 'confirmPassword' })}
                        type="password"
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
