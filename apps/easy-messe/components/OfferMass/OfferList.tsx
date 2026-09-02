import { useOfferMass } from "@easy-messe/libs/theme";
import { Box, Button, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import ModalPayment from "./ModalPayment";
import { useState } from "react";
import { usePaymentPreview } from "./usePaymentPreview";

interface OfferListProps {
    children: JSX.Element
}

const CART_PREVIEW_CURRENCY = 'XAF'

export default function OfferList({ children }: OfferListProps) {
    const [isPaymenDialogOpen, setIsPaymenDialogOpen] = useState<boolean>(false)
    const { formatMessage, formatNumber } = useIntl()
    const { massRequested } = useOfferMass()

    // Real configured platform fee for the cart's default (XAF) currency —
    // resolved the same way the actual checkout will resolve it, instead
    // of a hardcoded guess.
    const { preview } = usePaymentPreview(massRequested, CART_PREVIEW_CURRENCY, true)
    const grandTotal = preview?.grandTotal ?? null

    const handlePaymenDialogOpen = () => {
        setIsPaymenDialogOpen(true)
    }
    const handlePaymenDialogClose = () => {
        setIsPaymenDialogOpen(false)
    }

    return (
        <Box sx={{
            padding: '10px 10px 0px 10px',
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            rowGap: '20px'
        }}>
            <Typography
                variant="h2"
                sx={{
                    paddingBottom: 0
                }}

            > {formatMessage({ id: 'requestList' })}</Typography>
            {children}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                alignItems: 'center',
                columnGap: '10px'
            }}>
                <Button
                    variant="contained"
                    disableElevation
                    sx={{
                        width: 'fit-content',
                    }}
                    disabled={massRequested.length === 0}
                    onClick={handlePaymenDialogOpen}
                >
                    {formatMessage({ id: 'souscribe' })}
                </Button>
                {grandTotal !== null && (
                    <Typography
                        variant="h5"
                        sx={{
                            paddingBottom: 0,
                            fontWeight: 'bold',
                            display: !massRequested.length ? 'none' : 'inherit'
                        }}
                    >
                        {formatMessage({ id: 'estimatedBilling' })} : {formatNumber(grandTotal, {
                            style: 'currency',
                            currency: CART_PREVIEW_CURRENCY.toLowerCase(),
                        })}
                    </Typography>
                )}
            </Box>
            <ModalPayment
                isOpen={isPaymenDialogOpen}
                onClose={handlePaymenDialogClose}
                massRequested={massRequested}
            />
        </Box>
    );
}
