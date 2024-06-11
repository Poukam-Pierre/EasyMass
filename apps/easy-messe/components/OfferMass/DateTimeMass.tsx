import { useLanguage } from '@easy-messe/libs/theme';
import { Dialog } from '@mui/material';
import TextField from '@mui/material/TextField';
import { DateCalendar, DigitalClock, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import { useState } from 'react';
import { useIntl } from 'react-intl';


export default function DateTimeMassPicker() {
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

    const formattedDateTime = `${selectedDate?.format("DD MMMM YYYY")} - ${selectedTime?.format("HH:mm")}`

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={activeLanguage}>
            <TextField
                placeholder={formatMessage({ id: 'DateTime' })}
                fullWidth
                inputProps={{ readOnly: true }}
                onClick={() => setOpenCalendarDialog(true)}
                value={formattedDateTime.includes('undefined') ? '' : formattedDateTime}
                size='small'
            />
            <Dialog
                open={openCalendarDialog}
                onClose={() => setOpenCalendarDialog(false)}
            >
                <DateCalendar
                    value={selectedDate}
                    onChange={(newValue) => handleSelectedDate(newValue)}
                />
                <Dialog
                    open={openClockDialog}
                    onClose={() => setOpenClockDialog(false)}
                >
                    <DigitalClock
                        value={selectedTime}
                        onChange={(newTime) => setSelectdTime(newTime)}
                    />
                </Dialog>

            </Dialog>

        </LocalizationProvider>
    )
}

