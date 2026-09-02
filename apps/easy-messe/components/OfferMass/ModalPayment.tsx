import { apiMiddleware } from "@easy-messe/libs/utils";
import { OfferMass } from "libs/theme/src/offerMasses/offerMass.interface";
import { Box, Button, Dialog, MenuItem, Tab, Tabs, TextField, Typography } from "@mui/material";
import axios from "axios";
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

interface PreviewResult {
    items: { massId: string; basePrice: number; fee: number; total: number }[];
    grandTotal: number;
    currency: string;
}

const PAYPAL_TAB_INDEX = 2
const MOBILE_MONEY_CURRENCY = 'XAF'
const PAYPAL_CURRENCIES = ['USD', 'EUR'] as const

// The backend returns a stable i18n key as `message` for preview failures
// (see PaymentService.resolveCheckoutPricing) instead of a hardcoded
// English string — whitelisted so an unexpected message never renders as
// a raw, untranslated key.
const PREVIEW_ERROR_KEYS = new Set([
    'priceNotAvailableInCurrency',
    'platformFeeNotConfiguredForCurrency',
])

export default function ModalPayment({ isOpen, onClose, massRequested }: ModalPaymentProps) {
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
    const [name, setName] = useState<string>('')
    const [phone, setPhone] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [paypalCurrency, setPaypalCurrency] = useState<typeof PAYPAL_CURRENCIES[number]>('USD')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [preview, setPreview] = useState<PreviewResult | null>(null)
    const [previewError, setPreviewError] = useState<string>('')
    const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false)
    const { formatMessage, formatNumber } = useIntl()

    const isPaypalTab = activeTabIndex === PAYPAL_TAB_INDEX
    const checkoutCurrency = isPaypalTab ? paypalCurrency : MOBILE_MONEY_CURRENCY

    useEffect(() => {
        if (!isOpen) return
        const lastNamedRequest = [...massRequested].reverse().find((request) => request.faithInfos)
        setName(lastNamedRequest?.faithInfos?.name ?? '')
        setPhone(lastNamedRequest?.faithInfos?.phone ?? '')
        setEmail('')
        setErrorMessage('')
    }, [isOpen, massRequested])

    // Friendly-UI price preview — resolved server-side from the same
    // MassPrice/PlatformSettings the real checkout uses, so this always
    // matches what actually gets charged (and later invoiced).
    useEffect(() => {
        if (!isOpen || massRequested.length === 0) return
        setIsPreviewLoading(true)
        setPreview(null)
        setPreviewError('')

        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payment/preview`, {
            massIds: massRequested.map(({ massInfos: { massId } }) => massId),
            currency: checkoutCurrency,
        })
            .then(({ data }) => setPreview(data))
            .catch((error) => {
                const key = axios.isAxiosError(error)
                    ? (error.response?.data as { message?: string } | undefined)?.message
                    : undefined;
                setPreviewError(
                    key && PREVIEW_ERROR_KEYS.has(key)
                        ? formatMessage({ id: key })
                        : formatMessage({ id: 'genericErrorMsg' })
                );
            })
            .finally(() => setIsPreviewLoading(false))
    }, [isOpen, massRequested, checkoutCurrency, formatMessage])

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
            <Box sx={{ display: 'grid', rowGap: 1 }}>
                <Typography variant="body2" sx={{ color: 'var(--body)' }}>
                    {formatMessage({ id: 'paypalRedirectInfo' })}
                </Typography>
                <TextField
                    select
                    label={formatMessage({ id: 'currency' })}
                    size="small"
                    fullWidth
                    value={paypalCurrency}
                    onChange={(e) => setPaypalCurrency(e.target.value as typeof paypalCurrency)}
                >
                    {PAYPAL_CURRENCIES.map((currency) => (
                        <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    placeholder={formatMessage({ id: 'email' })}
                    type="email"
                    size="small"
                    fullWidth
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    helperText={formatMessage({ id: 'invoiceEmailHelper' })}
                />
            </Box>
        ),
    }

    const handleConfirm = () => {
        if (!name.trim() || !phone.trim() || (isPaypalTab && !email.trim())) {
            setErrorMessage(formatMessage({ id: 'checkoutRequiredFields' }))
            return
        }
        setErrorMessage('')
        setIsSubmitting(true)

        const paymentMethodValue = isPaypalTab ? 'PAYPAL' : 'MOBILE_MONEY'

        apiMiddleware({
            url: `${process.env.NEXT_PUBLIC_API_URL}/payment/collect`,
            method: 'POST',
            data: {
                believerInfo: {
                    name,
                    phone,
                    ...(isPaypalTab ? { email } : {})
                },
                massInfos: massRequested.map(({ massInfos: { massId, intention } }) => ({
                    id: massId,
                    intension: intention
                })),
                paymentInfo: {
                    currency: checkoutCurrency,
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
                <Box sx={{ textAlign: 'center' }}>
                    {isPreviewLoading && (
                        <Typography variant="body2" sx={{ color: 'var(--body)' }}>
                            {formatMessage({ id: 'loading' })}
                        </Typography>
                    )}
                    {!isPreviewLoading && previewError && (
                        <Typography variant="body2" sx={{ color: 'var(--error)' }}>
                            {previewError}
                        </Typography>
                    )}
                    {!isPreviewLoading && !previewError && preview && (
                        <Typography variant="h5" sx={{ paddingBottom: 0, fontWeight: 'bold' }}>
                            {formatMessage({ id: 'estimatedBilling' })} : {formatNumber(preview.grandTotal, {
                                style: 'currency',
                                currency: preview.currency.toLowerCase(),
                            })}
                        </Typography>
                    )}
                </Box>
                {errorMessage && (
                    <Typography variant="body2" sx={{ color: 'var(--error)', textAlign: 'center' }}>
                        {errorMessage}
                    </Typography>
                )}
                <Button
                    variant="contained"
                    disabled={isSubmitting || massRequested.length === 0 || isPreviewLoading || !!previewError || !preview}
                    onClick={handleConfirm}
                >
                    {formatMessage({ id: isSubmitting ? 'processing' : 'confirmPayment' })}
                </Button>
            </Box>
        </Dialog>
    );
}
