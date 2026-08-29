import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import IntentionMassesTable, { MassIntentionRow } from "../../components/Masses/IntentionMassesTable";
import { withAdminLayout } from "../../components/withAdminLayout";
import api, { apiErrorMessage } from "../../lib/api";
import { downloadFile } from "../../lib/downloadFile";

export default function Historics() {
    const [intentions, setIntentions] = useState<MassIntentionRow[]>([])
    const [isDownloading, setIsDownloading] = useState<boolean>(false)
    const { formatMessage } = useIntl()
    const { query: { massesId } } = useRouter()

    useEffect(() => {
        if (typeof massesId !== 'string') return
        api.get(`/masses/${massesId}/intentions`)
            .then(({ data }) => setIntentions(data))
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))));
    }, [massesId, formatMessage])

    const handleDownloadAll = async () => {
        if (typeof massesId !== 'string') return
        setIsDownloading(true)
        try {
            await downloadFile(`/masses/${massesId}/intentions/download`, `intentions-${massesId}.pdf`);
        } catch (error) {
            toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <>
            <Box sx={{
                display: 'grid',
                rowGap: 5
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <Typography
                        variant="h3"
                        color='primary'
                        sx={{
                            paddingBottom: 0
                        }}
                    >
                        {formatMessage({ id: 'massIntention' })}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleDownloadAll}
                        disabled={isDownloading || intentions.length === 0}
                    >
                        {formatMessage({ id: isDownloading ? 'processing' : 'downloadAll' })}
                    </Button>
                </Box>
            </Box>
            <IntentionMassesTable
                intentions={intentions}
            />
        </>

    );
}

Historics.getLayout = function getLayout(page: ReactNode) {
    return withAdminLayout(page);
};
