import { Icon } from "@iconify/react";
import { Box, InputBase, Typography } from "@mui/material";
import searchIcon from '@iconify-icons/fluent/search-24-regular';
import refreshIcon from '@iconify-icons/material-symbols/refresh';
import { useIntl } from "react-intl";


export default function ParishesTable() {
    const { formatMessage } = useIntl()

    return (
        <Box sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            width: 'fit-content',
            columnGap: 2
        }}>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                alignItems: 'center',
                columnGap: 0.5,
                cursor: 'pointer',
            }}
            >
                <Icon icon={refreshIcon} fontSize={20} />
                <Typography
                    variant='body2'
                >
                    Reload
                </Typography>
            </Box>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                alignItems: 'center',
                columnGap: 0.5
            }}>
                <Icon icon={searchIcon} fontSize={20} />
                <InputBase
                    placeholder={formatMessage({ id: 'search' })}
                />
            </Box>
        </Box>

    );
}
