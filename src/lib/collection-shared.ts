// Types and helpers for the Brand Collection, safe to import from client code.

export interface CollectionBrand {
  id: string;
  name: string;
  logo: string;
  country: string;
  models: string[];
}

export interface CollectionData {
  total: number;
  brands: CollectionBrand[];
}

/** /public/flags file for a maker's country (every collection country is covered). */
export const flagFor = (country: string) => `/flags/${country.toLowerCase().replace(/\s+/g, "-")}.png`;
