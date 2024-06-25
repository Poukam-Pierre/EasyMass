import { useLanguage } from '@easy-messe/libs/theme';
import { Dialog } from '@mui/material';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { isSameDay } from 'date-fns/isSameDay';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { ParishData, UseformikProps } from '../LetOfferMass';
import Calendar from './Calendar';
import Time from './TimeClock';
import { FormikErrors } from 'formik';
import { OfferMass } from 'libs/theme/src/offerMasses/offerMass.interface';
import { formattedDateTime } from '@easy-messe/libs/utils';

interface DateTimeMassPickerProps {
    id: string,
    name: string,
    parishData: ParishData | undefined
    handleDateTimeChange: (field: string, value: Dayjs) => Promise<FormikErrors<UseformikProps>> | Promise<void>
    handlePriceChange: (field: string, value: number) => Promise<FormikErrors<UseformikProps>> | Promise<void>
}
interface DateTime {
    date: Dayjs,
    time: Dayjs | null
}

export default function DateTimeMassPicker({
    parishData,
    id,
    name,
    handleDateTimeChange,
    handlePriceChange
}: DateTimeMassPickerProps) {
    const [isCalendarDialog, setIsCalendarDialog] = useState<boolean>(false)
    const [selectedDateTime, setSelectedDateTime] = useState<DateTime>({ date: dayjs(), time: null })
    const [isClockDialog, setIsClockDialog] = useState<boolean>(false)
    const { formatMessage } = useIntl()
    const { activeLanguage } = useLanguage()


    const handleSelectedDate = (date: Dayjs) => {
        setSelectedDateTime(prevState => {
            return { ...prevState, date: date }
        });
        setIsClockDialog(true)
    }

    const handleSelectedTime = (time: Dayjs) => {
        const dateTime = selectedDateTime.date.hour(time.hour()).minute(time.minute()).second(0)
        const price = parishData?.massData.find((mass) => dayjs(mass.dateTime).isSame(dateTime))
        setSelectedDateTime(prevState => {
            return { ...prevState, time: time }
        })
        setIsClockDialog(false)
        setIsCalendarDialog(false)
        handleDateTimeChange('dateTime', dateTime)
        handlePriceChange('price', price?.price as number)
    }

    const allMassDates = parishData?.massData.map((data) => data.dateTime)

    const isDateAllowed = useCallback((date: Date) => {
        return allMassDates?.some((allowedDate) => isSameDay(date, allowedDate));
    }, [allMassDates])

    const isTimeAllowed = useCallback((time: Date) => {
        if (selectedDateTime.date) {
            const dateSelected = allMassDates?.filter((date) => isSameDay(date, selectedDateTime.date.toDate()))
            return dateSelected?.some((allowedTime) =>
                allowedTime.getHours() === time.getHours() && allowedTime.getMinutes() === time.getMinutes())
        }
    }, [allMassDates])

    return (
        <>
            <TextField
                id={id}
                name={name}
                placeholder={formatMessage({ id: 'dateTime' })}
                fullWidth
                inputProps={{ readOnly: true }}
                onClick={parishData ? () => setIsCalendarDialog(true) : undefined}
                value={selectedDateTime.date && selectedDateTime.time ?
                    formattedDateTime(
                        selectedDateTime
                            .date
                            .hour(selectedDateTime.time.hour())
                            .minute(selectedDateTime.time.minute())
                            .second(0)
                    ) : ''}
                size='small'
            />
            <Dialog
                open={isCalendarDialog}
                onClose={() => setIsCalendarDialog(false)}
            >
                <Calendar
                    selectedDate={selectedDateTime.date}
                    handleDate={handleSelectedDate}
                    isDateAllowed={isDateAllowed}
                />
                <Dialog
                    open={isClockDialog}
                    onClose={() => setIsClockDialog(false)}
                >
                    <Time
                        selectedTime={selectedDateTime.time as Dayjs}
                        selectedDate={selectedDateTime.date}
                        handleTime={handleSelectedTime}
                        isTimeAllowed={isTimeAllowed}
                    />
                </Dialog>

            </Dialog>
        </>

    )
}

