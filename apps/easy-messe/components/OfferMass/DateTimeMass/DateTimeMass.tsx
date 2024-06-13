import { useLanguage } from '@easy-messe/libs/theme';
import { Dialog } from '@mui/material';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { isSameDay } from 'date-fns/isSameDay';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { ParishDataFetch } from '../LetOfferMass';
import Calendar from './Calendar';
import Time from './TimeClock';


export default function DateTimeMassPicker({
    parishDataFetch
}: {
    parishDataFetch: ParishDataFetch | undefined
}) {
    const [openCalendarDialog, setOpenCalendarDialog] = useState<boolean>(false)
    const [selectedDate, setSelectdDate] = useState<Dayjs | null>()
    const [openClockDialog, setOpenClockDialog] = useState<boolean>(false)
    const [selectedTime, setSelectdTime] = useState<Dayjs | null>()
    const { formatMessage } = useIntl()
    const { activeLanguage } = useLanguage()


    const handleSelectedDate = (date: Dayjs) => {
        setSelectdDate(date);
        setOpenClockDialog(true)
    }
    const handleSelectedTime = (time: Dayjs) => {
        setSelectdTime(time);
        setOpenClockDialog(false)
        setOpenCalendarDialog(false)
    }

    const formattedDateTime = `${selectedDate?.format("DD MMMM YYYY")} - ${selectedTime?.format("HH:mm")}`

    const allMassDates = parishDataFetch?.massData.map((data) => data.dateTime)

    const isDateAllowed = (date: Date) => {
        return allMassDates?.some((allowedDate) => isSameDay(date, allowedDate));
    }

    const isTimeAllowed = (time: Date) => {
        if (selectedDate) {
            const dateSelected = allMassDates?.filter((date) => isSameDay(date, selectedDate.toDate()))
            return dateSelected?.some((allowedTime) =>
                allowedTime.getHours() === time.getHours() && allowedTime.getMinutes() === time.getMinutes())
        }
    }
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={activeLanguage}>
            <TextField
                placeholder={formatMessage({ id: 'DateTime' })}
                fullWidth
                inputProps={{ readOnly: true }}
                onClick={parishDataFetch ? () => setOpenCalendarDialog(true) : undefined}
                value={formattedDateTime.includes('undefined') ? '' : formattedDateTime}
                size='small'
            />

            <Dialog
                open={openCalendarDialog}
                onClose={() => setOpenCalendarDialog(false)}
            >
                <Calendar
                    selectedDate={selectedDate as Dayjs}
                    handleDate={handleSelectedDate}
                    isDateAllowed={isDateAllowed}
                />
                <Dialog
                    open={openClockDialog}
                    onClose={() => setOpenClockDialog(false)}
                >
                    <Time
                        selectedTime={selectedTime as Dayjs}
                        handleTime={handleSelectedTime}
                        isTimeAllowed={isTimeAllowed}
                    />
                </Dialog>

            </Dialog>

        </LocalizationProvider>
    )
}

