import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TablePagination,
  Typography,
} from '@mui/material';
import { DateRangeFilter, DEFAULT_PAGE_SIZE, dateRangeParams } from '@easy-messe/shared-ui';
import { Dayjs } from 'dayjs';
import { ReactNode, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import WithdrawDialog from '../../components/Finances/WithdrawDialog';
import FinanceTable, {
  TransactionRow,
} from '../../components/Finances/FinanceTable';
import { withParishLayout } from '../../components/withParishLayout';
import { useAuth } from '../../contexts/AuthContext';
import api, { apiErrorMessage } from '../../lib/api';

const TRANSACTION_TYPES = ['INCOME', 'INCOME_REVERSAL', 'WITHDRAWAL'] as const;

export default function Finances() {
  const { formatNumber, formatMessage } = useIntl();
  const { parish } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [transactionType, setTransactionType] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadTransactions = () => {
    if (!parish) return;
    setIsLoading(true);
    api
      .get('/transactions/paginated', {
        params: {
          parishId: parish.parishId,
          page: page + 1,
          limit: DEFAULT_PAGE_SIZE,
          ...(transactionType ? { transactionType } : {}),
          ...dateRangeParams(dateFrom, dateTo),
        },
      })
      .then(({ data }) => {
        setTransactions(data.data);
        setTotal(data.total);
        setCurrentBalance(data.currentBalance);
      })
      .catch((error) =>
        toast.error(
          apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))
        )
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(loadTransactions, [parish, page, transactionType, dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearFilters = () => {
    setPage(0);
    setTransactionType('');
    setDateFrom(null);
    setDateTo(null);
  };

  return (
    <>
      <WithdrawDialog
        isOpen={isWithdrawOpen}
        handleClose={() => setIsWithdrawOpen(false)}
        onWithdrawn={loadTransactions}
      />
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '50px',
          }}
        >
          <Box>
            <Typography variant="body2">
              {formatMessage({ id: 'cashRegister' })}
            </Typography>
            <Typography variant="h1">
              {formatNumber(currentBalance, {
                style: 'currency',
                currency: 'xaf',
              })}
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => setIsWithdrawOpen(true)}>
            {formatMessage({ id: 'withdrawal' })}
          </Button>
        </Box>
        <Typography
          variant="body2"
          sx={{ color: 'var(--body)', paddingBottom: '12px' }}
        >
          {formatMessage({ id: 'withdrawalHint' })}
        </Typography>
        <Box
          sx={{
            border: '1px solid var(--line)',
            borderRadius: '10px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              rowGap: 1,
              padding: '10px 16px',
            }}
          >
            <Typography variant="h3" color="primary" sx={{ paddingBottom: 0 }}>
              {formatMessage({ id: 'transactionHistory' })}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                columnGap: 2,
                flexWrap: 'wrap',
              }}
            >
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>
                  {formatMessage({ id: 'transactionType' })}
                </InputLabel>
                <Select
                  label={formatMessage({ id: 'transactionType' })}
                  value={transactionType}
                  onChange={(e) => {
                    setPage(0);
                    setTransactionType(e.target.value);
                  }}
                >
                  <MenuItem value="">
                    {formatMessage({ id: 'allTypes' })}
                  </MenuItem>
                  {TRANSACTION_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DateRangeFilter
                from={dateFrom}
                to={dateTo}
                onFromChange={(value) => {
                  setPage(0);
                  setDateFrom(value);
                }}
                onToChange={(value) => {
                  setPage(0);
                  setDateTo(value);
                }}
                onClear={handleClearFilters}
              />
            </Box>
          </Box>
          {isLoading ? (
            <Typography variant="body2" sx={{ padding: '10px 16px' }}>
              {formatMessage({ id: 'loading' })}
            </Typography>
          ) : (
            <>
              <FinanceTable transactions={transactions} />
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={DEFAULT_PAGE_SIZE}
                rowsPerPageOptions={[DEFAULT_PAGE_SIZE]}
              />
            </>
          )}
        </Box>
      </Box>
    </>
  );
}

Finances.getLayout = function getLayout(page: ReactNode) {
  return withParishLayout(page);
};
