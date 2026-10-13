import { useLanguage } from '@easy-messe/libs/theme';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import api, { apiErrorMessage } from '../../../lib/api';
import { TableMassOwnerData } from '../tableMassOwnerData';

// Matches the backend's RecurrenceInterval enum exactly.
enum RecurrenceInterval {
  Weekly = 'WEEKLY',
  Monthly = 'MONTHLY',
}

// Duration presets rather than a free date picker — the recurrence's
// `until` is derived from whichever one is picked, computed relative to
// the mass's own start date so the parish never has to think about actual
// calendar dates for this.
const DURATION_PRESETS = ['1M', '3M', '6M', '1Y'] as const;
type DurationPreset = (typeof DURATION_PRESETS)[number];

function addDuration(date: Dayjs, preset: DurationPreset): Dayjs {
  switch (preset) {
    case '1M':
      return date.add(1, 'month');
    case '3M':
      return date.add(3, 'month');
    case '6M':
      return date.add(6, 'month');
    case '1Y':
      return date.add(1, 'year');
  }
}

const DURATION_LABEL_IDS: Record<DurationPreset, string> = {
  '1M': 'oneMonth',
  '3M': 'threeMonths',
  '6M': 'sixMonths',
  '1Y': 'oneYear',
};

// Matches the backend's MassType enum exactly (Prisma's @map only affects
// the DB column value, not the string the API actually sends/expects).
export enum MassTypeEnum {
  Unique = 'UNIQUE',
  Triduum = 'TRIDUUM',
  Seven = 'SEVEN',
  Novena = 'NOVENA',
  Thirty = 'THIRTY',
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
  dayOfMass: Dayjs | null | undefined;
  massTime: Dayjs | null | undefined;
  price: number | undefined;
  estimatedDurationMinutes: number;
  replicate: boolean;
  recurrenceInterval: RecurrenceInterval;
  recurrenceDuration: DurationPreset;
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
  const { formatMessage } = useIntl();
  const { activeLanguage } = useLanguage();
  const {
    handleChange,
    handleSubmit,
    errors,
    touched,
    setFieldValue,
    values,
    isSubmitting,
  } = useFormik<FormikProps>({
    initialValues: {
      dayOfMass: massData?.dayOfMass,
      massTime: massData?.massTime,
      price: massData?.price,
      estimatedDurationMinutes: massData?.estimatedDurationMinutes ?? 60,
      replicate: false,
      recurrenceInterval: RecurrenceInterval.Weekly,
      recurrenceDuration: '1M',
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
            massType: MassTypeEnum.Unique,
            recurrence: formValues.replicate && formValues.dayOfMass
              ? {
                  interval: formValues.recurrenceInterval,
                  until: addDuration(formValues.dayOfMass, formValues.recurrenceDuration).toISOString(),
                }
              : undefined,
          });
        }
        toast.success(formatMessage({ id: 'saved' }));
        resetForm();
        onSaved();
        handleClose();
      } catch (error) {
        toast.error(
          apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' }))
        );
      }
    },
    validationSchema: yup.object().shape({
      dayOfMass: yup
        .date()
        .required(formatMessage({ id: 'dayOfMassWarningMsg' })),
      massTime: yup
        .date()
        .required(formatMessage({ id: 'massTimeWarningMsg' })),
      price: yup.number().required(formatMessage({ id: 'priceWarningMsg' })),
    }),
    enableReinitialize: true,
  });

  if (!isOpen) return null;

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
          backgroundColor: 'rgba(0, 0, 0, 0.88)',
        },
      }}
    >
      <Box
        sx={{
          padding: '60px 100px',
          minWidth: '634px',
          minHeight: '478px',
        }}
      >
        <Typography variant="h1" textAlign="center">
          {title}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            rowGap: 2,
          }}
          component="form"
          onSubmit={handleSubmit}
        >
          <DatePicker
            name="dayOfMass"
            closeOnSelect
            disablePast
            slotProps={{
              textField: {
                id: 'dayOfMass',
                size: 'small',
                placeholder: formatMessage({ id: 'massDayHolder' }),
                error: errors.dayOfMass && touched.dayOfMass ? true : false,
                helperText:
                  errors.dayOfMass && touched.dayOfMass && errors.dayOfMass,
                value: values.dayOfMass ?? null,
              },
            }}
            sx={{
              '&.MuiFormControl-root': {
                bgcolor: 'transparent',
              },
            }}
            onChange={(date) => setFieldValue('dayOfMass', date)}
          />
          <TimePicker
            skipDisabled
            name="massTime"
            ampm={activeLanguage !== 'fr'}
            timeSteps={{ minutes: 15 }}
            closeOnSelect
            slotProps={{
              textField: {
                id: 'massTime',
                size: 'small',
                placeholder: formatMessage({ id: 'massTimeHolder' }),
                error: errors.massTime && touched.massTime ? true : false,
                helperText:
                  errors.massTime && touched.massTime && errors.massTime,
                value: values.massTime ?? null,
              },
            }}
            sx={{
              '&.MuiFormControl-root': {
                bgcolor: 'transparent',
              },
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
            helperText={errors.price && touched.price && errors.price}
            sx={{
              '&.MuiFormControl-root': {
                bgcolor: 'transparent',
              },
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
                bgcolor: 'transparent',
              },
            }}
          />
          {!massData && (
            <>
              <FormControlLabel
                label={replicatLabel}
                control={
                  <Checkbox
                    id="replicate"
                    name="replicate"
                    onChange={(event) =>
                      setFieldValue('replicate', event.target.checked)
                    }
                  />
                }
              />
              {values.replicate && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    columnGap: '20px',
                  }}
                >
                  <TextField
                    select
                    id="recurrenceInterval"
                    name="recurrenceInterval"
                    size="small"
                    label={formatMessage({ id: 'repeatInterval' })}
                    value={values.recurrenceInterval}
                    onChange={handleChange}
                  >
                    <MenuItem value={RecurrenceInterval.Weekly}>
                      {formatMessage({ id: 'weekly' })}
                    </MenuItem>
                    <MenuItem value={RecurrenceInterval.Monthly}>
                      {formatMessage({ id: 'monthly' })}
                    </MenuItem>
                  </TextField>
                  <TextField
                    select
                    id="recurrenceDuration"
                    name="recurrenceDuration"
                    size="small"
                    label={formatMessage({ id: 'repeatDuration' })}
                    value={values.recurrenceDuration}
                    onChange={handleChange}
                  >
                    {DURATION_PRESETS.map((preset) => (
                      <MenuItem key={preset} value={preset}>
                        {formatMessage({ id: DURATION_LABEL_IDS[preset] })}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              )}
            </>
          )}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              columnGap: '20px',
              marginTop: '10px',
            }}
          >
            <Button variant="outlined" onClick={handleClose} type="button">
              {formatMessage({ id: 'cancel' })}
            </Button>
            <Button variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting ? formatMessage({ id: 'processing' }) : labelBtn}
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
