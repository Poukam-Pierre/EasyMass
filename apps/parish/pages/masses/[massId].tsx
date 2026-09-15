import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import IntentionMassesTable, { MassIntentionRow } from "../../components/Masses/IntentionMassesTable";
import { withParishLayout } from "../../components/withParishLayout";
import api, { apiErrorMessage } from "../../lib/api";
import { downloadFile } from "../../lib/downloadFile";

export default function MassDetail() {
    const [intentions, setIntentions] = useState<MassIntentionRow[]>([])
    const [isDownloading, setIsDownloading] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const { formatMessage } = useIntl()
    const { query: { massId } } = useRouter()

    useEffect(() => {
        if (typeof massId !== 'string') return
        setIsLoading(true)
        api.get(`/masses/${massId}/intentions`)
            .then(({ data }) => setIntentions(data))
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
            .finally(() => setIsLoading(false));
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
                <IntentionMassesTable intentions={intentions} />
            )}
        </Box>
    );
}

MassDetail.getLayout = function getLayout(page: ReactNode) {
    return withParishLayout(page);
};
