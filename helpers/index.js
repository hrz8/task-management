const moment = require('moment');

const toISO = dt => moment(dt)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

module.exports = {
    utcDateDb(date, fallback = false) {
        try {
            return toISO(date);
        } catch (error) {
            if (fallback) return toISO(new Date());
            return null;
        }
    }
};
