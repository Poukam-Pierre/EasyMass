import { Box, Button, Typography } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import WithdrawDialog from "../../components/Finances/WithdrawDialog";
import FinanceTable, { TransactionRow } from "../../components/Finances/FinanceTable";
import { withParishLayout } from "../../components/withParishLayout";
import { useAuth } from "../../contexts/AuthContext";
import api, { apiErrorMessage } from "../../lib/api";

export default function Finances() {
    const { formatNumber, formatMessage } = useIntl()
    const { parish } = useAuth()
    const [transactions, setTransactions] = useState<TransactionRow[]>([])
    const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const loadTransactions = () => {
        if (!parish) return
        api.get('/transactions', { params: { parishId: parish.parishId } })
            .then(({ data }) => setTransactions(data))
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
            .finally(() => setIsLoading(false));
    }

    useEffect(loadTransactions, [parish]) // eslint-disable-line react-hooks/exhaustive-deps

    const currentBalance = transactions[0]?.balanceAfter ?? 0

    return (
        <>
            <WithdrawDialog
                isOpen={isWithdrawOpen}
                handleClose={() => setIsWithdrawOpen(false)}
                onWithdrawn={loadTransactions}
            />
            <Box>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '50px'
                }}>
                    <Box>
                        <Typography variant='body2'>
                            {formatMessage({ id: 'cashRegister' })}
                        </Typography>
                        <Typography variant="h1">
                            {formatNumber(currentBalance, { style: 'currency', currency: 'xaf' })}
                        </Typography>
                    </Box>
                    <Button variant="contained" onClick={() => setIsWithdrawOpen(true)}>
                        {formatMessage({ id: 'withdrawal' })}
                    </Button>
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--body)', paddingBottom: '12px' }}>
                    {formatMessage({ id: 'withdrawalHint' })}
                </Typography>
                <Box sx={{
                    border: '1px solid var(--line)',
                    borderRadius: '10px'
                }}>
                    <Typography
                        variant='h3'
                        color='primary'
                        sx={{
                            padding: '10px 16px'
                        }}
                    >
                        {formatMessage({ id: 'transactionHistory' })}
                    </Typography>
                    {isLoading ? (
                        <Typography variant="body2" sx={{ padding: '10px 16px' }}>
                            {formatMessage({ id: 'loading' })}
                        </Typography>
                    ) : (
                        <FinanceTable transactions={transactions} />
                    )}
                </Box>
            </Box>
        </>
    );
}

Finances.getLayout = function getLayout(page: ReactNode) {
    return withParishLayout(page);
};
