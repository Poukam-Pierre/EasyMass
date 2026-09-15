import { Box, Button, TablePagination, Typography } from "@mui/material";
import { Dayjs } from "dayjs";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import DateRangeFilter from "../../components/DateRangeFilter";
import IntentionMassesTable, { MassIntentionRow } from "../../components/Masses/IntentionMassesTable";
import { withParishLayout } from "../../components/withParishLayout";
import api, { apiErrorMessage } from "../../lib/api";
import { downloadFile } from "../../lib/downloadFile";

const ROWS_PER_PAGE = 25;

export default function MassDetail() {
    const [intentions, setIntentions] = useState<MassIntentionRow[]>([])
    const [total, setTotal] = useState<number>(0)
    const [page, setPage] = useState<number>(0)
    const [dateFrom, setDateFrom] = useState<Dayjs | null>(null)
    const [dateTo, setDateTo] = useState<Dayjs | null>(null)
    const [isDownloading, setIsDownloading] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const { formatMessage } = useIntl()
    const { query: { massId } } = useRouter()

    useEffect(() => {
        if (typeof massId !== 'string') return
        setIsLoading(true)
        api.get(`/masses/${massId}/intentions/paginated`, {
            params: {
                page: page + 1,
                limit: ROWS_PER_PAGE,
                ...(dateFrom ? { from: dateFrom.startOf('day').toISOString() } : {}),
                ...(dateTo ? { to: dateTo.endOf('day').toISOString() } : {}),
            }
        })
            .then(({ data }) => { setIntentions(data.data); setTotal(data.total) })
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
            .finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [massId, page, dateFrom, dateTo])

    const handleClearFilters = () => {
        setPage(0)
        setDateFrom(null)
        setDateTo(null)
    }

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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 2 }}>
                <Typography variant="h3" color="primary" sx={{ paddingBottom: 0 }}>
                    {formatMessage({ id: 'listOfMassSupply' })}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', columnGap: 2, flexWrap: 'wrap' }}>
                    <DateRangeFilter
                        from={dateFrom}
                        to={dateTo}
                        onFromChange={(value) => { setPage(0); setDateFrom(value) }}
                        onToChange={(value) => { setPage(0); setDateTo(value) }}
                        onClear={handleClearFilters}
                    />
                    <Button
                        variant="contained"
                        onClick={handleDownloadAll}
                        disabled={isDownloading || total === 0}
                    >
                        {formatMessage({ id: isDownloading ? 'processing' : 'downloadAll' })}
                    </Button>
                </Box>
            </Box>
            {isLoading ? (
                <Typography variant="body2">{formatMessage({ id: 'loading' })}</Typography>
            ) : (
                <>
                    <IntentionMassesTable intentions={intentions} />
                    <TablePagination
                        component="div"
                        count={total}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        rowsPerPage={ROWS_PER_PAGE}
                        rowsPerPageOptions={[ROWS_PER_PAGE]}
                    />
                </>
            )}
        </Box>
    );
}

MassDetail.getLayout = function getLayout(page: ReactNode) {
    return withParishLayout(page);
};
