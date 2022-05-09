import moment from 'moment-timezone';

export type Timezone = {
  displayValue: string;
  ianaName: string;
};

const timezones = moment.tz.names().map((timezone) => ({
  displayValue: `(GMT${moment.tz(timezone).format('Z')}) - ${timezone.replace('_', ' ')}`,
  ianaName: timezone,
}));

export default timezones;
