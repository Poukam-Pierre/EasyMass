import { EasyMassAdminLayout } from "@easy-messe/shared-ui";
import { ReactNode } from "react";
import AppLayout from "./Layout";
import RequireAuth from "./RequireAuth";

export function withAdminLayout(page: ReactNode) {
    return (
        <EasyMassAdminLayout>
            <RequireAuth>
                <AppLayout>{page}</AppLayout>
            </RequireAuth>
        </EasyMassAdminLayout>
    );
}
