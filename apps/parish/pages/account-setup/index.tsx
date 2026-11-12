import { PasswordLinkPage } from "@easy-messe/shared-ui";

/** Landing page of the emailed account-setup link: saving verifies the
 * parish's email and sets its password. */
export default function AccountSetup() {
    return (
        <PasswordLinkPage
            apiPath="/account-setup"
            invalidLinkKey="setupLinkInvalid"
            invalidLinkTitleId="setupLinkInvalidTitle"
            greetingId="accountSetupTitle"
            successMsgId="accountSetupSuccess"
        />
    );
}
