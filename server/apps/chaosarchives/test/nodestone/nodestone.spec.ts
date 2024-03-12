import { FreeCompanyInfo } from "@app/shared/dto/lodestone";
import { FreeCompany } from "@xivapi/nodestone";

import freeCompany from '@xivapi/nodestone/lib/lib/lodestone-css-selectors/freecompany/freecompany.json';

// Monkey patch
freeCompany.FORMED.selector = 'p.freecompany__text:nth-of-type(5) > script';

it('should retrieve Free Company information', async () => {
  const lodestoneId = '9234771773411582394';

  const fcParser = new FreeCompany();
  const fcResult = (await fcParser.parse({ params: { fcId: lodestoneId } } as any)) as FreeCompanyInfo;

  console.log('fcResult', fcResult);
  expect(fcResult.Timestamp).toEqual(1398210109);
});
