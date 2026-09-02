import { useOfferMass } from "@easy-messe/libs/theme";
import { Box, Button, Typography } from "@mui/material";
import axios from "axios";
import { useIntl } from "react-intl";
import ModalPayment from "./ModalPayment";
import { useEffect, useState } from "react";

interface OfferListProps {
    children: JSX.Element
}

const CART_PREVIEW_CURRENCY = 'XAF'

export default function OfferList({ children }: OfferListProps) {
    const [isPaymenDialogOpen, setIsPaymenDialogOpen] = useState<boolean>(false)
    const { formatMessage, formatNumber } = useIntl()
    const { massRequested } = useOfferMass()
    const [grandTotal, setGrandTotal] = useState<number | null>(null)

    // Real configured platform fee for the cart's default (XAF) currency —
    // resolved the same way the actual checkout will resolve it, instead
    // of a hardcoded guess.
    useEffect(() => {
        if (massRequested.length === 0) {
            setGrandTotal(null)
            return
        }
        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payment/preview`, {
            massIds: massRequested.map(({ massInfos: { massId } }) => massId),
            currency: CART_PREVIEW_CURRENCY,
        })
            .then(({ data }) => setGrandTotal(data.grandTotal))
            .catch(() => setGrandTotal(null))
    }, [massRequested])

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
