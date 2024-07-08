import { Box, Divider } from "@mui/material";
import Breadcrumb from "./Breadcrumbs";
import { useRouter } from "next/router";
import LanguageSwapper from "../LanguageSwapper";

export interface BreadcrumbsNameMaps {
    title: string;
    links: { [key: string]: string }
}
export default function Header() {
    const { pathname } = useRouter()

    const breadcrumbsNameMap: BreadcrumbsNameMaps[] = [
        {
            title: 'Mass Offer',
            links: {
                '/massOffer': 'Mass offer',
            }
        },
        {
            title: 'Masses',
            links: {
                '/masses': 'Masses',
                '/masses/create': 'Create',
                '/masses/modify': 'Modify',
                '/masses/delete': 'Cancel',
            }
        },
        {
            title: 'Finances',
            links: {
                '/finances': 'Finances',
                'finances/withdrawal': 'Withdrawal',
            }
        },
    ]
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
                <Breadcrumb breadcrumbs={
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
