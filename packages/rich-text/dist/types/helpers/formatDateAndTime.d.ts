type DateFormatFn = (date: Date | string, short?: boolean) => string;
/**
 * @param {Date|string} date A valid constructor argument for moment()
 * @param {boolean=} short Render only Today/Tomorrow/Yesterday if valid. Defaults to false
 */
export declare const formatDate: DateFormatFn;
/**
 * Returns the time portion of a date in the local time in the format H:MM AM/PM
 *
 * == Examples
 * * `T15:36:45.000Z` => 3:36 PM (if in +0:00 offset)
 */
export declare const formatTime: DateFormatFn;
export declare const formatDateAndTime: DateFormatFn;
export {};
