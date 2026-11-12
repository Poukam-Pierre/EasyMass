import { RequestPasswordResetPage } from "@easy-messe/shared-ui";

/** "Forgot password?" — emails a parish account a reset link. */
export default function ForgotPassword() {
    return <RequestPasswordResetPage requestPath="/password-reset/request-parish" />;
}
