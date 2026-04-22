
export const formatTime = (timeStr) => {
    if (!timeStr) return '';

    // If it's already in 12h format
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;

    // If it's in 24h format (HH:MM or HH:MM:SS)
    if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':');
        let hrs = parseInt(hours);
        const ampm = hrs >= 12 ? 'PM' : 'AM';
        hrs = hrs % 12;
        hrs = hrs ? hrs : 12;
        return `${hrs}:${minutes.substring(0, 2)} ${ampm}`;
    }

    return timeStr;
};
