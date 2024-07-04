import { Box, Button, FormControl, IconButton, InputAdornment, OutlinedInput, TextField, Typography } from "@mui/material";
import HeroHeader from '../../../components/HeroHeader';
import { useState } from "react";
import { Icon } from "@iconify/react";
import invisibleIcon from '@iconify-icons/material-symbols/visibility-off-outline';
import visibleIcon from '@iconify-icons/material-symbols/visibility-outline';
import Footer from "../../../components/Layout/Footer/Footer";


export default function ChangePassword() {
    const [isVisible, setIsVisible] = useState<boolean>(false)

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
                    slogan='La messe, la plus grande des prières'
                    greeting='Récupération du mot de passe!'
                    getActionMsg='Entrez votre nouveau mot de passe'
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
                            placeholder='New password'
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
                        placeholder="Confirm password"
                        type="password"
                    />
                    <Button variant="contained">Save</Button>
                </Box>
            </Box>
            <Footer />
        </Box>

    );
}
