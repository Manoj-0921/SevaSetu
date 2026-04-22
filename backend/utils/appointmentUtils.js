
const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;

    // Check if it's 12-hour format (has AM/PM)
    const parts = timeStr.trim().split(' ');
    if (parts.length === 2) {
        const [timePart, modifier] = parts;
        let [hours, minutes] = timePart.split(':').map(Number);
        if (modifier.toUpperCase() === 'PM' && hours !== 12) hours += 12;
        if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
    }

    // Check if it's 24-hour format (no AM/PM)
    if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
            return hours * 60 + minutes;
        }
    }

    return null;
};

const isTimeWithinRange = (time, start, end) => {
    const requested = parseTimeToMinutes(time);
    const startMinutes = parseTimeToMinutes(start);
    const endMinutes = parseTimeToMinutes(end);
    if (requested === null || startMinutes === null || endMinutes === null) return false;
    return requested >= startMinutes && requested < endMinutes;
};

const getWeekdayName = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
};

const validateDoctorAvailability = async (doctor, date, time, AppointmentModel, excludeAppointmentId = null) => {
    if (!doctor) {
        return { msg: 'Doctor not found' };
    }

    if (!doctor.isAvailable) {
        return { msg: 'Doctor is currently unavailable for booking.' };
    }

    const weekday = getWeekdayName(date);
    if (!weekday) {
        return { msg: 'Invalid appointment date format' };
    }

    if (doctor.availableDays && doctor.availableDays.length > 0 && !doctor.availableDays.includes(weekday)) {
        return {
            msg: `Doctor is not available on ${weekday}. Available days: ${doctor.availableDays.join(', ')}.`,
        };
    }

    if (!isTimeWithinRange(time, doctor.availableTimeStart, doctor.availableTimeEnd)) {
        return {
            msg: `Doctor is only available between ${doctor.availableTimeStart} and ${doctor.availableTimeEnd}. Please choose another time.`,
        };
    }

    const conflict = await AppointmentModel.findOne({
        doctor: doctor._id,
        date,
        time,
        status: { $in: ['pending', 'confirmed'] },
        ...(excludeAppointmentId ? { _id: { $ne: excludeAppointmentId } } : {}),
    });
    if (conflict) {
        return { msg: 'This time slot is already booked. Please choose another.' };
    }

    return null;
};

module.exports = {
    parseTimeToMinutes,
    isTimeWithinRange,
    getWeekdayName,
    validateDoctorAvailability
};
