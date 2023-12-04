export interface PagedResult<T> {
  Pagination: {
    Page: number;
    PageNext: number | null;
    PagePrev: number | null;
    PageTotal: number;
    Results: number;
    ResultsPerPage: number;
    ResultsTotal: number;
  };
  List: T[];
}

export interface CharacterSearchEntry {
  ID: number;
  Name: string;
  Avatar: string;
  World: string;
  DC: string;
}

export interface CharacterInfo {
  Avatar: string;
  Bio: string;
  DC: string;
  Name: string;
  Race: string;
  World: string;
  FreeCompany: {
    ID: string;
    Name: string;
  }|null;
}

export interface FreeCompanyInfo {
  ID: number;
  CrestLayers: {
    Bottom: string;
    MIDdle: string;
    Top: string;
  };
  Timestamp: number;
  Name: string;
  Tag: string;
  Members: FreeCompanyMemberInfo[];
}

export interface FreeCompanyMemberInfo {
  ID: number;
  Name: string;
}
