import contactIcon from '@iconify-icons/fluent/contact-card-24-regular';
import editIcon from '@iconify-icons/fluent/edit-24-regular';
import locationIcon from '@iconify-icons/fluent/location-24-regular';
import calendarIcon from '@iconify-icons/material-symbols/calendar-month-outline';
import textFieldIcon from '@iconify-icons/material-symbols/text-fields';
import churchIcon from '@iconify-icons/ph/church-light';
import { Icon, IconifyIcon } from '@iconify/react';
import { Autocomplete, Box, Button, Divider, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import DateTimeMassPicker from "./DateTimeMass";


interface MassGroupCategory {
    label: string;
    valueLoop: number
}
interface inputProps {
    placeholder: string,
    icon: IconifyIcon
}

export default function LetOfferMass() {

    return (
        <Box sx={{
            padding: '21px'
        }}>
            <Box sx={{
                padding: '10px 0 20px 0',
                display: { laptop: 'grid', mobile: 'none' },
                gridAutoFlow: 'column',
                columnGap: 2,
                width: 'fit-content'
            }}>
                {massLoop.map(({ label, valueLoop }, index) => (
                    <Button
                        key={index}
                        variant="outlined"
                    >
                        {label}
                    </Button>
                ))}
            </Box>
            <Box sx={{
                display: { laptop: 'none', mobile: 'flex' },
                flexWrap: 'wrap',
                columnGap: '40px',
                rowGap: '10px',
                paddingBottom: '20px'
            }}>
                {massLoop.map(({ label, valueLoop }, index) => (
                    <Button
                        key={index}
                        variant="outlined"
                        sx={{
                            minWidth: { laptop: 'initial', mobile: '145px' }
                        }}
                    >
                        {label}
                    </Button>
                ))}
            </Box>
            <Typography variant="h2">Informations du requerant</Typography>
            <Divider />
            <Box sx={{
                display: 'grid',
                rowGap: 2,
                padding: {
                    laptop: '10px 10px 20px 0',
                    mobile: '10px 0 20px 0'
                }
            }}>
                <FormControlLabel
                    control={
                        <Switch />
                    }
                    label='Anonymous'
                />
                <Box sx={{
                    display: 'grid',
                    gridAutoFlow: { laptop: 'column', mobile: 'row' },
                    alignItems: 'center',
                    columnGap: 2,
                    rowGap: '10px'
                }}>
                    {inputOfferData.map(({ placeholder, icon }, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'auto 1fr',
                                alignItems: 'center',
                                columnGap: 1
                            }}
                        >
                            <Icon icon={icon} fontSize={32} color="var(--offWhite)" />
                            <TextField
                                placeholder={placeholder}
                                size="small"
                            />
                        </Box>
                    ))}
                </Box>
            </Box>
            <Typography variant="h2">Information de messe</Typography>
            <Divider />
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                padding: '10px 0px 30px 0',
                rowGap: '10px',
                columnGap: '14px',
            }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    columnGap: 1,
                    alignItems: 'center',
                    width: '100%'
                }}>
                    <Icon icon={locationIcon} fontSize={32} color="var(--offWhite)" />
                    <Autocomplete
                        disablePortal
                        options={city}
                        renderInput={(params) => <TextField
                            {...params}
                            placeholder="City"
                            size="small"
                        />
                        }
                    />
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    columnGap: 1,
                    alignItems: 'center',
                    width: { laptop: '49%', mobile: '100%' }
                }}>
                    <Icon icon={churchIcon} fontSize={32} color="var(--offWhite)" />
                    <Autocomplete
                        disablePortal
                        options={Parish}
                        renderInput={(params) => <TextField
                            {...params}
                            placeholder="Parish"
                            size='small'
                        />}
                    />
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    columnGap: 1,
                    alignItems: 'center',
                    width: { laptop: '49%', mobile: '100%' }
                }}>
                    <Icon icon={calendarIcon} fontSize={32} color="var(--offWhite)" />
                    <DateTimeMassPicker />
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    columnGap: 1,
                    width: '100%'
                }}>
                    <Icon icon={textFieldIcon} fontSize={32} color="var(--offWhite)" />
                    <TextField
                        multiline
                        rows={5}
                        placeholder="Mass intention"
                        fullWidth
                    />
                </Box>
            </Box>
            <Button
                variant="contained"
                disableElevation
                sx={{
                    width: 'fit-content'
                }}
            >Ajouter à la liste</Button>
        </Box>
    );
}

const massLoop: MassGroupCategory[] = [
    {
        label: 'Triduum',
        valueLoop: 3
    },
    {
        label: 'Septaine',
        valueLoop: 7
    },
    {
        label: 'Neuvaine',
        valueLoop: 9
    },
    {
        label: 'Trentaine',
        valueLoop: 30
    },
]

const inputOfferData: inputProps[] = [
    {
        placeholder: 'Nom et prenom',
        icon: editIcon
    },
    {
        placeholder: 'Phone',
        icon: contactIcon
    },
]

const city: string[] = [
    'Douala',
    'Bafoussam',
    'Yaoundé',
    'Bangangté',
    'Bandjoun',
]
const Parish: string[] = [
    'Saint Pierre',
    'Saint Michel Archange',
    'Saint Dominique Savio',
    'Saint Antoine de Tour',
    'Saint Nioxé',
]
