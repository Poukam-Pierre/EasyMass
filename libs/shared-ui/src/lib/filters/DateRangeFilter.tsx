import { Box, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { useIntl } from "react-intl";

interface DateRangeFilterProps {
    from: Dayjs | null;
    to: Dayjs | null;
    onFromChange: (value: Dayjs | null) => void;
    onToChange: (value: Dayjs | null) => void;
    onClear: () => void;
}

/** Shared by every paginated table (admin-ui and parish) that filters by a
 * createdAt-style date range, so the picker pair/clear-button UI exists
 * exactly once instead of once per app. */
export function DateRangeFilter({ from, to, onFromChange, onToChange, onClear }: DateRangeFilterProps) {
    const { formatMessage } = useIntl()
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', columnGap: 2, flexWrap: 'wrap' }}>
            <DatePicker
                label={formatMessage({ id: 'filterFrom' })}
                value={from}
                onChange={onFromChange}
                slotProps={{ textField: { size: 'small' } }}
                sx={{ maxWidth: 170 }}
            />
            <DatePicker
                label={formatMessage({ id: 'filterTo' })}
                value={to}
                onChange={onToChange}
                slotProps={{ textField: { size: 'small' } }}
                sx={{ maxWidth: 170 }}
            />
            {(from || to) && (
                <Button size="small" onClick={onClear}>{formatMessage({ id: 'clearFilters' })}</Button>
            )}
        </Box>
    );
}
