import { DigitalClock } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";

interface TimeProps {
    selectedTime: Dayjs,
    handleTime: (time: Dayjs) => void
    isTimeAllowed: (time: Date) => boolean | undefined

}
function Time({
    selectedTime,
    handleTime,
    isTimeAllowed
}: TimeProps) {
    return (
        <DigitalClock
            skipDisabled
            value={selectedTime}
            timeStep={15}
            onChange={(newTime) => handleTime(newTime)}
            shouldDisableTime={(newTime) => !isTimeAllowed(newTime.toDate()) as boolean}
        />
    );
}

export default Time;