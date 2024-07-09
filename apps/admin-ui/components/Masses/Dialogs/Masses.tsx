import { Autocomplete, Box, Button, Checkbox, Dialog, FormControlLabel, TextField, Typography } from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { TableData } from "../MassOwnerTable";
import { useIntl } from "react-intl";

enum MassTypeEnum {
    One = 'unique',
    Triduum = 'triduum',
    Seven = 'seven',
    Novena = 'novena',
    Thirty = 'thirty',
}
interface MassGroupCategory {
    label: MassTypeEnum;
    valueOrder: number
}

interface CreateMassesDialogProps {
    massData?: TableData;
    replicatLabel?: string;
    title?: string;
    labelBtn?: string;
    link?: string;
    id?: number;
    isOpen: boolean;
    handleClose: () => void;
}

export default function MassesDialog({
    isOpen,
    handleClose,
    title,
    labelBtn,
    replicatLabel,
    massData
}: CreateMassesDialogProps) {
    const { formatMessage } = useIntl()
    const massOrderCategory: MassGroupCategory[] = [
        {
            label: MassTypeEnum.One,
            valueOrder: 1
        },
        {
            label: MassTypeEnum.Triduum,
            valueOrder: 3
        },
        {
            label: MassTypeEnum.Seven,
            valueOrder: 7
        },
        {
            label: MassTypeEnum.Novena,
            valueOrder: 9
        },
        {
            label: MassTypeEnum.Thirty,
            valueOrder: 30
        },
    ]

    return (
        <Dialog
            open={isOpen}
            sx={{
                '& .MuiPaper-root': {
                    borderRadius: '15px',
                    maxWidth: 'fit-content',
                },
                '& .MuiBackdrop-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.88)'
                },

            }}

        >
            <Box sx={{
                padding: '60px 100px',
                width: '634px',
                height: '478px'
            }}>
                <Typography
                    variant='h1'
                    textAlign='center'
                >
                    {title}
                </Typography>
                <Box sx={{
                    display: 'grid',
                    rowGap: 2
                }}>
                    <Autocomplete
                        disablePortal
                        options={massOrderCategory.map((massType) => massType.label)}
                        renderInput={(params) =>
                            <TextField
                                {...params}
                                placeholder={formatMessage({ id: 'massTypeHolder' })}
                                size="small"
                                required
                            />
                        }
                    />
                    <DatePicker
                        closeOnSelect
                        disablePast
                        slotProps={{
                            textField: {
                                size: 'small',
                                placeholder: formatMessage({ id: 'massDayHolder' })
                            }
                        }}
                    />
                    <TimePicker
                        ampm
                        closeOnSelect
                        slotProps={{
                            textField: {
                                size: 'small',
                                placeholder: formatMessage({ id: 'massTimeHolder' })
                            }
                        }}
                    />
                    <TextField
                        size="small"
                        type="number"
                        placeholder={formatMessage({ id: 'massPriceHolder' })}
                    />
                    <FormControlLabel
                        label={replicatLabel}
                        control={
                            <Checkbox />
                        }
                    />
                    <Box sx={{
                        display: "grid",
                        gridTemplateColumns: '1fr 1fr',
                        columnGap: '20px',
                        marginTop: '10px'
                    }}>
                        <Button
                            variant='outlined'
                            onClick={handleClose}
                        >
                            {formatMessage({ id: 'cancel' })}
                        </Button>
                        <Button variant='contained'>{labelBtn}</Button>
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
}
