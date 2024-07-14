import invisibleIcon from '@iconify-icons/material-symbols/visibility-off-outline';
import visibleIcon from '@iconify-icons/material-symbols/visibility-outline';
import { Icon } from "@iconify/react";
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    IconButton,
    InputAdornment,
    OutlinedInput,
    TextField
} from "@mui/material";
import { useFormik } from 'formik';
import { useRouter } from "next/router";
import { useState } from "react";
import { useIntl } from "react-intl";
import * as yup from 'yup';
import HeroHeader from "./HeroHeader";



export function LoginCretentials() {
    const [isVisible, setIsVisible] = useState<boolean>(false)
    const { formatMessage } = useIntl()
    const { push } = useRouter()

    const {
        handleSubmit,
        errors,
        touched,
        handleChange,
        values
    } = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        onSubmit: (values, { resetForm }) => {
            // TODO fetch data to API for authentication
            console.log(values)
            resetForm()
        },
        validationSchema: yup.object().shape({
            email: yup.string().required(formatMessage({ id: 'fillEmail' })),
            password: yup.string()
                .min(5, formatMessage({ id: 'minPassword' }))
                .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/, {
                    message: formatMessage({ id: 'passwordCarateristics' })
                })
                .required(formatMessage({ id: 'fillPassword' }))
        }),
    })
    return (
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
                greeting={formatMessage({ id: 'greeting' })}
                getActionMsg={formatMessage({ id: 'logInMsg' })}
            />
            <Box
                sx={{
                    display: 'grid',
                    rowGap: 2
                }}
                component='form'
                onSubmit={handleSubmit}
            >
                <TextField
                    name="email"
                    size="small"
                    placeholder="Email"
                    type="email"
                    value={values.email}
                    error={errors.email && touched.email ? true : false}
                    helperText={(errors.email && touched.email) && errors.email}
                    onChange={handleChange}
                />
                <FormControl
                    variant="outlined"
                    size='small'
                >
                    <OutlinedInput
                        id="outlined-adornment-password"
                        name="password"
                        placeholder={formatMessage({ id: 'password' })}
                        type={isVisible ? 'text' : 'password'}
                        value={values.password}
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
                        error={errors.password && touched.password ? true : false}
                        onChange={handleChange}
                    />
                    {errors.password && touched.password ? (
                        <FormHelperText error>{errors.password}</FormHelperText>
                    ) : (
                        ''
                    )}

                </FormControl>
                <Button
                    variant="contained"
                    type="submit"
                >
                    {formatMessage({ id: 'connexion' })}
                </Button>
                <Button
                    variant='text'
                    disableRipple
                    onClick={() => push('/recovery/verification')}
                >
                    {formatMessage({ id: 'forgotPassword' })}
                </Button>
            </Box>
        </Box>

    );
}
