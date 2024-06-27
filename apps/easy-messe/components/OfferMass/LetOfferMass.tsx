import { useOfferMass } from '@easy-messe/libs/theme';
import contactIcon from '@iconify-icons/fluent/contact-card-24-regular';
import editIcon from '@iconify-icons/fluent/edit-24-regular';
import locationIcon from '@iconify-icons/fluent/location-24-regular';
import calendarIcon from '@iconify-icons/material-symbols/calendar-month-outline';
import textFieldIcon from '@iconify-icons/material-symbols/text-fields';
import churchIcon from '@iconify-icons/ph/church-light';
import { Icon } from '@iconify/react';
import { Autocomplete, Box, Button, Divider, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import { Dayjs } from 'dayjs';
import { useFormik } from 'formik';
import { ChangeEvent, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import DateTimeMassPicker from "./DateTimeMass/DateTimeMass";
import { LetOfferMassSchema } from './letOfferMass.schema';


interface MassGroupCategory {
    label: string;
    valueOrder: number
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

export interface UseformikProps {
    name: string,
    phone: string,
    anonymous: boolean,
    city: string,
    parish: string,
    dateTime: Dayjs | null,
    intention: string,
    price: number | null

}

interface LetOfferMassProps {
    handleIndexTab?: (index: number) => void
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
                price: 5000,
                dateTime: new Date('2024-06-30T17:30:00'),
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
export default function LetOfferMass({ handleIndexTab }: LetOfferMassProps) {
    const { formatMessage } = useIntl();
    const [isAnonym, setIsAnonym] = useState<boolean>(false)
    const [parishDataFetch, setParishDataFetch] = useState<ParishData[]>()
    const [selectedCity, setSelectedCity] = useState<string>('')
    const [selectedParish, setSelectedParish] = useState<string>('')
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

    useEffect(() => {
        // TODO Fetch masses data from database
        setParishDataFetch(parishDataFetched);
    }, [])

    const selectedCityParishes = parishDataFetched.filter((parish) => parish.city === selectedCity)

    const { handleChange, handleSubmit, setFieldValue, errors, touched } = useFormik<UseformikProps>({
        initialValues: {
            name: '',
            phone: '',
            anonymous: false,
            city: '',
            parish: '',
            dateTime: null,
            intention: '',
            price: null
        },
        onSubmit: (values, { resetForm }) => {
            massRequestDispatch(
                [
                    ...massRequested,
                    {
                        faithInfos: {
                            name: values.name,
                            phone: values.phone,
                            anonymous: values.anonymous
                        },
                        massInfos: {
                            city: values.city,
                            parish: values.parish,
                            dateTime: values.dateTime,
                            intension: values.intension,
                            price: values.price
                        }
                    }]);
            if (handleIndexTab) handleIndexTab(0)
        },
        validationSchema: LetOfferMassSchema
    })

    const handleAnonymous = (event: ChangeEvent<HTMLInputElement>) => {
        setFieldValue('anonymous', event.target.checked)
        setIsAnonym(event.target.checked)
    }
    const handleCity = (city: string) => {
        setFieldValue('city', city);
        setSelectedCity(city)
    }
    const handleParish = (parish: string) => {
        setFieldValue('parish', parish);
        setSelectedParish(parish)

    }
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
                {massOrderCategory.map(({ label }, index) => (
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
                            onChange={handleAnonymous}
                        />
                    }
                    label={formatMessage({ id: 'anonymous' })}
                    sx={{
                        width: 'fit-content'
                    }}
                />
                <Box sx={{
                    display: 'grid',
                    gridAutoFlow: { laptop: 'column', mobile: 'row' },
                    alignItems: 'center',
                    columnGap: 2,
                    rowGap: '10px'
                }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr',
                            alignItems: 'center',
                            columnGap: 1
                        }}
                    >
                        <Icon icon={editIcon} fontSize={32} color="var(--offWhite)" />
                        <TextField
                            name='name'
                            id='name'
                            type='text'
                            placeholder={formatMessage({ id: 'fullName' })}
                            size="small"
                            disabled={isAnonym}
                            onChange={handleChange}
                            required={!isAnonym}
                        />
                    </Box>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr',
                            alignItems: 'center',
                            columnGap: 1
                        }}
                    >
                        <Icon icon={contactIcon} fontSize={32} color="var(--offWhite)" />
                        <TextField
                            name='phone'
                            id='phone'
                            type='tel'
                            placeholder={formatMessage({ id: 'phoneNumber' })}
                            size="small"
                            disabled={isAnonym}
                            onChange={handleChange}
                        />
                    </Box>
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
                                required
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
                            required
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
                        handleDateTimeChange={setFieldValue}
                        handlePriceChange={setFieldValue}
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
                        error={errors.intention && touched.intention ? true : false}
                        id='intention'
                        name='intention'
                        type='text'
                        multiline
                        helperText={(errors.intention && touched.intention) && errors.intention}
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
                        mobile: '-webkit-fill-available'
                    }
                }}
            >{formatMessage({ id: 'addToList' })}</Button>
        </Box>
    );
}


