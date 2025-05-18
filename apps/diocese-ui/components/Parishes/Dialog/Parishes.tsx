import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    TextField,
    Typography
} from "@mui/material";
import { useFormik } from "formik";
import { useIntl } from "react-intl";
import * as yup from 'yup';
import { ParishData } from "../ParishesTables";
import { useEffect, useState } from "react";


interface CreateMassesDialogProps {
    parishData?: ParishData
    title: string;
    labelBtn: string;
    link?: string;
    id?: number;
    isOpen: boolean;
    handleClose: () => void;
}

interface FormikProps {
    name: string | undefined;
    city: string | undefined;
    leadName: string | undefined;
    email: string | undefined;
    tel: string | undefined;
}
export default function ParishesDialog({
    isOpen,
    handleClose,
    title,
    labelBtn,
    parishData
}: CreateMassesDialogProps) {
    const { formatMessage } = useIntl()
    const { push } = useRouter();
    const [isFetchingCities, setIsFetchingCities] = useState<boolean>(false);
    const [isPendingModification, setIsPendingMofication] = useState<boolean>(false);

    const { handleChange, handleSubmit,
        errors, touched, setFieldValue,
        values
    } = useFormik<FormikProps>({
        initialValues: {
            name: parishData?.name,
            city: parishData?.city,
            leadName: parishData?.leadName,
            email: parishData?.email,
            tel: parishData?.contact
        },
        onSubmit: (values) => {
            console.log(values)
        },
        validationSchema: yup.object().shape({
            name: yup.string().required('Should filled parish name'),
            city: yup.object({
                city_name: yup.string().required('Should choose city')
            }),
            leadName: yup.string().required('Should filled a lead name'),
            email: yup.string().required('Should filled email'),
            tel: yup.string().required('Should filled phone number'),
        }),
        enableReinitialize: true
    })

    const [cities, setCities] = useState<CitiesDto[]>([])

    useEffect(() => {
        const fetchCities = async () => {
            const token = localStorage.getItem('token');
            if (!token)
                return

            setIsFetchingCities(true);
            await apiMiddleware({
                url: '/parishes/cities',
                method: 'GET',
                accessToken: token,
                onSuccess: (response: any) => {
                    setCities(response.cities)
                },
                onFailure: (error) => {
                    errorHandling({ error, formatMessage, redirect: push })
                },
                onFinally: () => {
                    setIsFetchingCities(false);
                }
            })
        }
        fetchCities()
    }, [])


    return (
        <Dialog
            open={isOpen}
            sx={{
                '& .MuiPaper-root': {
                    borderRadius: '15px',
                    maxWidth: 'fit-content',
                },
                '& .MuiBackdrop-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.88)'
                },

            }}

        >
            <Box sx={{
                padding: '60px 100px',
                minWidth: '634px',
                minHeight: '478px'
            }}>
                <Typography
                    variant='h1'
                    textAlign='center'
                >
                    {title}
                </Typography>
                <Box sx={{
                    display: 'grid',
                    rowGap: 2,
                }}
                    component='form'
                    onSubmit={handleSubmit}

                >
                    <TextField
                        name="name"
                        id="name"
                        size="small"
                        type="text"
                        placeholder={formatMessage({ id: 'parishName' })}
                        onChange={handleChange}
                        value={values.name}
                        error={errors.name && touched.name ? true : false}
                        helperText={(errors.name && touched.name) && errors.name}
                        sx={{
                            '&.MuiFormControl-root': {
                                bgcolor: 'transparent'
                            }
                        }}
                    />

                    <Autocomplete
                        id="city"
                        options={cities}
                        size="small"
                        renderInput={(params) =>
                            <TextField
                                {...params}
                                placeholder={formatMessage({ id: 'parishCity' })}
                                error={!!(errors.city?.city_name && touched.city)}
                                helperText={(errors.city?.city_name && touched.city) && errors.city.city_name}
                            />
                        }
                        renderOption={(props, { city_name }) => (
                            <li {...props}>
                                {city_name}
                            </li>
                        )}
                        getOptionLabel={(option) => {
                            return option.city_name
                        }}
                        {...getFieldProps('city')}
                        onChange={(_, newValue: CitiesDto) => {
                            setFieldValue('city', newValue);
                        }}
                        sx={{
                            '& .MuiFormControl-root': {
                                bgcolor: 'transparent'
                            }
                        }}
                        disabled={isFetchingCities || isPendingModification}
                    />
                    <TextField
                        name="leadName"
                        id="leadName"
                        size="small"
                        type="text"
                        placeholder={formatMessage({ id: 'leadParishName' })}
                        onChange={handleChange}
                        value={values.leadName}
                        error={errors.leadName && touched.leadName ? true : false}
                        helperText={(errors.leadName && touched.leadName) && errors.leadName}
                        sx={{
                            '&.MuiFormControl-root': {
                                bgcolor: 'transparent'
                            }
                        }}
                    />
                    <TextField
                        name="email"
                        id="email"
                        size="small"
                        type="email"
                        placeholder={formatMessage({ id: 'parishMailAddress' })}
                        onChange={handleChange}
                        value={values.email}
                        error={errors.email && touched.email ? true : false}
                        helperText={(errors.email && touched.email) && errors.email}
                        sx={{
                            '&.MuiFormControl-root': {
                                bgcolor: 'transparent'
                            }
                        }}
                    />
                    <TextField
                        name="tel"
                        id="tel"
                        size="small"
                        type="tel"
                        placeholder={formatMessage({ id: 'parishPhoneNumber' })}
                        onChange={handleChange}
                        value={values.tel}
                        error={errors.tel && touched.tel ? true : false}
                        helperText={(errors.tel && touched.tel) && errors.tel}
                        sx={{
                            '&.MuiFormControl-root': {
                                bgcolor: 'transparent'
                            }
                        }}
                    />
                    <Box sx={{
                        display: "grid",
                        gridTemplateColumns: '1fr 1fr',
                        columnGap: '20px',
                        marginTop: '10px'
                    }}>
                        <Button
                            variant='outlined'
                            onClick={handleClose}
                        >
                            {formatMessage({ id: 'cancel' })}
                        </Button>
                        <Button
                            variant='contained'
                            type='submit'
                        >
                            {labelBtn}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
}
