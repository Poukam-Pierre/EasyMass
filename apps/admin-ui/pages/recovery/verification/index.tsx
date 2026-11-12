import { RequestPasswordResetPage } from "@easy-messe/shared-ui";

/** "Forgot password?" — emails an admin account a reset link. */
export default function ForgotPassword() {
    return <RequestPasswordResetPage requestPath="/password-reset/request-admin" />;
}
