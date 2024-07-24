import { useLanguage } from "@easy-messe/libs/theme";
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


interface CreateMassesDialogProps {
    parishData?: TableMassOwnerData;
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
    const { activeLanguage } = useLanguage()

    const { handleChange, handleSubmit,
        errors, touched, setFieldValue,
        values
    } = useFormik<FormikProps>({
        initialValues: {
            name: '',
            city: '',
            leadName: '',
            email: '',
            tel: ''
        },
        onSubmit: (values) => {
            console.log(values)
        },
        validationSchema: yup.object().shape({
            name: yup.string().required('Should filled parish name'),
            city: yup.string().required('Should choose city'),
            leadName: yup.string().required('Should filled a lead name'),
            email: yup.string().required('Should filled email'),
            tel: yup.string().required('Should filled phone number'),
        }),
    })
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
                        placeholder='ENtrez le nom'
                        onChange={handleChange}
                        value={values.name ?? parishData?.name}
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
                        options={[]}
                        value={values.city ?? parishData?.city}
                        size="small"
                        renderInput={(params) =>
                            <TextField
                                {...params}
                                placeholder='Entrez la ville'
                                error={errors.city && touched.city ? true : false}
                                helperText={(errors.city && touched.city) && errors.city}
                            />
                        }
                        onChange={(_, type) => setFieldValue('massType', type)}
                        sx={{
                            '& .MuiFormControl-root': {
                                bgcolor: 'transparent'
                            }
                        }}
                    />
                    <TextField
                        name="leadName"
                        id="leadName"
                        size="small"
                        type="text"
                        placeholder='Entrez le nom du responsable'
                        onChange={handleChange}
                        value={values.leadName ?? parishData?.leadName}
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
                        placeholder="Entrez l'email"
                        onChange={handleChange}
                        value={values.email ?? parishData?.email}
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
                        placeholder="Entrez le numéro du responsable"
                        onChange={handleChange}
                        value={values.tel ?? parishData?.tel}
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
