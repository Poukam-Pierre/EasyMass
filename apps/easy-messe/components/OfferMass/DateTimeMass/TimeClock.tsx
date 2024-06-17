import { DigitalClock } from "@mui/x-date-pickers";
import { isSameDay } from "date-fns";
import dayjs, { Dayjs } from "dayjs";

interface TimeProps {
    selectedTime: Dayjs,
    selectedDate: Dayjs,
    handleTime: (time: Dayjs) => void
    isTimeAllowed: (time: Date) => boolean | undefined

}
function Time({
    selectedTime,
    selectedDate,
    handleTime,
    isTimeAllowed
}: TimeProps) {
    return (
        <DigitalClock
            disablePast={isSameDay(dayjs().toDate(), selectedDate.toDate())}
            skipDisabled
            value={selectedTime}
            timeStep={15}
            onChange={(newTime) => handleTime(newTime)}
            shouldDisableTime={(newTime) => !isTimeAllowed(newTime.toDate()) as boolean}
        />
    );
}

export default Time;