import { useLanguage } from "@easy-messe/libs/theme";
import { Autocomplete, Box, Button, Checkbox, Dialog, FormControlLabel, TextField, Typography } from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { useFormik } from "formik";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import * as yup from 'yup';
import api, { apiErrorMessage } from "../../../lib/api";
import { TableMassOwnerData } from "../tableMassOwnerData";

// Matches the backend's MassType enum exactly (Prisma's @map only affects
// the DB column value, not the string the API actually sends/expects).
export enum MassTypeEnum {
    Unique = 'UNIQUE',
    Triduum = 'TRIDUUM',
    Seven = 'SEVEN',
    Novena = 'NOVENA',
    Thirty = 'THIRTY',
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
    isOpen: boolean;
    handleClose: () => void;
    onSaved: () => void;
}

interface FormikProps {
    massType: MassTypeEnum | undefined | string;
    dayOfMass: Dayjs | null | undefined;
    massTime: Dayjs | null | undefined;
    price: number | undefined;
    estimatedDurationMinutes: number;
    replicate: boolean;
}

export default function MassesDialog({
    isOpen,
    handleClose,
    title,
    labelBtn,
    replicatLabel,
    massData,
    onSaved,
}: CreateMassesDialogProps) {
    const { formatMessage } = useIntl()
    const { activeLanguage } = useLanguage()
    const massOrderCategory: MassGroupCategory[] = [
        { label: MassTypeEnum.Unique, valueOrder: 1 },
        { label: MassTypeEnum.Triduum, valueOrder: 3 },
        { label: MassTypeEnum.Seven, valueOrder: 7 },
        { label: MassTypeEnum.Novena, valueOrder: 9 },
        { label: MassTypeEnum.Thirty, valueOrder: 30 },
    ]
    const massTypeLabel: Record<string, string> = {
        [MassTypeEnum.Unique]: formatMessage({ id: 'unique' }),
        [MassTypeEnum.Triduum]: formatMessage({ id: 'triduum' }),
        [MassTypeEnum.Seven]: formatMessage({ id: 'seven' }),
        [MassTypeEnum.Novena]: formatMessage({ id: 'novena' }),
        [MassTypeEnum.Thirty]: formatMessage({ id: 'thirty' }),
    }

    const { handleChange, handleSubmit,
        errors, touched, setFieldValue,
        values
    } = useFormik<FormikProps>({
        initialValues: {
            massType: massData?.massType,
            dayOfMass: massData?.dayOfMass,
            massTime: massData?.massTime,
            price: massData?.price,
            estimatedDurationMinutes: massData?.estimatedDurationMinutes ?? 60,
            replicate: false,
        },
        onSubmit: async (formValues, { resetForm }) => {
            const startAt = formValues.dayOfMass
                ?.hour(formValues.massTime?.hour() ?? 0)
                .minute(formValues.massTime?.minute() ?? 0)
                .second(0)
                .toISOString();

            try {
                if (massData) {
                    await api.patch(`/masses/${massData.id}`, {
                        price: formValues.price,
                        startAt,
                        estimatedDurationMinutes: formValues.estimatedDurationMinutes,
                    });
                } else {
                    await api.post('/masses/create', {
                        price: formValues.price,
                        startAt,
                        estimatedDurationMinutes: formValues.estimatedDurationMinutes,
                        massType: formValues.massType,
                        replicate: formValues.replicate,
                    });
                }
                toast.success(formatMessage({ id: 'saved' }));
                resetForm();
                onSaved();
                handleClose();
            } catch (error) {
                toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
            }
        },
        validationSchema: yup.object().shape({
            massType: yup.string()
                .required(formatMessage({ id: 'massTypeWarningMsg' })),
            dayOfMass: yup.date()
                .required(formatMessage({ id: 'dayOfMassWarningMsg' })),
            massTime: yup.date()
                .required(formatMessage({ id: 'massTimeWarningMsg' })),
            price: yup.number()
                .required(formatMessage({ id: 'priceWarningMsg' })),
        }),
        enableReinitialize: true
    })

    if (!isOpen) return null

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
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
                        disabled={!!massData}
                        options={massOrderCategory.map((massType) => massType.label)}
                        getOptionLabel={(option) => massTypeLabel[option] ?? option}
                        value={values.massType ?? null}
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
                    <TextField
                        name="estimatedDurationMinutes"
                        id="estimatedDurationMinutes"
                        size="small"
                        type="number"
                        label={formatMessage({ id: 'estimatedDurationMinutes' })}
                        onChange={handleChange}
                        value={values.estimatedDurationMinutes}
                        sx={{
                            '&.MuiFormControl-root': {
                                bgcolor: 'transparent'
                            }
                        }}
                    />
                    {!massData && (
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
                    )}
                    <Box sx={{
                        display: "grid",
                        gridTemplateColumns: '1fr 1fr',
                        columnGap: '20px',
                        marginTop: '10px'
                    }}>
                        <Button
                            variant='outlined'
                            onClick={handleClose}
                            type="button"
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
