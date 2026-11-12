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

// Duration presets rather than a free date picker or end date. Each one
// stands for a fixed number of masses, the first one included, so "every
// week for 1 month" is always 4 masses whatever weekday or month it starts
// in. Monthly has no 1-month preset: that would be just the one mass.
const DURATION_PRESETS = ['1M', '3M', '6M', '1Y'] as const;
type DurationPreset = (typeof DURATION_PRESETS)[number];

const OCCURRENCES: Record<
  RecurrenceInterval,
  Partial<Record<DurationPreset, number>>
> = {
  [RecurrenceInterval.Weekly]: { '1M': 4, '3M': 13, '6M': 26, '1Y': 52 },
  [RecurrenceInterval.Monthly]: { '3M': 3, '6M': 6, '1Y': 12 },
};

const presetsFor = (interval: RecurrenceInterval) =>
  DURATION_PRESETS.filter((preset) => OCCURRENCES[interval][preset]);

const occurrencesOf = (values: {
  recurrenceInterval: RecurrenceInterval;
  recurrenceDuration: DurationPreset;
}) => OCCURRENCES[values.recurrenceInterval][values.recurrenceDuration] ?? 0;

const DURATION_LABEL_IDS: Record<DurationPreset, string> = {
  '1M': 'oneMonth',
  '3M': 'threeMonths',
  '6M': 'sixMonths',
  '1Y': 'oneYear',
};

/** What POST /masses/create reports back. */
interface MassCreationResult {
  created: number;
  skipped: number;
}

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
        .millisecond(0)
        .toISOString();

      try {
        if (massData) {
          await api.patch(`/masses/${massData.id}`, {
            price: formValues.price,
            startAt,
            estimatedDurationMinutes: formValues.estimatedDurationMinutes,
          });
          toast.success(formatMessage({ id: 'saved' }));
        } else {
          const { data } = await api.post<MassCreationResult>(
            '/masses/create',
            {
              price: formValues.price,
              startAt,
              estimatedDurationMinutes: formValues.estimatedDurationMinutes,
              massType: MassTypeEnum.Unique,
              recurrence: formValues.replicate
                ? {
                    interval: formValues.recurrenceInterval,
                    count: occurrencesOf(formValues),
                  }
                : undefined,
            }
          );
          if (!data.created) {
            // Nothing new was added, so don't call it saved; keep the
            // dialog open so the parish can pick another date.
            toast.info(formatMessage({ id: 'allMassesAlreadyExist' }));
            return;
          }
          toast.success(
            formValues.replicate
              ? formatMessage(
                  {
                    id: data.skipped
                      ? 'massesCreatedWithSkipped'
                      : 'massesCreated',
                  },
                  { created: data.created, skipped: data.skipped }
                )
              : formatMessage({ id: 'saved' })
          );
        }
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

  const occurrenceCount = occurrencesOf(values);

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
                    checked={values.replicate}
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
                    onChange={(event) => {
                      const interval = event.target
                        .value as RecurrenceInterval;
                      setFieldValue('recurrenceInterval', interval);
                      // Switching to monthly drops the 1-month preset.
                      if (!OCCURRENCES[interval][values.recurrenceDuration]) {
                        setFieldValue(
                          'recurrenceDuration',
                          presetsFor(interval)[0]
                        );
                      }
                    }}
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
                    {presetsFor(values.recurrenceInterval).map((preset) => (
                      <MenuItem key={preset} value={preset}>
                        {formatMessage({ id: DURATION_LABEL_IDS[preset] })}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography
                    variant="body2"
                    sx={{ gridColumn: '1 / -1', color: 'var(--body)' }}
                  >
                    {formatMessage(
                      { id: 'recurrenceCountHint' },
                      { count: occurrenceCount }
                    )}
                  </Typography>
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
