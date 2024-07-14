import { Box, Button, TextField } from "@mui/material";
import { useFormik } from "formik";
import { useIntl } from "react-intl";
import * as yup from 'yup';
import HeroHeader from "./HeroHeader";

export function GetMailVerification() {
    const { formatMessage } = useIntl()


    const { handleChange, handleSubmit, errors, touched } = useFormik({
        initialValues: {
            email: ''
        },
        onSubmit: (values) => {
            // TODO send mail data to API to handle verification
            console.log(values)
        },
        validationSchema: yup.object().shape({
            email: yup.string().required('Should provide email')
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
                greeting={formatMessage({ id: 'passwordRecovery' })}
                getActionMsg={formatMessage({ id: 'fillEmail' })}
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
                    onChange={handleChange}
                    error={errors.email && touched.email ? true : false}
                    helperText={(errors.email && touched.email) && errors.email}
                />
                <Button
                    variant="contained"
                    type="submit"
                >
                    {formatMessage({ id: 'send' })}
                </Button>
            </Box>
        </Box>

    );
}
