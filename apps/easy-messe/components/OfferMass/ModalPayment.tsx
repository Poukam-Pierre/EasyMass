import { apiMiddleware } from "@easy-messe/libs/utils";
import { OfferMass } from "libs/theme/src/offerMasses/offerMass.interface";
import { Box, Button, Dialog, Tab, Tabs, TextField, Typography } from "@mui/material";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";

interface ModalPaymentProps {
    isOpen: boolean;
    onClose: () => void
    massRequested: OfferMass[]
}
type PaymentMethodField = Record<number, ReactNode>

interface PaymentMethods {
    image: {
        ref: string;
        height: number;
        width: number;
    }
    serviceName: string;
}

const PAYPAL_TAB_INDEX = 2

export default function ModalPayment({ isOpen, onClose, massRequested }: ModalPaymentProps) {
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
    const [name, setName] = useState<string>('')
    const [phone, setPhone] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const { formatMessage } = useIntl()

    useEffect(() => {
        if (!isOpen) return
        const lastNamedRequest = [...massRequested].reverse().find((request) => request.faithInfos)
        setName(lastNamedRequest?.faithInfos?.name ?? '')
        setPhone(lastNamedRequest?.faithInfos?.phone ?? '')
        setErrorMessage('')
    }, [isOpen, massRequested])

    const paymentMethod: PaymentMethods[] = [
        {
            serviceName: 'Orange Money',
            image: {
                ref: '/assets/om_logo.png',
                height: 24,
                width: 70
            }
        },
        {
            serviceName: 'MTN Mobile Money',
            image: {
                ref: '/assets/momo.png',
                height: 30,
                width: 60
            }
        },
        {
            serviceName: 'PayPal',
            image: {
                ref: '/assets/visa.png',
                height: 20,
                width: 52
            }
        }
    ]

    const paymentMethodField: PaymentMethodField = {
        [PAYPAL_TAB_INDEX]: (
            <Typography variant="body2" sx={{ color: 'var(--body)' }}>
                {formatMessage({ id: 'paypalRedirectInfo' })}
            </Typography>
        ),
    }

    const handleConfirm = () => {
        if (!name.trim() || !phone.trim()) {
            setErrorMessage(formatMessage({ id: 'checkoutRequiredFields' }))
            return
        }
        setErrorMessage('')
        setIsSubmitting(true)

        const paymentMethodValue = activeTabIndex === PAYPAL_TAB_INDEX ? 'PAYPAL' : 'MOBILE_MONEY'

        apiMiddleware({
            url: `${process.env.NEXT_PUBLIC_API_URL}/payment/collect`,
            method: 'POST',
            data: {
                believerInfo: {
                    name,
                    phone
                },
                massInfos: massRequested.map(({ massInfos: { massId, intention } }) => ({
                    id: massId,
                    intension: intention
                })),
                paymentInfo: {
                    currency: 'XAF',
                    paymentMethod: paymentMethodValue,
                    ...(paymentMethodValue === 'MOBILE_MONEY' ? { phone } : {})
                }
            },
            onSuccess: (data: unknown) => {
                window.location.href = data as string
            },
            onFailure: () => {
                setIsSubmitting(false)
                setErrorMessage(formatMessage({ id: 'checkoutError' }))
            }
        })
    }

    return (
        <Dialog
            onClose={onClose}
            open={isOpen}
            sx={{
                '& .MuiPaper-root': {
                    borderRadius: '15px',
                    maxWidth: 'fit-content',
                }
            }}

        >
            <Box sx={{
                padding: { laptop: '80px 40px', mobile: '40px 20px' },
                display: 'grid',
                rowGap: 2
            }}>
                <Typography
                    variant="h1"
                    textAlign='center'
                    sx={{
                        paddingBottom: 0,
                        display: { laptop: 'inherit', mobile: 'none' }
                    }}
                >
                    {formatMessage({ id: 'paymentMethod' })}
                </Typography>
                <Typography
                    variant="h2"
                    textAlign='center'
                    sx={{
                        paddingBottom: 0,
                        display: { laptop: 'none', mobile: 'inherit' }
                    }}
                >
                    {formatMessage({ id: 'paymentMethod' })}
                </Typography>
                <Box sx={{
                    display: 'grid',
                    rowGap: 1.5
                }}>
                    <Typography variant="h5" sx={{ paddingBottom: 0 }}>
                        {formatMessage({ id: 'yourInformations' })}
                    </Typography>
                    <TextField
                        placeholder={formatMessage({ id: 'fullName' })}
                        size="small"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        placeholder={formatMessage({ id: 'phoneNumber' })}
                        type='tel'
                        size="small"
                        fullWidth
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </Box>
                <Box sx={{
                    display: 'grid',
                    rowGap: 2
                }}>
                    <Tabs
                        value={activeTabIndex}
                        onChange={(_, tabIndex) => setActiveTabIndex(tabIndex)}
                        indicatorColor='primary'
                        centered
                    >
                        {
                            paymentMethod.map(({ serviceName, image: { ref, height, width } }, index) => (
                                <Tab
                                    disableRipple
                                    key={index}
                                    icon={<Image src={ref} alt={serviceName} height={height} width={width} />}
                                />
                            ))
                        }
                    </Tabs>
                    {paymentMethodField[activeTabIndex]}
                </Box>
                {errorMessage && (
                    <Typography variant="body2" sx={{ color: 'var(--error)', textAlign: 'center' }}>
                        {errorMessage}
                    </Typography>
                )}
                <Button
                    variant="contained"
                    disabled={isSubmitting || massRequested.length === 0}
                    onClick={handleConfirm}
                >
                    {formatMessage({ id: isSubmitting ? 'processing' : 'confirmPayment' })}
                </Button>
            </Box>
        </Dialog>
    );
}
