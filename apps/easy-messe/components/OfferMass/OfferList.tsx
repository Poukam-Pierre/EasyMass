import { useOfferMass } from "@easy-messe/libs/theme";
import { Box, Button, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import ModalPayment from "./ModalPayment";
import { useState } from "react";

interface OfferListProps {
    children: JSX.Element
}

export default function OfferList({ children }: OfferListProps) {
    const [isPaymenDialogOpen, setIsPaymenDialogOpen] = useState<boolean>(false)
    const { formatMessage, formatNumber } = useIntl()
    const { massRequested } = useOfferMass()
    const totalBillingAmount = massRequested.map(
        ({ massInfos: { price } }) => price as number)
        .reduce((prevValue, curValue) => prevValue + curValue,
            0
        )

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
                    disabled={massRequested.length === 0 ? true : false}
                    onClick={handlePaymenDialogOpen}
                >
                    {formatMessage({ id: 'souscribe' })}
                </Button>
                <Typography
                    variant="h5"
                    sx={{
                        paddingBottom: 0,
                        fontWeight: 'bold',
                        display: massRequested.length === 0 ? 'none' : 'inherit'
                    }}
                >
                    Total à payer : {formatNumber(totalBillingAmount + (totalBillingAmount * 0.1), {
                        style: 'currency',
                        currency: 'xaf',
                    })}
                </Typography>
            </Box>
            <ModalPayment
                isOpen={isPaymenDialogOpen}
                onClose={handlePaymenDialogClose}
            />
        </Box>
    );
}
