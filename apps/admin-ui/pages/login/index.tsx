import invisibleIcon from '@iconify-icons/material-symbols/visibility-off-outline';
import visibleIcon from '@iconify-icons/material-symbols/visibility-outline';
import { Icon } from '@iconify/react';
import {
    Box,
    Button,
    FormControl,
    IconButton,
    InputAdornment,
    OutlinedInput,
    TextField,
    Typography
} from "@mui/material";
import { useState } from "react";
import HeroHeader from '../../components/HeroHeader';
import { useRouter } from 'next/router';



export default function Login() {
    const [isVisible, setIsVisible] = useState<boolean>(false)
    const { push } = useRouter()

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
                    greeting='Bon retour parmis nous!'
                    getActionMsg='Entrez vos détails de connexion'
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
                    <FormControl
                        variant="outlined"
                        size='small'
                    >
                        <OutlinedInput
                            id="outlined-adornment-password"
                            placeholder='Mot de passe'
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
                    <Button variant="contained">connexion</Button>
                    <Button
                        variant='text'
                        disableRipple
                        onClick={() => push('/recovery/verification')}
                    >
                        Mot de passe oublié ?
                    </Button>
                </Box>
            </Box>
            <Typography>Footer</Typography>
        </Box>
    );
}
