
const getWeekdayName = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
};

console.log('2026-04-22:', getWeekdayName('2026-04-22'));
console.log('2026-04-19:', getWeekdayName('2026-04-19'));
console.log('22-04-2026 (DD-MM-YYYY):', getWeekdayName('22-04-2026'));
console.log('04-22-2026 (MM-DD-YYYY):', getWeekdayName('04-22-2026'));

