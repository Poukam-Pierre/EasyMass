import { Box, CircularProgress } from "@mui/material";
import { useRouter } from "next/router";
import { PropsWithChildren, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function RequireAuth({ children }: PropsWithChildren) {
    const { accessToken, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !accessToken) {
            router.replace('/login');
        }
    }, [isLoading, accessToken, router]);

    if (isLoading || !accessToken) {
        return (
            <Box sx={{ display: 'grid', placeItems: 'center', height: '100svh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return <>{children}</>;
}
