import { Autocomplete, TextField } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import api from "../lib/api";

export interface MassOption {
    massId: string;
    startAt: string;
    massType: string;
}

interface MassSelectorProps {
    parishId: string | null;
    value: MassOption | null;
    onChange: (mass: MassOption | null) => void;
}

export default function MassSelector({ parishId, value, onChange }: MassSelectorProps) {
    const { formatMessage } = useIntl()
    const [masses, setMasses] = useState<MassOption[]>([])

    useEffect(() => {
        if (!parishId) { setMasses([]); return }
        api.get('/masses', { params: { parishId } }).then(({ data }) => setMasses(data)).catch(() => undefined);
    }, [parishId])

    return (
        <Autocomplete
            options={masses}
            disabled={!parishId}
            getOptionLabel={(mass) => `${mass.massType} — ${dayjs(mass.startAt).format('LLL')}`}
            value={value}
            onChange={(_, mass) => onChange(mass)}
            isOptionEqualToValue={(option, current) => option.massId === current.massId}
            size="small"
            sx={{ width: '320px' }}
            renderInput={(params) => (
                <TextField {...params} placeholder={formatMessage({ id: 'selectMass' })} />
            )}
        />
    );
}
