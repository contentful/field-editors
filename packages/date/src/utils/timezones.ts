import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export type Timezone = {
  displayValue: string;
  ianaName: string;
};

//@ts-expect-error
const timezones = Intl.supportedValuesOf('timeZone').map((timezone: string) => ({
  displayValue: `(GMT${dayjs.tz(undefined, timezone).format('Z')}) - ${timezone.replace('_', ' ')}`,
  ianaName: timezone,
}));

export default timezones;
