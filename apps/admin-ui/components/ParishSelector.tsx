import { Autocomplete, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import api from "../lib/api";

export interface ParishOption {
    parishId: string;
    name: string;
}

interface ParishSelectorProps {
    value: ParishOption | null;
    onChange: (parish: ParishOption | null) => void;
}

// The backend requires an explicit parishId for every admin-facing
// masses/transactions/priests query — there's no "all parishes at once"
// listing for those, so every page that needs them starts here.
export default function ParishSelector({ value, onChange }: ParishSelectorProps) {
    const { formatMessage } = useIntl()
    const [parishes, setParishes] = useState<ParishOption[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        api.get('/parishes')
            .then(({ data }) => setParishes(data))
            .catch(() => undefined)
            .finally(() => setIsLoading(false));
    }, [])

    return (
        <Autocomplete
            options={parishes}
            loading={isLoading}
            getOptionLabel={(parish) => parish.name}
            value={value}
            onChange={(_, parish) => onChange(parish)}
            isOptionEqualToValue={(option, current) => option.parishId === current.parishId}
            size="small"
            sx={{ width: '280px' }}
            renderInput={(params) => (
                <TextField {...params} placeholder={formatMessage({ id: 'selectParish' })} />
            )}
        />
    );
}
