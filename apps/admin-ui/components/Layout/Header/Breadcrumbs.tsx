import { Box, Breadcrumbs, Link, Typography } from "@mui/material";
import { BreadcrumbsNameMaps } from "./Header";
import { useRouter } from "next/router";

interface BreadcrumbProps {
    breadcrumbs: BreadcrumbsNameMaps
}

export default function Breadcrumb({ breadcrumbs: {
    title,
    links
} }: BreadcrumbProps) {
    const { pathname } = useRouter()
    const pathnames = pathname.split('/').filter((x) => x)
    console.log(pathname.split('/'), pathnames)
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
                {pathnames.map((_, index) => {
                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    return last ? (
                        <Typography key={to} color='primary'>
                            {links[to]}
                        </Typography>
                    ) : (
                        <Link
                            key={to}
                            variant="body2"
                            underline="hover"
                            color="inherit"
                            href={to}
                        >
                            {links[to]}
                        </Link>
                    )
                })}
            </Breadcrumbs>
        </Box>
    );
}
