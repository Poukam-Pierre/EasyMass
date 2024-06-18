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
import { ParishData } from '../LetOfferMass';
import Calendar from './Calendar';
import Time from './TimeClock';
import { FormikErrors } from 'formik';
import { OfferMass } from 'libs/theme/src/offerMasses/offerMass.interface';

interface DateTimeMassPickerProps {
    id: string,
    name: string,
    parishData: ParishData | undefined
    handleChange: (field: string, value: Dayjs) => Promise<FormikErrors<OfferMass>> | Promise<void>
}
interface DateTime {
    date: Dayjs,
    time: Dayjs | null
}

export default function DateTimeMassPicker({
    parishData,
    id,
    name,
    handleChange
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
        setSelectedDateTime(prevState => {
            return { ...prevState, time: time }
        })
        setIsClockDialog(false)
        setIsCalendarDialog(false)
        const dateTime = selectedDateTime.date.hour(time.hour()).minute(time.minute()).second(0)
        handleChange('dateTime', dateTime)
    }

    const formattedDateTime = `${selectedDate?.format("DD MMMM YYYY")} - ${selectedTime?.format("HH:mm")}`

    const allMassDates = parishData?.massData.map((data) => data.dateTime)

    const isDateAllowed = useCallback((date: Date) => {
        return allMassDates?.some((allowedDate) => isSameDay(date, allowedDate));
    }, [parishData])

    const isTimeAllowed = useCallback((time: Date) => {
        if (selectedDateTime.date) {
            const dateSelected = allMassDates?.filter((date) => isSameDay(date, selectedDateTime.date.toDate()))
            return dateSelected?.some((allowedTime) =>
                allowedTime.getHours() === time.getHours() && allowedTime.getMinutes() === time.getMinutes())
        }
    }, [parishData])

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={activeLanguage}>
            <TextField
                placeholder={formatMessage({ id: 'dateTime' })}
                fullWidth
                inputProps={{ readOnly: true }}
                onClick={parishData ? () => setIsCalendarDialog(true) : undefined}
                value={selectedDate && selectedTime ? formattedDateTime : ''}
                size='small'
            />

            <Dialog
                open={isCalendarDialog}
                onClose={() => setIsCalendarDialog(false)}
            >
                <Calendar
                    selectedDate={selectedDate as Dayjs}
                    handleDate={handleSelectedDate}
                    isDateAllowed={isDateAllowed}
                />
                <Dialog
                    open={isClockDialog}
                    onClose={() => setIsClockDialog(false)}
                >
                    <Time
                        selectedTime={selectedTime as Dayjs}
                        selectedDate={selectedDate as Dayjs}
                        handleTime={handleSelectedTime}
                        isTimeAllowed={isTimeAllowed}
                    />
                </Dialog>

            </Dialog>

        </LocalizationProvider>
    )
}

