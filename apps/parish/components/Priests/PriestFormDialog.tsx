import {
  Box,
  Button,
  Checkbox,
  Dialog,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import api, { apiErrorMessage } from '../../lib/api';
import { PriestRow } from '../../pages/priests';

interface PriestFormDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  priest: PriestRow | null;
  onSaved: () => void;
}

export default function PriestFormDialog({
  isOpen,
  handleClose,
  priest,
  onSaved,
}: PriestFormDialogProps) {
  const { formatMessage } = useIntl();
  const isEdit = !!priest;

  const {
    handleChange,
    handleSubmit,
    errors,
    touched,
    values,
    setFieldValue,
    isSubmitting,
    resetForm,
  } = useFormik({
    initialValues: {
      firstName: priest?.firstName ?? '',
      secondName: priest?.secondName ?? '',
      birthDate: priest?.birthDate ?? '',
      phoneNumber: priest?.phoneNumber ?? '',
      authNumber: priest?.authNumber ?? '',
      available: priest?.available ?? false,
    },
    enableReinitialize: true,
    validationSchema: yup.object().shape({
      firstName: yup.string().required(),
      secondName: yup.string().required(),
      birthDate: yup.string().required(),
      phoneNumber: yup.string().required(),
      authNumber: yup.string().required(),
    }),
    onSubmit: async (formValues) => {
      try {
        if (isEdit && priest) {
          await api.patch(`/priest/${priest.priestId}`, formValues);
        } else {
          await api.post('/priest', formValues);
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
  });

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      sx={{
        '& .MuiPaper-root': { borderRadius: '15px', maxWidth: 'fit-content' },
      }}
    >
      <Box
        sx={{
          padding: '48px 60px',
          minWidth: '440px',
          display: 'grid',
          rowGap: 2,
        }}
        component="form"
        onSubmit={handleSubmit}
      >
        <Typography variant="h2" textAlign="center">
          {formatMessage({ id: isEdit ? 'modify' : 'createPriest' })}
        </Typography>
        <TextField
          name="firstName"
          placeholder={formatMessage({ id: 'name' })}
          size="small"
          value={values.firstName}
          onChange={handleChange}
          error={!!(errors.firstName && touched.firstName)}
        />
        <TextField
          name="secondName"
          placeholder={formatMessage({ id: 'secondName' })}
          size="small"
          value={values.secondName}
          onChange={handleChange}
          error={!!(errors.secondName && touched.secondName)}
        />
        <TextField
          name="birthDate"
          type="date"
          size="small"
          label={formatMessage({ id: 'birthDate' })}
          InputLabelProps={{ shrink: true }}
          value={values.birthDate}
          onChange={handleChange}
          error={!!(errors.birthDate && touched.birthDate)}
        />
        <TextField
          name="phoneNumber"
          placeholder={formatMessage({ id: 'phoneNumber' })}
          size="small"
          value={values.phoneNumber}
          onChange={handleChange}
          error={!!(errors.phoneNumber && touched.phoneNumber)}
        />
        <TextField
          name="authNumber"
          placeholder={formatMessage({ id: 'authNumber' })}
          size="small"
          value={values.authNumber}
          onChange={handleChange}
          error={!!(errors.authNumber && touched.authNumber)}
        />
        <FormControlLabel
          label={formatMessage({ id: 'priestAvailable' })}
          control={
            <Checkbox
              checked={values.available}
              onChange={(e) => setFieldValue('available', e.target.checked)}
            />
          }
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            columnGap: '20px',
            marginTop: '10px',
          }}
        >
          <Button variant="outlined" type="button" onClick={handleClose}>
            {formatMessage({ id: 'cancel' })}
          </Button>
          <Button variant="contained" type="submit" disabled={isSubmitting}>
            {formatMessage({
              id: isSubmitting ? 'processing' : isEdit ? 'save' : 'create',
            })}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
