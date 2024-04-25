/**
 * Check if a phone number is an MTN or Orange number
 * @param {string} phoneNumber phone number to test
 * @returns {number} 0 if MTN, 1 if Orange, and -1 otherwise.
 */
export function validatePhoneNumber(phoneNumber: string): number {
  const mtnRegexp = new RegExp(/^6(((7|8)[0-9]{7}$)|(5[1-4][0-9]{6}$))/);
  const orangeRegexp = new RegExp(/^6(((9)[0-9]{7}$)|(5[5-9][0-9]{6}$))/);
  if (mtnRegexp.test(phoneNumber)) return 0;
  else if (orangeRegexp.test(phoneNumber)) return 1;
  return -1;
}

/**
 * return the logo of the momo network based on give number
 *
 * @param {string} phoneNumber phone number to test
 * @returns {string} public path to logo image
 */
export const determinePhoneNetworkLogo = (phoneNumber: string): string => {
  const imageRefs: Record<number, string> = {
    0: '/momo.svg',
    1: '/om.svg',
    '-1': '/alert.svg',
  };

  return imageRefs[validatePhoneNumber(phoneNumber)];
};
