import errors from "../errors";

/**
 * Regex taken from {@link https://gist.github.com/dperini/729294}
 */
const httpsUrlRegex = /^https:\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;

export function isValidHttpsUrl(str: string): boolean {
	return httpsUrlRegex.test(str);
}

export function parseUrlOrThrow(str: string, errorFactory?: (message: string) => Error): URL {
  try {
    const url = new URL(str);

    if (url.protocol === 'https:' && !isValidHttpsUrl(str)) {
      throw new TypeError('Invalid HTTPS URL: ' + str);
    }

    return url;
  } catch (e) {
    if (errorFactory) {
      throw errorFactory(errors.getMessage(e));
    }

    throw e;
  }
}

export function isValidGenericUrl(str: string): boolean {
  try {
    parseUrlOrThrow(str);
    return true;
  } catch (e) {
    return false;
  }
}

export const playerNameRegex = /^[A-Z][a-z']+(?: [A-Z][a-z']+)?$/;
