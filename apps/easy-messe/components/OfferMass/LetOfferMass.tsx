import contactIcon from '@iconify-icons/fluent/contact-card-24-regular';
import editIcon from '@iconify-icons/fluent/edit-24-regular';
import locationIcon from '@iconify-icons/fluent/location-24-regular';
import calendarIcon from '@iconify-icons/material-symbols/calendar-month-outline';
import textFieldIcon from '@iconify-icons/material-symbols/text-fields';
import churchIcon from '@iconify-icons/ph/church-light';
import { Icon, IconifyIcon } from '@iconify/react';
import { Autocomplete, Box, Button, Divider, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import DateTimeMassPicker from "./DateTimeMass/DateTimeMass";
import { useIntl } from 'react-intl';
import { useEffect, useState } from 'react';


interface MassGroupCategory {
    label: string;
    valueOrder: number
}
interface inputProps {
    placeholder: string,
    icon: IconifyIcon
}
enum MassTypeEnum {
    Triduum = 'triduum',
    Seven = 'seven',
    Novena = 'novena',
    Thirty = 'thirty',
}
interface Mass {
    price: number,
    dateTime: Date,
    massType: MassTypeEnum | null
}
export interface ParishData {
    name: string,
    city: string,
    massData: Mass[]

}

export default function LetOfferMass() {
    const { formatMessage } = useIntl();
    const [isAnonym, setIsAnonym] = useState<boolean>(false)
    const [parishDataFetch, setParishDataFetch] = useState<ParishData[]>()
    const [selectedCity, setSelectedCity] = useState<string>()
    const [selectedParish, setSelectedParish] = useState<string>()

    const parishDataFetched: ParishData[] = [
        {
            name: 'Saint Pierre',
            city: 'Douala',
            massData: [
                {
                    price: 2500,
                    dateTime: new Date('2024-06-13T06:30:00'),
                    massType: null
                },
                {
                    price: 2500,
                    dateTime: new Date('2024-06-13T09:00:00'),
                    massType: null
                },
                {
                    price: 2500,
                    dateTime: new Date('2024-06-13T010:30:00'),
                    massType: null
                },
                {
                    price: 2500,
                    dateTime: new Date('2024-06-13T12:00:00'),
                    massType: null
                },
                {
                    price: 2500,
                    dateTime: new Date('2024-06-16T17:00:00'),
                    massType: null
                },
            ]
        },
        {
            name: 'Saint Michel Archange',
            city: 'Bafoussam',
            massData: [
                {
                    price: 2000,
                    dateTime: new Date('2024-06-12T08:30:00'),
                    massType: null
                },
                {
                    price: 2000,
                    dateTime: new Date('2024-06-14T17:00:00'),
                    massType: null
                },
                {
                    price: 2000,
                    dateTime: new Date('2024-06-16T06:30:00'),
                    massType: null
                },
            ]
        },
        {
            name: 'Saint Dominique Savio',
            city: 'Yaoundé',
            massData: [
                {
                    price: 3000,
                    dateTime: new Date('2024-06-10T08:30:00'),
                    massType: null
                },
                {
                    price: 3000,
                    dateTime: new Date('2024-06-12T09:00:00'),
                    massType: null
                },
                {
                    price: 3000,
                    dateTime: new Date('2024-06-16T17:00:00'),
                    massType: null
                },
            ]
        },
    ]
    const massOrderCategory: MassGroupCategory[] = [
        {
            label: 'triduum',
            valueOrder: 3
        },
        {
            label: 'seven',
            valueOrder: 7
        },
        {
            label: 'novena',
            valueOrder: 9
        },
        {
            label: 'thirty',
            valueOrder: 30
        },
    ]

    const inputOfferData: inputProps[] = [
        {
            placeholder: 'fullName',
            icon: editIcon
        },
        {
            placeholder: 'phoneNumber',
            icon: contactIcon
        },
    ]

    useEffect(() => {
        setParishDataFetch(parishDataFetched);
    }, [])

    const selectedCityParishes = parishDataFetched.filter((parish) => parish.city === selectedCity)
    return (
        <Box sx={{
            padding: '21px',
        }}
            component='form'
        >
            <Box sx={{
                padding: '10px 0 20px 0',
                display: { laptop: 'grid', mobile: 'none' },
                gridAutoFlow: 'column',
                columnGap: 2,
                width: 'fit-content'
            }}>
                {massOrderCategory.map(({ label, valueOrder }, index) => (
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
                {massOrderCategory.map(({ label, valueOrder }, index) => (
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
            <Typography variant="h2">{formatMessage({ id: 'applicantInformation' })}</Typography>
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
                            onChange={(event) => setIsAnonym(event.target.checked)}
                        />
                    }
                    label={formatMessage({ id: 'anonymous' })}
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
            <Typography variant="h2">{formatMessage({ id: 'massInformations' })}</Typography>
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
                        options={parishDataFetch?.map((parish) => parish.city) as string[]}
                        renderInput={(params) => <TextField
                            {...params}
                            placeholder={formatMessage({ id: 'City' })}
                            size="small"
                        />
                        }
                        onChange={(_, city) => setSelectedCity(city as string)}
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
                        options={selectedCityParishes.map((parish) => parish.name)}
                        renderInput={(params) => <TextField
                            {...params}
                            placeholder={formatMessage({ id: 'Parish' })}
                            size='small'
                        />}
                        onChange={(_, parish) => setSelectedParish(parish as string)}
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
                    <Icon
                        icon={calendarIcon}
                        fontSize={32}
                        color="var(--offWhite)"
                    />
                    <DateTimeMassPicker parishData={
                        parishDataFetch?.find((parish) =>
                            parish.name === selectedParish && parish.city === selectedCity
                        )
                    }
                    />
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    columnGap: 1,
                    width: '100%'
                }}>
                    <Icon
                        icon={textFieldIcon}
                        fontSize={32}
                        color="var(--offWhite)"
                    />
                    <TextField
                        multiline
                        rows={5}
                        placeholder={formatMessage({ id: 'massIntension' })}
                        fullWidth
                    />
                </Box>
            </Box>
            <Button
                variant="contained"
                disableElevation
                type="submit"
                sx={{
                    width: {
                        laptop: 'fit-content',
                        tablet: 'fir-content',
                        mobile: '-webkit-fill-available'
                    }
                }}
            >{formatMessage({ id: 'addToList' })}</Button>
        </Box>
    );
}


