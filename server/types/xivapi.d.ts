declare module '@xivapi/js' {
  interface PagedResult<T> {
    Pagination: {
      Page: number;
      PageNext: number | null;
      PagePrev: number | null;
      PageTotal: number;
      Results: number;
      ResultsPerPage: number;
      ResultsTotal: number;
    };
    Results: T[];
  }

  interface CharacterSearchEntry {
    Avatar: string;
    FeastMatches: number;
    ID: number;
    Lang: string;
    Name: string;
    Rank: number | null;
    RankIcon: string | null;
    Server: string;
  }

  interface CharacterInfo {
    Character: {
      Avatar: string;
      DC: string;
      ID: number;
      Name: string;
      Race: number;
      Server: string;
    };
  }

  export default class XIVAPI {
    character: {
      get(
        lodestoneId: number,
        options?: { extended: 0 | 1 },
      ): Promise<CharacterInfo>;
      search(
        name: string,
        options?: { server: string },
      ): Promise<PagedResult<CharacterSearchEntry>>;
    };
  }
}
