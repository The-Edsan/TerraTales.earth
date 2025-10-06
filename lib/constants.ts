export type RegionId = "alaska" | "manaos" | "cdmx";

export interface Region {
  id: RegionId;
  name: string;
  index: "ndsi" | "ndvi" | "ndbi";
  // ...otras propiedades que necesites
}

export const REGIONS: Record<RegionId, Region> = {
  alaska: {
    id: "alaska",
    name: "ALASKA",
    index: "ndsi",
  },
  manaos: {
    id: "manaos",
    name: "MANAOS",
    index: "ndvi",
  },
  cdmx: {
    id: "cdmx",
    name: "CDMX",
    index: "ndbi",
  },
};