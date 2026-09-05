import { Box, Typography } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import IntentionMassesTable, { MassIntentionRow } from "../../components/Masses/IntentionMassesTable";
import MassSelector, { MassOption } from "../../components/MassSelector";
import ParishSelector, { ParishOption } from "../../components/ParishSelector";
import { withAdminLayout } from "../../components/withAdminLayout";
import api, { apiErrorMessage } from "../../lib/api";

// GET /mass-order?massId= and GET /masses/:massId/intentions call the exact
// same backend method (MassOrderService.findMassOrderByMass) — this page is
// just a different entry point into the same data: browse by parish → mass
// instead of drilling in from a specific mass's row.
export default function MassOffer() {
    const { formatMessage } = useIntl()
    const [parish, setParish] = useState<ParishOption | null>(null)
    const [mass, setMass] = useState<MassOption | null>(null)
    const [orders, setOrders] = useState<MassIntentionRow[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (!mass) { setOrders([]); return }
        setIsLoading(true)
        api.get('/mass-order', { params: { massId: mass.massId } })
            .then(({ data }) => setOrders(data))
            .catch((error) => toast.error(apiErrorMessage(error, formatMessage({ id: 'loadErrorGeneric' }))))
            .finally(() => setIsLoading(false));
    }, [mass, formatMessage])

    return (
        <>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 2

            }}>
                <Typography
                    variant='h3'
                    color='primary'
                    sx={{
                        paddingBottom: 0
                    }}
                >
                    {formatMessage({ id: 'listOfMassSupply' })}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <ParishSelector value={parish} onChange={(p) => { setParish(p); setMass(null); }} />
                    <MassSelector parishId={parish?.parishId ?? null} value={mass} onChange={setMass} />
                </Box>
            </Box>
            {mass ? (
                isLoading ? (
                    <Typography variant="body2" sx={{ color: 'var(--body)', textAlign: 'center', padding: '40px' }}>
                        {formatMessage({ id: 'loading' })}
                    </Typography>
                ) : (
                    <IntentionMassesTable intentions={orders} />
                )
            ) : (
                <Typography variant="body2" sx={{ color: 'var(--body)', textAlign: 'center', padding: '40px' }}>
                    {formatMessage({ id: 'selectMassPrompt' })}
                </Typography>
            )}
        </>
    );
}

MassOffer.getLayout = function getLayout(page: ReactNode) {
    return withAdminLayout(page);
};
