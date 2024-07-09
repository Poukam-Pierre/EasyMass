import { Autocomplete, Box, Button, Checkbox, Dialog, FormControlLabel, TextField, Typography } from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";

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
    replicatLabel
}: CreateMassesDialogProps) {
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
                                placeholder='Entrez le type de messe'
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
                                placeholder: 'Entrez le jour'
                            }
                        }}
                    />
                    <TimePicker
                        ampm
                        closeOnSelect
                        slotProps={{
                            textField: {
                                size: 'small',
                                placeholder: "Entrez l'heure"
                            }
                        }}
                    />
                    <TextField
                        size="small"
                        type="number"
                        placeholder="Entrez le montant de la messe"
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
                        >Annuler</Button>
                        <Button variant='contained'>{labelBtn}</Button>
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
}
