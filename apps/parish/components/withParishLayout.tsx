import { EasyMassAdminLayout } from "@easy-messe/shared-ui";
import { ReactNode } from "react";
import AppLayout from "./Layout";
import RequireAuth from "./RequireAuth";

export function withParishLayout(page: ReactNode) {
    return (
        <EasyMassAdminLayout defaultLang="fr">
            <RequireAuth>
                <AppLayout>{page}</AppLayout>
            </RequireAuth>
        </EasyMassAdminLayout>
    );
}
