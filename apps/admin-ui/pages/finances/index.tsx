import { Box, Button, Typography } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import CorrectionDialog from "../../components/Finances/CorrectionDialog";
import FinanceTable, { TransactionRow } from "../../components/Finances/FinanceTable";
import ParishSelector, { ParishOption } from "../../components/ParishSelector";
import { withAdminLayout } from "../../components/withAdminLayout";
import api, { apiErrorMessage } from "../../lib/api";

export default function Finances() {
    const { formatNumber, formatMessage } = useIntl()
    const [parish, setParish] = useState<ParishOption | null>(null)
    const [transactions, setTransactions] = useState<TransactionRow[]>([])
    const [isCorrectionOpen, setIsCorrectionOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const loadTransactions = () => {
        if (!parish) return
        setIsLoading(true)
        api.get('/transactions', { params: { parishId: parish.parishId } })
            .then(({ data }) => setTransactions(data))
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
            .finally(() => setIsLoading(false));
    }

    useEffect(loadTransactions, [parish]) // eslint-disable-line react-hooks/exhaustive-deps

    const currentBalance = transactions[0]?.balanceAfter ?? 0

    return (
        <>
            {parish && (
                <CorrectionDialog
                    isOpen={isCorrectionOpen}
                    handleClose={() => setIsCorrectionOpen(false)}
                    parishId={parish.parishId}
                    onSaved={loadTransactions}
                />
            )}

            <Box>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '24px'
                }}>
                    <ParishSelector value={parish} onChange={setParish} />
                </Box>

                {parish && (
                    isLoading ? (
                        <Typography variant="body2" sx={{ color: 'var(--body)', textAlign: 'center', padding: '40px' }}>
                            {formatMessage({ id: 'loading' })}
                        </Typography>
                    ) : (
                        <>
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
                                <Button variant="contained" onClick={() => setIsCorrectionOpen(true)}>
                                    {formatMessage({ id: 'ledgerCorrection' })}
                                </Button>
                            </Box>
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
                                <FinanceTable transactions={transactions} />
                            </Box>
                        </>
                    )
                )}
                {!parish && (
                    <Typography variant="body2" sx={{ color: 'var(--body)', textAlign: 'center', padding: '40px' }}>
                        {formatMessage({ id: 'selectParishPrompt' })}
                    </Typography>
                )}
            </Box>
        </>
    );
}

Finances.getLayout = function getLayout(page: ReactNode) {
    return withAdminLayout(page);
};
