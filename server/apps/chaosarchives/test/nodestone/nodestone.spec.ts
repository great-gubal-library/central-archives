import { CharacterInfo, CharacterSearchEntry, FreeCompanyInfo, PagedResult } from '@app/shared/dto/lodestone';
import { Character, CharacterSearch, FreeCompany } from '@xivapi/nodestone';

it('should correctly search for character', async () => {
  const name = 'Vielle Janlenoux';
  const server = 'Omega';

  const parser = new CharacterSearch();
      const query = {
        name: `"${name}"`,
        server,
      };

  const searchResult = (await parser.parse({ query } as any)) as PagedResult<CharacterSearchEntry>;

  console.log('searchResult', searchResult);
  expect(searchResult.List.length).toEqual(1);
  expect(searchResult.List[0].ID).toEqual(37681922);
  expect(searchResult.List[0].Name).toEqual(name);
  expect(searchResult.List[0].World).toEqual(server);
  expect(searchResult.List[0].DC).toEqual('Chaos');
});

it('should retrieve character information', async () => {
  const lodestoneId = '37681922';

  const characterParser = new Character();
  const characterResult = (await characterParser.parse({
    params: { characterId: lodestoneId },
  } as any)) as CharacterInfo;

  console.log('characterResult', characterResult);
  expect(characterResult.World).toEqual('Omega');
  expect(characterResult.DC).toEqual('Chaos');
  expect(characterResult.FreeCompany?.ID).toEqual('9228860798900686606');
  expect(characterResult.FreeCompany?.Name).toEqual('The Harborwatch');
});

it('should retrieve Free Company information', async () => {
  const lodestoneId = '9234771773411582394';

  const fcParser = new FreeCompany();
  const fcResult = (await fcParser.parse({ params: { fcId: lodestoneId } } as any)) as FreeCompanyInfo;

  console.log('fcResult', fcResult);
  expect(fcResult.Timestamp).toEqual(1398210109);
});
