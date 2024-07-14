import { Box, Divider } from "@mui/material";
import { useRouter } from "next/router";
import LanguageSwapper from "../LanguageSwapper";
import Breadcrumb from "./Breadcrumbs";

export interface BreadcrumbsNameMaps {
    title: string;
    links: { [key: string]: string }
}
export function Header({
    breadcrumbsNameMap
}: {
    breadcrumbsNameMap: BreadcrumbsNameMaps[]
}) {
    const { pathname } = useRouter()

    return (
        <Box sx={{
            display: 'grid',
            rowGap: 1,
            padding: '17px 50px 0'
        }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <Breadcrumb
                    breadcrumb={
                        breadcrumbsNameMap.find((BreadcrumbsNameMaps) =>
                            BreadcrumbsNameMaps.links[pathname] !== undefined
                        ) as BreadcrumbsNameMaps
                    } />
                <LanguageSwapper />
            </Box>
            <Divider />
        </Box>
    );
}
