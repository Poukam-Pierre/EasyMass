import { useLanguage } from "@easy-messe/libs/theme";
import { Autocomplete, Box, Button, Checkbox, Dialog, FormControlLabel, TextField, Typography } from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { useFormik } from "formik";
import { useIntl } from "react-intl";
import * as yup from 'yup';
import { TableMassOwnerData } from "../tableMassOwnerData";


export enum MassTypeEnum {
    One = 'unique',
    Triduum = 'triduum',
    Seven = 'seven',
    Novena = 'novena',
    Thirty = 'thirty',
}
interface MassGroupCategory {
    label: MassTypeEnum;
    valueOrder: number
}

interface CreateMassesDialogProps {
    massData?: TableMassOwnerData;
    replicatLabel: string;
    title: string;
    labelBtn: string;
    link?: string;
    id?: number;
    isOpen: boolean;
    handleClose: () => void;
}

interface FormikProps {
    massType: MassTypeEnum | undefined;
    dayOfMass: Dayjs | null | undefined;
    massTime: Dayjs | null | undefined;
    price: number | undefined;
    replicate: boolean;
}
export default function MassesDialog({
    isOpen,
    handleClose,
    title,
    labelBtn,
    replicatLabel,
    massData
}: CreateMassesDialogProps) {
    const { formatMessage } = useIntl()
    const { activeLanguage } = useLanguage()
    const massOrderCategory: MassGroupCategory[] = [
        {
            label: MassTypeEnum.One,
            valueOrder: 1
        },
        {
            label: MassTypeEnum.Triduum,
            valueOrder: 3
        },
        {
            label: MassTypeEnum.Seven,
            valueOrder: 7
        },
        {
            label: MassTypeEnum.Novena,
            valueOrder: 9
        },
        {
            label: MassTypeEnum.Thirty,
            valueOrder: 30
        },
    ]

    const { handleChange, handleSubmit,
        errors, touched, setFieldValue,
        values
    } = useFormik<FormikProps>({
        initialValues: {
            massType: massData?.massType,
            dayOfMass: massData?.dayOfMass,
            massTime: massData?.massTime,
            price: massData?.price,
            replicate: false,
        },
        onSubmit: (values) => {
            console.log(values)
        },
        validationSchema: yup.object().shape({
            massType: yup.string().required('Should choose a mass type'),
            dayOfMass: yup.date().required('Should choose a day'),
            massTime: yup.date().required('Should choose a time'),
            price: yup.number().required('Should choose a price'),
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
                    <Autocomplete
                        id="massType"
                        options={massOrderCategory.map((massType) => massType.label)}
                        value={values.massType}
                        size="small"
                        renderInput={(params) =>
                            <TextField
                                {...params}
                                placeholder={formatMessage({ id: 'massTypeHolder' })}
                                error={errors.massType && touched.massType ? true : false}
                                helperText={(errors.massType && touched.massType) && errors.massType}
                            />
                        }
                        onChange={(_, type) => setFieldValue('massType', type)}
                        sx={{
                            '& .MuiFormControl-root': {
                                bgcolor: 'transparent'
                            }
                        }}
                    />
                    <DatePicker
                        name='dayOfMass'
                        closeOnSelect
                        disablePast
                        slotProps={{
                            textField: {
                                id: 'dayOfMass',
                                size: 'small',
                                placeholder: formatMessage({ id: 'massDayHolder' }),
                                error: errors.dayOfMass && touched.dayOfMass ? true : false,
                                helperText: (errors.dayOfMass && touched.dayOfMass) && errors.dayOfMass,
                                value: values.dayOfMass ?? null
                            }
                        }}
                        sx={{
                            '&.MuiFormControl-root': {
                                bgcolor: 'transparent'
                            }
                        }}
                        onChange={(date) => setFieldValue('dayOfMass', date)}
                    />
                    <TimePicker
                        skipDisabled
                        name='massTime'
                        ampm={activeLanguage !== 'fr'}
                        timeSteps={{ minutes: 15 }}
                        closeOnSelect
                        slotProps={{
                            textField: {
                                id: 'massTime',
                                size: 'small',
                                placeholder: formatMessage({ id: 'massTimeHolder' }),
                                error: errors.massTime && touched.massTime ? true : false,
                                helperText: (errors.massTime && touched.massTime) && errors.massTime,
                                value: values.massTime ?? null
                            }
                        }}
                        sx={{
                            '&.MuiFormControl-root': {
                                bgcolor: 'transparent'
                            }
                        }}
                        onChange={(time) => setFieldValue('massTime', time)}
                    />
                    <TextField
                        name="price"
                        id="price"
                        size="small"
                        type="number"
                        placeholder={formatMessage({ id: 'massPriceHolder' })}
                        onChange={handleChange}
                        value={values.price}
                        error={errors.price && touched.price ? true : false}
                        helperText={(errors.price && touched.price) && errors.price}
                        sx={{
                            '&.MuiFormControl-root': {
                                bgcolor: 'transparent'
                            }
                        }}
                    />
                    <FormControlLabel
                        label={replicatLabel}
                        control={
                            <Checkbox
                                id='replicate'
                                name='replicate'
                                onChange={(event) => setFieldValue('replicate', event.target.checked)}
                            />
                        }
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
