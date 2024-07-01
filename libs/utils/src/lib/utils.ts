import { Dayjs } from 'dayjs';

type NumberUnit = 'K' | 'M' | 'B' | 'T' | 'P' | 'E';

export function shortenNumber(rawNumber: number) {
  if (rawNumber < 1000) {
    return rawNumber;
  }

  const si: { v: number; s: NumberUnit }[] = [
    { v: 1e3, s: 'K' },
    { v: 1e6, s: 'M' },
    { v: 1e9, s: 'B' },
    { v: 1e12, s: 'T' },
    { v: 1e15, s: 'P' },
    { v: 1e18, s: 'E' },
  ];
  let index;
  for (index = si.length - 1; index > 0; index--) {
    if (rawNumber >= si[index].v) {
      break;
    }
  }
  return (
    (rawNumber / si[index].v)
      .toFixed(2)
      .replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + si[index].s
  );
}

export function random() {
  return Math.floor(Math.random() * 10);
}

/**
 * @description function is used to generate kinda like acronyms from given words
 * it does so by taking a string, splitting it with the space separator and for every word,
 * with the exception of the first word whose first letter is used in all cases,
 * other words need to be longer than 3 characters before their first letters are considered.
 * this avoids us adding is, and, de, etc to acronyms
 *
 * @param {string} value - the value to generate short version
 * @returns  {string} - the generated acronym in uppercase
 */
export function generateShort(value: string) {
  let code = '';
  value.split(' ').forEach((word, index) => {
    if (word.length > 0) {
      if (index === 0) code = `${code}${word[0].toUpperCase()}`;
      if (word.length > 3 && index !== 0)
        code = `${code}${word[0].toUpperCase()}`;
    }
  });
  return code;
}

/**
 * @description This is the object implementation of Omit<T, K> type.
 * @param obj Object to exclude keys from of type T
 * @param keys keys to exclude
 * @returns an object of type Omit<T, K>
 */
export function excludeKeys<T, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  keys.forEach((key) => {
    delete obj[key];
  });
  return obj;
}

/**
 * @description This is the object implementation of Pick<T, K> type.
 * @param obj Object to pick keys from
 * @param keys picked keys
 */
export function pickKeys<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  Object.keys(obj).forEach((key) => {
    if (!keys.includes(key as K)) delete obj[key as keyof T];
  });
  return obj;
}

/**
 * Generate password with numbers, special characters, upper and lower case letters
 * @param [useSpecialChar=false] Whether or not to use special characters
 * @param [length=8] password length
 */
export function generatePassword(useSpecialChar = false, length = 8) {
  const charset = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789${
    useSpecialChar ? '!@#$%^&*?.-' : ''
  }`;
  let retVal = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

/**
 * get the initials of the first two names
 *
 * @param {string} name - the name whose initials we want
 * @returns {string} - two character initials
 */
export function getFirstTwoNameInitials(name: string) {
  return name
    .split(' ')
    .splice(0, 2)
    .map((_) => _[0].toUpperCase())
    .join('');
}

/**
 * Format a date and time elements from a dateTime value into a specific one as "dd month year - hh:mm"
 * @param {Dayjs} dateTime - the date and time for a mass
 */
export function formattedDateTime(dateTime: Dayjs): string {
  // TODO Adjust formating according to the current language
  return `${dateTime.format('DD MMMM YYYY')} - ${dateTime.format('HH:mm')}`;
}
