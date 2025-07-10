import { useLanguage } from "@easy-messe/libs/theme";
import { ReplicationPeriodEnum, TableMassOwnerData } from "@easyMesseLibs/types";
import upDownIcon from '@iconify-icons/fluent/chevron-up-down-20-regular';
import { Icon } from "@iconify/react";
import { Box, Button, Checkbox, CircularProgress, Dialog, FormControlLabel, IconButton, Menu, MenuItem, TextField, Typography } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { useFormik } from "formik";
import { useState } from "react";
import { useIntl } from "react-intl";
import * as yup from 'yup';
import { apiMiddleware, errorHandling } from "@easy-messe/libs/utils";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";



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
    dayOfMass: Dayjs | null | undefined;
    price: number | undefined;
    canReplicate: boolean;
    period: ReplicationPeriodEnum;

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
    const { push } = useRouter()
    const [periodValue, setPeriodValue] =
        useState<ReplicationPeriodEnum>(ReplicationPeriodEnum.MONTHLY)

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const [isCreationPending, setIsCreationPending] = useState<boolean>(false)

    const { handleChange, handleSubmit,
        errors, touched, setFieldValue,
        values
    } = useFormik<FormikProps>({
        initialValues: {
            dayOfMass: massData?.dayOfMass,
            price: massData?.price,
            canReplicate: false,
            period: ReplicationPeriodEnum.MONTHLY
        },
        onSubmit: (values) => {
            const { dayOfMass, ...rest } = values;
            const token = localStorage.getItem('token');
            if (!token) {
                push('/login');
                return
            }
            setIsCreationPending(true);
            apiMiddleware({
                url: '/masses/create',
                method: 'POST',
                accessToken: token,
                data: {
                    ...rest,
                    processAt: dayOfMass?.toDate(),
                },
                onSuccess: (response) => {
                    toast.success(formatMessage({ id: 'massCreatedSuccess' }))
                    handleClose();
                },
                onFailure: (error) => {
                    errorHandling({ error, formatMessage, redirect: push });
                },
                onFinally: () => {
                    setIsCreationPending(false);
                }
            })
            console.log(values)
        },
        validationSchema: yup.object().shape({
            dayOfMass: yup.date()
                .required(formatMessage({ id: 'dayOfMassWarningMsg' })),
            price: yup.number()
                .required(formatMessage({ id: 'priceWarningMsg' })),
        }),
        enableReinitialize: true
    })
    return (
        <>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => {
                    setAnchorEl(null)
                }}
            >
                {
                    Object.values(ReplicationPeriodEnum).map((value, index) => (
                        <MenuItem
                            key={index}
                            dense
                            value={value}
                            onClick={() => {
                                setFieldValue('period', value);
                                setPeriodValue(value);
                                setAnchorEl(null);
                            }}
                        >
                            {formatMessage({ id: value.toLocaleLowerCase() })}
                        </MenuItem>
                    ))
                }
            </Menu>
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
                    minHeight: '400px'
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
                        <DateTimePicker
                            name='dayOfMass'
                            ampm={activeLanguage !== 'fr'}
                            disablePast
                            disableHighlightToday
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
                            onChange={(newDate) => {
                                if (!newDate) return
                                setFieldValue('dayOfMass', newDate)
                            }}
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
                            disabled={isCreationPending}
                        />
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            columnGap: 0.3
                        }}>
                            <FormControlLabel
                                label={`${replicatLabel} ${formatMessage({ id: periodValue.toLocaleLowerCase() })}`}
                                control={
                                    <Checkbox
                                        id='replicate'
                                        name='replicate'
                                        onChange={(event) => setFieldValue('canReplicate', event.target.checked)}
                                    />
                                }
                                sx={{
                                    marginRight: 0
                                }}
                                disabled={isCreationPending}
                            />
                            <IconButton
                                id="basic-button"
                                size="small"
                                onClick={handleClick}
                            >
                                <Icon
                                    icon={upDownIcon}
                                    fontSize={15}
                                />
                            </IconButton>
                        </Box>

                        <Box sx={{
                            display: "grid",
                            gridTemplateColumns: '1fr 1fr',
                            columnGap: '20px',
                            marginTop: '10px'
                        }}>
                            <Button
                                variant='outlined'
                                onClick={handleClose}
                                disabled={isCreationPending}
                            >
                                {formatMessage({ id: 'cancel' })}
                            </Button>
                            <Button
                                variant='contained'
                                disabled={isCreationPending}
                                type='submit'
                            >
                                {
                                    isCreationPending ?
                                        <CircularProgress size={20} /> :
                                        labelBtn
                                }
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Dialog>
        </>
    );
}
