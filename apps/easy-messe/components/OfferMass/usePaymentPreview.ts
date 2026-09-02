import { extractApiErrorKey } from "@easy-messe/libs/utils";
import { OfferMass } from "libs/theme/src/offerMasses/offerMass.interface";
import axios from "axios";
import { useEffect, useState } from "react";

export interface PaymentPreview {
    items: { massId: string; basePrice: number; fee: number; total: number }[];
    grandTotal: number;
    currency: string;
}

const KNOWN_PREVIEW_ERROR_KEYS = new Set([
    'priceNotAvailableInCurrency',
    'platformFeeNotConfiguredForCurrency',
])

/**
 * Friendly-UI price preview, resolved server-side from the same
 * MassPrice/PlatformSettings the real checkout uses, so this always
 * matches what actually gets charged (and later invoiced). Shared by
 * every place that needs a live preview (checkout modal, cart total) so
 * the request/race-safety logic exists exactly once.
 *
 * Ignores a response that resolves after `massRequested`/`currency` have
 * since changed, so a slow, now-stale request can never overwrite what's
 * currently on screen with a mismatched price.
 */
export function usePaymentPreview(
    massRequested: OfferMass[],
    currency: string,
    enabled: boolean
) {
    const [preview, setPreview] = useState<PaymentPreview | null>(null)
    const [errorKey, setErrorKey] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (!enabled || massRequested.length === 0) {
            setPreview(null)
            setErrorKey(undefined)
            return
        }
        let ignoreStaleResponse = false
        setIsLoading(true)
        setPreview(null)
        setErrorKey(undefined)

        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payment/preview`, {
            massIds: massRequested.map(({ massInfos: { massId } }) => massId),
            currency,
        })
            .then(({ data }) => {
                if (ignoreStaleResponse) return
                setPreview(data)
            })
            .catch((error) => {
                if (ignoreStaleResponse) return
                setErrorKey(extractApiErrorKey(error, KNOWN_PREVIEW_ERROR_KEYS) ?? 'genericErrorMsg')
            })
            .finally(() => {
                if (ignoreStaleResponse) return
                setIsLoading(false)
            })

        return () => {
            ignoreStaleResponse = true
        }
    }, [massRequested, currency, enabled])

    return { preview, errorKey, isLoading }
}
