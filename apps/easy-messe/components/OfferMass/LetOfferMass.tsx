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
import { useFormik } from 'formik';
import { useOfferMass } from '@easy-messe/libs/theme';
import { OfferMass } from 'libs/theme/src/offerMasses/offerMass.interface';


interface MassGroupCategory {
    label: string;
    valueOrder: number
}
interface inputProps {
    placeholder: string,
    icon: IconifyIcon,
    id: string,
    name: string
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

const parishDataFetched: ParishData[] = [
    {
        name: 'Saint Pierre',
        city: 'Douala',
        massData: [
            {
                price: 2500,
                dateTime: new Date('2024-06-20T06:30:00'),
                massType: null
            },
            {
                price: 2500,
                dateTime: new Date('2024-06-13T09:00:00'),
                massType: null
            },
            {
                price: 2500,
                dateTime: new Date('2024-06-19T10:30:00'),
                massType: null
            },
            {
                price: 2500,
                dateTime: new Date('2024-06-18T12:00:00'),
                massType: null
            },
            {
                price: 2500,
                dateTime: new Date('2024-06-17T17:00:00'),
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
                dateTime: new Date('2024-06-17T08:30:00'),
                massType: null
            },
            {
                price: 2000,
                dateTime: new Date('2024-06-19T17:00:00'),
                massType: null
            },
            {
                price: 2000,
                dateTime: new Date('2024-06-19T06:00:00'),
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
                dateTime: new Date('2024-06-30T08:30:00'),
                massType: null
            },
            {
                price: 3000,
                dateTime: new Date('2024-07-12T09:00:00'),
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
export default function LetOfferMass() {
    const { formatMessage } = useIntl();
    const [isAnonym, setIsAnonym] = useState<boolean>(false)
    const [parishDataFetch, setParishDataFetch] = useState<ParishData[]>()
    const [selectedCity, setSelectedCity] = useState<string>()
    const [selectedParish, setSelectedParish] = useState<string>()
    const { massRequestDispatch, massRequested } = useOfferMass()


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
            icon: editIcon,
            name: 'name',
            id: 'name',
        },
        {
            placeholder: 'phoneNumber',
            icon: contactIcon,
            name: 'phone',
            id: 'phone',
        },
    ]

    useEffect(() => {
        setParishDataFetch(parishDataFetched);
    }, [])

    const selectedCityParishes = parishDataFetched.filter((parish) => parish.city === selectedCity)

    const { handleChange, values, handleSubmit, setFieldValue } = useFormik<OfferMass>({
        initialValues: {
            faithInfos: {
                name: null,
                phone: null,
                anonymous: false,
            },
            massInfos: {
                city: '',
                parish: '',
                dateTime: null,
                intension: ''
            }
        },
        onSubmit: (values) => {
            massRequestDispatch(values);
            console.log(values)
        }
    })

    const handleChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue('anonymous', event.target.checked)
        setIsAnonym(event.target.checked)
    }
    const handleCity = (city: string) => {
        setFieldValue('city', city)
        setSelectedCity(city)
    }
    const handleParish = (parish: string) => {
        setFieldValue('parish', parish)
        setSelectedParish(parish)
    }
    console.log(massRequested)
    return (
        <Box sx={{
            padding: '21px',
        }}
            component='form'
            onSubmit={handleSubmit}
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
                            name='anonymous'
                            id='anonymous'
                            onChange={handleChecked}
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
                    {inputOfferData.map(({ placeholder, icon, id, name }, index) => (
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
                                name={name}
                                id={id}
                                placeholder={formatMessage({ id: placeholder })}
                                size="small"
                                disabled={isAnonym}
                                onChange={handleChange}
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
                        id='city'
                        disablePortal
                        options={parishDataFetch?.map((parish) => parish.city) as string[]}
                        renderInput={(params) =>
                            <TextField
                                {...params}
                                placeholder={formatMessage({ id: 'city' })}
                                size="small"
                            />
                        }
                        onChange={(_, city) => handleCity(city as string)}
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
                        id='parish'
                        disablePortal
                        options={selectedCityParishes.map((parish) => parish.name)}
                        renderInput={(params) => <TextField
                            {...params}
                            placeholder={formatMessage({ id: 'parish' })}
                            size='small'
                        />}
                        onChange={(_, parish) => handleParish(parish as string)}
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
                    <DateTimeMassPicker
                        id='dateTime'
                        name='dateTime'
                        parishData={
                            parishDataFetch?.find((parish) =>
                                parish.name === selectedParish && parish.city === selectedCity
                            )
                        }
                        handleChange={setFieldValue}
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
                        id='intension'
                        name='intension'
                        multiline
                        rows={5}
                        placeholder={formatMessage({ id: 'massIntension' })}
                        fullWidth
                        onChange={handleChange}
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


