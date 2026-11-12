import { PasswordLinkPage } from "@easy-messe/shared-ui";

/** Landing page of the emailed password reset link. */
export default function ResetPassword() {
    return (
        <PasswordLinkPage
            apiPath="/password-reset"
            invalidLinkKey="resetLinkInvalid"
            invalidLinkTitleId="setupLinkInvalidTitle"
            greetingId="resetPasswordTitle"
            successMsgId="passwordResetSuccess"
        />
    );
}
