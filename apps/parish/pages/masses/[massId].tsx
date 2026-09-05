import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import IntentionMassesTable, { MassIntentionRow } from "../../components/Masses/IntentionMassesTable";
import { withParishLayout } from "../../components/withParishLayout";
import api, { apiErrorMessage } from "../../lib/api";
import { downloadFile } from "../../lib/downloadFile";

interface MassPriceRow {
    massPriceId: string;
    currency: string;
    amount: number;
}

export default function MassDetail() {
    const [intentions, setIntentions] = useState<MassIntentionRow[]>([])
    const [prices, setPrices] = useState<MassPriceRow[]>([])
    const [isDownloading, setIsDownloading] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const { formatMessage, formatNumber } = useIntl()
    const { query: { massId } } = useRouter()

    useEffect(() => {
        if (typeof massId !== 'string') return
        setIsLoading(true)
        Promise.all([
            api.get(`/masses/${massId}/intentions`)
                .then(({ data }) => setIntentions(data))
                .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' })))),
            api.get(`/masses/${massId}/prices`)
                .then(({ data }) => setPrices(data))
                .catch(() => undefined),
        ]).finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [massId])

    const handleDownloadAll = async () => {
        if (typeof massId !== 'string') return
        setIsDownloading(true)
        try {
            await downloadFile(`/masses/${massId}/intentions/download`, `intentions-${massId}.pdf`);
        } catch (error) {
            toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <Box sx={{ display: 'grid', rowGap: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h3" color="primary" sx={{ paddingBottom: 0 }}>
                    {formatMessage({ id: 'listOfMassSupply' })}
                </Typography>
                <Button
                    variant="contained"
                    onClick={handleDownloadAll}
                    disabled={isDownloading || intentions.length === 0}
                >
                    {formatMessage({ id: isDownloading ? 'processing' : 'downloadAll' })}
                </Button>
            </Box>
            {isLoading ? (
                <Typography variant="body2">{formatMessage({ id: 'loading' })}</Typography>
            ) : (
                <>
                    <IntentionMassesTable intentions={intentions} />

                    {prices.length > 0 && (
                        <Box>
                            <Typography variant="h4">{formatMessage({ id: 'massPrices' })}</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{formatMessage({ id: 'currency' })}</TableCell>
                                        <TableCell align="right">{formatMessage({ id: 'amount' })}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {prices.map((price) => (
                                        <TableRow key={price.massPriceId}>
                                            <TableCell>{price.currency}</TableCell>
                                            <TableCell align="right">
                                                {formatNumber(price.amount, { style: 'currency', currency: price.currency.toLowerCase() })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}

MassDetail.getLayout = function getLayout(page: ReactNode) {
    return withParishLayout(page);
};
