import { DateCalendar, PickersDayProps, PickersDay } from '@mui/x-date-pickers';
import { Dayjs } from "dayjs";


interface CalendarProps {
    selectedDate: Dayjs,
    handleDate: (date: Dayjs) => void
    isDateAllowed: (date: Date) => boolean | undefined
}

export default function Calendar({
    selectedDate,
    handleDate,
    isDateAllowed
}: CalendarProps) {

    const renderDay = (props: PickersDayProps<Dayjs>) => {
        const { day, outsideCurrentMonth, ...other } = props
        const isAllowed = isDateAllowed(day.toDate())
        return (
            <PickersDay
                {...other}
                day={day}
                selected={isAllowed}
                outsideCurrentMonth={outsideCurrentMonth}
            />
        )
    }

    return (
        <DateCalendar
            value={selectedDate}
            onChange={(newDate) => handleDate(newDate)}
            shouldDisableDate={(date) => !isDateAllowed(date.toDate())}
            slots={{
                day: renderDay
            }}
        />
    )
}