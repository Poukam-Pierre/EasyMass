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
import Image from "next/image";
import { useState } from "react";



export default function Login() {
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
                <Box sx={{
                    display: 'grid',
                    justifyItems: 'center',
                    rowGap: '8px'
                }}>
                    <Box textAlign='center'>
                        <Image
                            src='/assets/LogoEasyMass.png'
                            height={153}
                            width={350}
                            alt="Logo easy messe"
                        />
                        <Typography
                            variant='caption'
                            sx={{
                                lineHeight: '24px',
                                fontWeight: 'var(--semiBold)'
                            }}
                        >
                            La messe, la plus grande des prières</Typography>
                    </Box>
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: '36px',
                            lineHeight: '44px',
                            padding: 0
                        }}
                    >
                        Bon retour parmis nous!</Typography>
                    <Typography
                        variant='h5'
                    >
                        Entrez vos détails de connexion</Typography>
                </Box>
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
                    >
                        Mot de passe oublié ?
                    </Button>
                </Box>
            </Box>
            <Typography>Footer</Typography>
        </Box>
    );
}
