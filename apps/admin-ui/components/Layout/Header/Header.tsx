import { Box, Divider } from "@mui/material";
import Breadcrumb from "./Breadcrumbs";
import { useRouter } from "next/router";
import LanguageSwapper from "../LanguageSwapper";
import { useIntl } from "react-intl";

export interface BreadcrumbsNameMaps {
    title: string;
    links: { [key: string]: string }
}
export default function Header() {
    const { pathname } = useRouter()
    const { formatMessage } = useIntl()

    const breadcrumbsNameMap: BreadcrumbsNameMaps[] = [
        {
            title: formatMessage({ id: 'massOffer' }),
            links: {
                '/massOffer': formatMessage({ id: 'massOffer' }),
            }
        },
        {
            title: formatMessage({ id: 'masses' }),
            links: {
                '/masses': formatMessage({ id: 'masses' }),
                '/masses/create': formatMessage({ id: 'create' }),
                '/masses/modify': formatMessage({ id: 'modify' }),
                '/masses/delete': formatMessage({ id: 'cancel' }),
            }
        },
        {
            title: formatMessage({ id: 'finances' }),
            links: {
                '/finances': formatMessage({ id: 'finances' }),
                'finances/withdrawal': formatMessage({ id: 'withdrawal' }),
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
