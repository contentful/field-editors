/**
 * Transforms a number into a localized string (en-US)
 * toLocaleString(1000); // "1,000"
 * @param {Number} number
 */
export function toLocaleString(number: number) {
  return number.toLocaleString('en-US');
}

function formatFloat(value: number, localize: boolean) {
  return localize
    ? toLocaleString(value)
    : value
        .toFixed(2)
        // remove floating point if not necessary
        .replace(/\.(0)*$|0*$/, '');
}

type UnitOfMeasure = 'PB' | 'TB' | 'GB' | 'MB' | 'KB' | 'B';

/**
 * Make a storage unit number more readable by making them smaller
 * shortenStorageUnit(1000, 'GB'); // "1 TB"
 * shortenStorageUnit(0.001, 'TB'); // "1 GB"
 * @param value
 * @param uom Unit of measure
 * @returns
 */
export function shortenStorageUnit(value: number, uom: UnitOfMeasure) {
  if (value <= 0) {
    return '0 B';
  }

  const units: UnitOfMeasure[] = ['PB', 'TB', 'GB', 'MB', 'KB', 'B'];

  const getBigger = (unit: UnitOfMeasure): UnitOfMeasure => units[units.indexOf(unit) - 1];
  const getSmaller = (unit: UnitOfMeasure) => units[units.indexOf(unit) + 1];
  const isBiggestUnit = (unit: UnitOfMeasure) => units.indexOf(unit) === 0;
  const isSmallestUnit = (unit: UnitOfMeasure) => units.indexOf(unit) === units.length - 1;

  const reduce = (number: number, unit: UnitOfMeasure): { number: number; unit: UnitOfMeasure } => {
    if (number < 0.99 && !isSmallestUnit(unit)) {
      return reduce(number * 1000, getSmaller(unit));
    } else if (number >= 1000 && !isBiggestUnit(unit)) {
      return reduce(number / 1000, getBigger(unit));
    } else {
      return { number, unit };
    }
  };

  const { number, unit } = reduce(value, uom);

  return `${formatFloat(number, false)} ${unit}`;
}
