import { useOfferMass } from '@easy-messe/libs/theme';
import { apiMiddleware } from '@easy-messe/libs/utils';
import contactIcon from '@iconify-icons/fluent/contact-card-24-regular';
import editIcon from '@iconify-icons/fluent/edit-24-regular';
import locationIcon from '@iconify-icons/fluent/location-24-regular';
import calendarIcon from '@iconify-icons/material-symbols/calendar-month-outline';
import textFieldIcon from '@iconify-icons/material-symbols/text-fields';
import churchIcon from '@iconify-icons/ph/church-light';
import { Icon } from '@iconify/react';
import { Autocomplete, Box, Button, Divider, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import dayjs, { Dayjs } from 'dayjs';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import DateTimeMassPicker from "./DateTimeMass/DateTimeMass";



enum MassTypeEnum {
    Unique = 'unique',
    Triduum = 'triduum',
    Seven = 'seven',
    Novena = 'novena',
    Thirty = 'thirty',
}
interface MassGroupCategory {
    label: MassTypeEnum;
    /** How many consecutive open masses this type represents — 1 for
     * Unique, matching the "defaulted to unique" behavior of a single
     * order. */
    valueOrder: number
}

interface Mass {
    massId: string,
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
    price: number | null,
    massId: string | null,
    massType: MassTypeEnum

}

/** Sorts a parish's open masses chronologically and returns the `count`
 * consecutive ones starting at `startMassId` — "consecutive" meaning
 * consecutive *available open slots* at that parish, not consecutive
 * calendar days (a parish without daily Mass could never fulfill a
 * Novena otherwise). Returns null if fewer than `count` remain from that
 * starting point, so the caller can reject with a clear message instead
 * of silently handing back a short, incomplete list. */
function resolveConsecutiveMasses(massData: Mass[], startMassId: string, count: number): Mass[] | null {
    const sorted = [...massData].sort((a, b) => dayjs(a.dateTime).valueOf() - dayjs(b.dateTime).valueOf());
    const startIndex = sorted.findIndex((mass) => mass.massId === startMassId);
    if (startIndex === -1) return null;
    const consecutive = sorted.slice(startIndex, startIndex + count);
    return consecutive.length === count ? consecutive : null;
}

interface LetOfferMassProps {
    handleIndexTab?: (index: number) => void
}

export default function LetOfferMass({ handleIndexTab }: LetOfferMassProps) {
    const { formatMessage } = useIntl();
    const [parishData, setParishData] = useState<ParishData[]>([])
    const [selectedCity, setSelectedCity] = useState<string>('')
    const [selectedParish, setSelectedParish] = useState<string>('')
    const { massRequestDispatch, massRequested } = useOfferMass()


    const massOrderCategory: MassGroupCategory[] = [
        {
            label: MassTypeEnum.Unique,
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

    useEffect(() => {
        apiMiddleware({
            url: `${process.env.NEXT_PUBLIC_API_URL}/parishes/masses`,
            method: 'GET',
            onSuccess: (response: unknown) => {
                setParishData(response as ParishData[]);
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onFailure: () => { }
        })
    }, [])

    const selectedCityParishes = parishData.filter((parish) => parish.city === selectedCity)
    const selectedParishData = parishData.find((parish) => parish.name === selectedParish && parish.city === selectedCity)

    const { handleChange, handleSubmit, setFieldValue, resetForm, errors, touched, values } = useFormik<UseformikProps>({
        initialValues: {
            name: '',
            phone: '',
            anonymous: false,
            city: '',
            parish: '',
            dateTime: null,
            intention: '',
            price: null,
            massId: null,
            massType: MassTypeEnum.Unique
        },
        onSubmit: ({
            name, phone, anonymous,
            city, parish, dateTime,
            intention, price, massId, massType
        }) => {
            // A checkout can only ever span one parish (enforced server-side
            // too, at both preview and real checkout) — caught here, at the
            // moment of adding to the cart, instead of opaquely inside the
            // payment modal. The user clears their cart themselves to
            // switch parishes; nothing gets silently wiped for them.
            const existingOrder = massRequested[0];
            if (existingOrder && (existingOrder.massInfos.city !== city || existingOrder.massInfos.parish !== parish)) {
                toast.error(
                    `${formatMessage({ id: 'cartSingleParishOnly' })} ${existingOrder.massInfos.parish}. ${formatMessage({ id: 'cartClearToSwitch' })}`
                );
                return;
            }

            const category = massOrderCategory.find((c) => c.label === massType);
            const requiredCount = category?.valueOrder ?? 1;

            if (requiredCount > 1) {
                // Triduum/Seven/Novena/Thirty — same intention/believer info
                // offered at `requiredCount` consecutive open masses at this
                // one parish, rather than a single mass.
                const consecutiveMasses = selectedParishData && massId
                    ? resolveConsecutiveMasses(selectedParishData.massData, massId, requiredCount)
                    : null;

                if (!consecutiveMasses) {
                    toast.error(formatMessage({ id: 'notEnoughOpenMasses' }));
                    return;
                }

                massRequestDispatch([
                    ...massRequested,
                    ...consecutiveMasses.map((mass) => ({
                        faithInfos: anonymous ?
                            undefined : { name, phone },
                        massInfos: {
                            massId: mass.massId,
                            city,
                            parish,
                            dateTime: dayjs(mass.dateTime),
                            intention,
                            price: mass.price,
                            anonymous
                        }
                    }))
                ]);
                toast.success(`${consecutiveMasses.length} ${formatMessage({ id: 'massesAddedToCart' })}`);
                resetForm();
                setSelectedCity('');
                setSelectedParish('');
                if (handleIndexTab) handleIndexTab(0)
                return;
            }

            massRequestDispatch(
                [
                    ...massRequested,
                    {
                        faithInfos: anonymous ?
                            undefined : {
                                name: name,
                                phone: phone,
                            },
                        massInfos: {
                            massId: massId,
                            city: city,
                            parish: parish,
                            dateTime: dateTime,
                            intention: intention,
                            price: price,
                            anonymous: anonymous
                        }
                    }]);
            resetForm();
            setSelectedCity('');
            setSelectedParish('');
            if (handleIndexTab) handleIndexTab(0)
        },
        validationSchema: yup.object().shape({
            phone: yup.string()
                .when('anonymous', {
                    is: false,
                    then: (schema) => schema.required(formatMessage({ id: 'phoneWarningMsg' }))
                }),
            dateTime: yup.mixed().required(formatMessage({ id: 'dateTimeChecked' })),
            massId: yup.string().required(formatMessage({ id: 'dateTimeChecked' })),
            intention: yup
                .string()
                .required(formatMessage({ id: 'intentionChecked' }))
                .max(300, formatMessage({ id: 'intentionNumberChecked' }))
        })
    })

    const handleCity = (city: string) => {
        setFieldValue('city', city);
        setFieldValue('parish', '');
        setFieldValue('dateTime', null);
        setFieldValue('price', null);
        setFieldValue('massId', null);
        setSelectedCity(city)
        setSelectedParish('')
    }
    const handleParish = (parish: string) => {
        setFieldValue('parish', parish);
        setFieldValue('dateTime', null);
        setFieldValue('price', null);
        setFieldValue('massId', null);
        setSelectedParish(parish)

    }

    // Soft, early hint only — a parish with fewer open masses in total than
    // a type requires clearly can't fulfill it, so there's no point letting
    // it be picked. This doesn't guarantee success once a specific start
    // date is chosen (that needs enough *consecutive* slots from that exact
    // point on, not just enough in total) — resolveConsecutiveMasses at
    // submit time is the real, authoritative check either way.
    const isCategoryDisabled = (valueOrder: number) =>
        !!selectedParishData && selectedParishData.massData.length < valueOrder

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
                        variant={values.massType === label ? 'contained' : 'outlined'}
                        disabled={isCategoryDisabled(valueOrder)}
                        onClick={() => setFieldValue('massType', label)}
                        type="button"
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
                        variant={values.massType === label ? 'contained' : 'outlined'}
                        sx={{
                            minWidth: { laptop: 'initial', mobile: '145px' }
                        }}
                        disabled={isCategoryDisabled(valueOrder)}
                        onClick={() => setFieldValue('massType', label)}
                        type="button"
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
                            onChange={(e) => setFieldValue('anonymous', e.target.checked)}
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
                            placeholder={formatMessage({ id: 'fullName' })}
                            size="small"
                            type='text'
                            disabled={values.anonymous}
                            onChange={handleChange}
                            required={!values.anonymous}
                            helperText={(errors.name && touched.name) && errors.name}
                            error={errors.name && touched.name ? true : false}
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
                            required={!values.anonymous}
                            name='phone'
                            id='phone'
                            type='tel'
                            placeholder={formatMessage({ id: 'phoneNumber' })}
                            size="small"
                            disabled={values.anonymous}
                            onChange={handleChange}
                            helperText={(errors.phone && touched.phone) && errors.phone}
                            error={errors.phone && touched.phone ? true : false}
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
                        options={parishData?.map((parish) => parish.city) as string[]}
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
                            placeholder={formatMessage({ id: 'parishes' })}
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
                        key={`${selectedCity}-${selectedParish}`}
                        id='dateTime'
                        name='dateTime'
                        parishData={
                            parishData.find((parish) =>
                                parish.name === selectedParish && parish.city === selectedCity
                            )
                        }
                        handleChange={setFieldValue}
                        error={errors.dateTime && touched.dateTime ? true : false}
                        helperText={(errors.dateTime && touched.dateTime) ?
                            errors.dateTime : ''}
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
                        id='intention'
                        name='intention'
                        type='text'
                        multiline
                        rows={5}
                        placeholder={formatMessage({ id: 'massIntention' })}
                        fullWidth
                        onChange={handleChange}
                        error={errors.intention && touched.intention ? true : false}
                        helperText={(errors.intention && touched.intention) && errors.intention}
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