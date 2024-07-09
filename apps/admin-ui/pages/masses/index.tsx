import { Box, Button, InputBase, Typography } from "@mui/material";
import AppLayout from "../../components/Layout";
import { Icon } from "@iconify/react";
import { useIntl } from "react-intl";
import filterIcon from '@iconify-icons/fluent/filter-24-regular';
import searchIcon from '@iconify-icons/fluent/search-24-regular';
import { useState } from "react";
import MassOwnerTable from "../../components/Masses/MassOwnerTable";
import MassMenu, { MenuIntem } from "../../components/Menus/MassMenu";
import checkmarkIcon from '@iconify-icons/fluent/checkmark-circle-24-regular'


export default function Masses() {
    const { formatMessage } = useIntl()
    const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null);
    const menuItem: MenuIntem[] = [
        {
            title: formatMessage({ id: 'day' }),
            icon: checkmarkIcon
        },
        {
            title: formatMessage({ id: 'hour' }),
            icon: checkmarkIcon
        },
        {
            title: formatMessage({ id: 'massType' }),
            icon: checkmarkIcon
        }
    ]

    return (
        <AppLayout>
            <MassMenu
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                menuItem={menuItem}
            />
            <Box sx={{
                padding: '0 16px 8px'
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <Typography
                        variant="h2"
                        color='primary'
                        sx={{
                            paddingBottom: 0
                        }}
                    >Liste de messe</Typography>
                    <Button
                        variant="contained"
                    >
                        + Ajouter une messe
                    </Button>
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridAutoFlow: 'column',
                    width: 'fit-content',
                    columnGap: 3
                }}>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        alignItems: 'center',
                        columnGap: 1,
                        cursor: 'pointer',
                    }}
                        onClick={(event) => setAnchorEl(event.target as HTMLAnchorElement)}
                    >
                        <Icon icon={filterIcon} fontSize={20} />
                        <Typography
                            variant='body2'
                        >
                            {formatMessage({ id: 'filter' })}
                        </Typography>
                    </Box>

                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        alignItems: 'center',
                        columnGap: 1
                    }}>
                        <Icon icon={searchIcon} fontSize={20} />
                        <InputBase
                            placeholder={formatMessage({ id: 'search' })}
                        />
                    </Box>
                </Box>
            </Box>
            <MassOwnerTable />
        </AppLayout>
    );
}
