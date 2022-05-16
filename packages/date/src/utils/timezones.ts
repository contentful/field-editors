import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { timeZonesNames } from '@vvo/tzdb';

dayjs.extend(utc);
dayjs.extend(timezone);

export type Timezone = {
  displayValue: string;
  ianaName: string;
};

// Borrowed from https://github.com/tc39/proposal-intl-enumeration/blob/master/polyfill/timeZones.js
function isSupported(timeZone: string): boolean {
  try {
    const newFormat = new Intl.DateTimeFormat('en', { timeZone });
    const options = newFormat.resolvedOptions();
    return options.timeZone === timeZone;
  } catch (e) {
    return false;
  }
}

const timezones = timeZonesNames
  .filter((timezone: string) => isSupported(timezone))
  .map((timezone: string) => ({
    displayValue: `(GMT${dayjs.tz(undefined, timezone).format('Z')}) - ${timezone.replace(
      '_',
      ' '
    )}`,
    ianaName: timezone,
  }));

export default timezones;
