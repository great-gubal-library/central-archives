import { AppType } from '../enums/oauth/app-type.enum';
import errors from '../errors';
import SharedConstants from '../shared-constants';
import { isValidHttpsUrl, parseUrlOrThrow } from './validators';

const OWN_DOMAINS: string[] = [];

Object.values(SharedConstants.regions).forEach(region => {
  OWN_DOMAINS.push(region.domain);

  if (region.newsDomain) {
    OWN_DOMAINS.push(region.newsDomain);
  }
});

export function validateRedirectUri(redirectUri: string, appType: AppType): string | null {
  try {
    const parsedUrl = parseUrlOrThrow(redirectUri, (message) => new TypeError('Invalid request URI: ' + message));

    OWN_DOMAINS.forEach(domain => {
      if (parsedUrl.hostname.endsWith(domain)) {
        return 'Forbidden domain: ' + parsedUrl.hostname;
      }
    });

    if (appType === AppType.NATIVE) {
      if (parsedUrl.protocol === 'http') {
        const hostname = parsedUrl.hostname;

        if (hostname !== 'localhost' && !/^127\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(hostname)) {
          return 'Only localhost and 127.*.*.* loopback addresses are allowed for the http protocol; use https for others';
        }
      }
    } else if (!isValidHttpsUrl(redirectUri)) {
      return 'Invalid HTTPS redirect URI: ' + redirectUri;
    }

    return null;
  } catch (e) {
    return errors.getMessage(e);
  }
}
