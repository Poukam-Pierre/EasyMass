import trashIcon from '@iconify-icons/ph/trash-light';
import editIcon from '@iconify-icons/fluent/edit-28-regular';
import { Icon } from '@iconify/react';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { theme } from '@easy-messe/libs/theme';
import { ReactNode, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { withAdminLayout } from '../../components/withAdminLayout';
import api, { apiErrorMessage } from '../../lib/api';

interface CityRow {
  city_id: string;
  city_name: string;
  country: string;
}

export default function Cities() {
  const { formatMessage } = useIntl();
  const [cities, setCities] = useState<CityRow[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<CityRow | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deletingCityId, setDeletingCityId] = useState<string | null>(null);

  const loadCities = () => {
    api
      .get('/cities')
      .then(({ data }) => setCities(data))
      .catch((error) =>
        toast.error(
          apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))
        )
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(loadCities, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditing(null);
    setCityName('');
    setIsDialogOpen(true);
  };
  const openEdit = (city: CityRow) => {
    setEditing(city);
    setCityName(city.city_name);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!cityName.trim()) return;
    setIsSaving(true);
    try {
      if (editing) {
        await api.patch(`/cities/${editing.city_id}`, { city_name: cityName });
      } else {
        await api.post('/cities', { city_name: cityName, country: 'Cameroon' });
      }
      toast.success(formatMessage({ id: 'saved' }));
      setIsDialogOpen(false);
      loadCities();
    } catch (error) {
      toast.error(
        apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' }))
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (city: CityRow) => {
    if (!window.confirm(formatMessage({ id: 'deleteMassMsgWarning' }))) return;
    setDeletingCityId(city.city_id);
    try {
      await api.delete(`/cities/${city.city_id}`);
      toast.success(formatMessage({ id: 'saved' }));
      loadCities();
    } catch (error) {
      toast.error(
        apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' }))
      );
    } finally {
      setDeletingCityId(null);
    }
  };

  if (isLoading) {
    return <Typography sx={{ color: 'var(--body)' }}>{formatMessage({ id: 'loading' })}</Typography>;
  }

  return (
    <Box sx={{ display: 'grid', rowGap: '20px' }}>
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        sx={{ '& .MuiPaper-root': { borderRadius: '15px' } }}
      >
        <Box
          sx={{
            padding: '48px 60px',
            minWidth: '380px',
            display: 'grid',
            rowGap: 2,
          }}
        >
          <Typography variant="h2" textAlign="center">
            {formatMessage({ id: editing ? 'cityModify' : 'addCity' })}
          </Typography>
          <TextField
            placeholder={formatMessage({ id: 'parishCity' })}
            size="small"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              columnGap: '20px',
            }}
          >
            <Button variant="outlined" onClick={() => setIsDialogOpen(false)}>
              {formatMessage({ id: 'cancel' })}
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isSaving}
            >
              {formatMessage({ id: isSaving ? 'processing' : 'save' })}
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h2" color="primary" sx={{ paddingBottom: 0 }}>
          {formatMessage({ id: 'cities' })}
        </Typography>
        <Button variant="contained" onClick={openCreate}>
          + {formatMessage({ id: 'create' })}
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            {['name', 'action'].map((key) => (
              <TableCell
                key={key}
                sx={{ bgcolor: theme.palette.secondary.main, fontWeight: 600 }}
              >
                {formatMessage({ id: key }).toUpperCase()}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {cities.map((city) => (
            <TableRow key={city.city_id}>
              <TableCell sx={{ fontWeight: 600 }}>{city.city_name}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => openEdit(city)} disabled={deletingCityId === city.city_id}>
                  <Icon icon={editIcon} fontSize={18} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(city)}
                  disabled={deletingCityId === city.city_id}
                >
                  <Icon icon={trashIcon} fontSize={18} color="var(--error)" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {cities.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} sx={{ color: 'var(--body)' }}>
                {formatMessage({ id: 'noDataYet' })}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}

Cities.getLayout = function getLayout(page: ReactNode) {
  return withAdminLayout(page);
};
