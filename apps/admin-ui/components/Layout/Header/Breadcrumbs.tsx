import { Box, Breadcrumbs, Link, Typography } from "@mui/material";
import { BreadcrumbsNameMaps } from "./Header";
import { useRouter } from "next/router";

export default function Breadcrumb({
    breadcrumb: {
        title,
        links
    }
}: {
    breadcrumb: BreadcrumbsNameMaps
}) {
    const { pathname } = useRouter()
    const subPaths = pathname.split('/').filter((x) => x)
    return (
        <Box sx={{
            display: 'grid',
            textAlign: 'start'
        }}>
            <Typography
                variant="h1"
                sx={{
                    fontSize: '36px',
                    lineHeight: '44px',
                    letterSpacing: '-0.02px',
                    padding: 0
                }}
            >{title}</Typography>
            <Breadcrumbs>
                <Link
                    variant="body2"
                    underline="hover"
                    color="inherit"
                >
                    Management
                </Link>
                {subPaths.map((_, index) => {
                    const islastPath = index === subPaths.length - 1;
                    const pathRoute = `/${subPaths.slice(0, index + 1).join('/')}`;
                    return islastPath ? (
                        <Typography key={pathRoute} color='primary'>
                            {links[pathRoute]}
                        </Typography>
                    ) : (
                        <Link
                            key={pathRoute}
                            variant="body2"
                            underline="hover"
                            color="inherit"
                            href={pathRoute}
                        >
                            {links[pathRoute]}
                        </Link>
                    )
                })}
            </Breadcrumbs>
        </Box>
    );
}
