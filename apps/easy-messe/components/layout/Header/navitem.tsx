import { useRouter } from "next/router";
import { INavItem } from "./Header";
import { Typography } from "@mui/material";
import Link from "next/link";
import { theme } from "@easy-messe/libs/theme";

interface INavItemProps {
    navItem: INavItem,
    handleLink?: () => void
}

export function NavItem({
    navItem: { item, route },
    handleLink
}: INavItemProps) {
    const { pathname } = useRouter()

    const isActiveItem = route === pathname

    return (
        <Typography
            sx={{
                position: 'relative',
                '& a': {
                    textDecoration: 'none',
                    ...theme.typography.body1,
                    color: '#2F3A45',
                    fontSize: '12px',
                    fontWeight: 500
                },
                '&::before': {
                    position: 'absolute',
                    content: '""',
                    height: '3px',
                    left: '0px',
                    bottom: '-5px',
                    backgroundColor: theme.common.goldChurch,
                    width: isActiveItem ? '100%' : 0,
                    borderRadius: '5px'
                },
                '&:hover::before': {
                    transition: '0.2s',
                    width: '100%',
                    backgroundColor: theme.palette[isActiveItem ? 'primary' : 'secondary'].main
                }
            }}
        >
            <Link
                href={route}
                onClick={(e) => {
                    if (handleLink) {
                        e.preventDefault()
                        handleLink()
                    }

                }}
            >
                {item}
            </Link>
        </Typography>
    );
}
