import contactIcon from '@iconify-icons/fluent/contact-card-24-regular';
import editIcon from '@iconify-icons/fluent/edit-24-regular';
import locationIcon from '@iconify-icons/fluent/location-24-regular';
import calendarIcon from '@iconify-icons/material-symbols/calendar-month-outline';
import textFieldIcon from '@iconify-icons/material-symbols/text-fields';
import churchIcon from '@iconify-icons/ph/church-light';
import { Icon, IconifyIcon } from '@iconify/react';
import { Autocomplete, Box, Button, Divider, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import DateTimeMassPicker from "./DateTimeMass";
import { useIntl } from 'react-intl';
import { useState } from 'react';


interface MassGroupCategory {
    label: string;
    valueLoop: number
}
interface inputProps {
    placeholder: string,
    icon: IconifyIcon
}

export default function LetOfferMass() {
    const { formatMessage } = useIntl();
    const [isAnonym, setIsAnonym] = useState<boolean>(false)

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
                        {formatMessage({ id: label })}
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
                        {formatMessage({ id: label })}
                    </Button>
                ))}
            </Box>
            <Typography variant="h2">{formatMessage({ id: 'ApplicantInformation' })}</Typography>
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
                        <Switch
                            checked={isAnonym}
                            onChange={(_) => setIsAnonym(_.target.checked)}
                        />
                    }
                    label={formatMessage({ id: 'Anonymous' })}
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
                                placeholder={formatMessage({ id: placeholder })}
                                size="small"
                                disabled={isAnonym}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>
            <Typography variant="h2">{formatMessage({ id: 'MassInformations' })}</Typography>
            <Divider />
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                padding: { laptop: '10px 10px 30px 0', mobile: '10px 0px 30px 0' },
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
                            placeholder={formatMessage({ id: 'City' })}
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
                    width: {
                        laptop: '49%',
                        mobile: '100%',
                        tablet: '100%'
                    }
                }}>
                    <Icon icon={churchIcon} fontSize={32} color="var(--offWhite)" />
                    <Autocomplete
                        disablePortal
                        options={Parish}
                        renderInput={(params) => <TextField
                            {...params}
                            placeholder={formatMessage({ id: 'Parish' })}
                            size='small'
                        />}
                    />
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    columnGap: 1,
                    alignItems: 'center',
                    width: {
                        laptop: '49%',
                        mobile: '100%',
                        tablet: '100%'
                    }
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
                        placeholder={formatMessage({ id: 'MassIntension' })}
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
            >{formatMessage({ id: 'AddToList' })}</Button>
        </Box>
    );
}

const massLoop: MassGroupCategory[] = [
    {
        label: 'Triduum',
        valueLoop: 3
    },
    {
        label: 'Seven',
        valueLoop: 7
    },
    {
        label: 'Novena',
        valueLoop: 9
    },
    {
        label: 'Thirty',
        valueLoop: 30
    },
]

const inputOfferData: inputProps[] = [
    {
        placeholder: 'FullName',
        icon: editIcon
    },
    {
        placeholder: 'PhoneNumber',
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
