import { theme } from "@easy-messe/libs/theme";
import checkCircleIcon from '@iconify-icons/ph/check-circle';
import { Icon } from "@iconify/react";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useIntl } from "react-intl";

export default function CheckoutReturn() {
    const { formatMessage } = useIntl()
    const { push, query, isReady } = useRouter()
    const message = typeof query.message === 'string' ? query.message : ''
    const method = typeof query.method === 'string' ? query.method : ''
    // PayPal always tells us whether the payment genuinely completed
    // (see PaymentController.respondToPaypalRedirect), so the receipt
    // promise only shows when that's true — never on a cancelled/failed
    // checkout. Mobile money has no equivalent signal: NotchPay redirects
    // the browser back here itself rather than through our own controller,
    // so `success` is never set for that method — reaching this page via
    // that flow is itself the expected happy path.
    const showsReceiptPromise = isReady && (method === 'mobile_money' || (method === 'paypal' && query.success === 'true'))

    return (
        <Box sx={{
            display: 'grid',
            justifyItems: 'center',
            rowGap: '20px',
            padding: { laptop: '100px 90px', mobile: '60px 21px' },
            textAlign: 'center'
        }}>
            <Icon icon={checkCircleIcon} width={64} height={64} color={theme.palette.primary.main} />
            <Typography variant="h1">{formatMessage({ id: 'checkoutReturnTitle' })}</Typography>
            <Typography sx={{ maxWidth: '600px', color: theme.common.body }}>
                {isReady && message ? message : formatMessage({ id: 'checkoutReturnDefaultMessage' })}
            </Typography>
            {showsReceiptPromise && (
                <Typography sx={{ maxWidth: '600px', color: theme.common.body }}>
                    {formatMessage({ id: method === 'mobile_money' ? 'checkoutReturnReceiptSms' : 'checkoutReturnReceiptEmail' })}
                </Typography>
            )}
            <Button variant="contained" onClick={() => push('/')}>
                {formatMessage({ id: 'backToHome' })}
            </Button>
        </Box>
    );
}
