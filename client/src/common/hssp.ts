import SharedConstants from '@app/shared/SharedConstants';
import { SiteRegion } from '@app/shared/enums/region.enum';
import { useApi } from 'src/boot/axios';
import { useRegionConfig } from 'src/boot/region';

export function getRegionOrigin(region: SiteRegion) {
  return window.location.origin.replace(useRegionConfig().domain, SharedConstants.regions[region].domain);
}

export function hsspRedirect(region: SiteRegion, redirectPath: string, currentCharacterId?: number) {
  const $api = useApi();
  const origin = getRegionOrigin(region);
  const apiUrl = `${origin}${$api.prefix}hssp`;

  const form = document.createElement('form');
  form.setAttribute('style', 'display: none');
  form.setAttribute('method', 'POST');
  form.setAttribute('action', apiUrl);

  addField(form, 'accessToken', $api.getAccessToken()!);

  if (currentCharacterId) {
    addField(form, 'currentCharacterId', currentCharacterId.toString());
  }

  addField(form, 'redirectPath', redirectPath);
  document.body.appendChild(form);
  form.submit();
}

function addField(form: HTMLFormElement, name: string, value: string) {
  const input = document.createElement('input');
  input.setAttribute('type', 'hidden');
  input.setAttribute('name', name);
  input.setAttribute('value', value);
  form.appendChild(input);
  return input;
}
