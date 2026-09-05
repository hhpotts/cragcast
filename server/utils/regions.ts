export type Region = {
  id: string
  name: string
  /** Stable reference to an Area.id — never match/display areas by name string. */
  areaId?: string
  points: { lat: number; lon: number }[]
  rock: string[]
  tags?: string[]
  typeAffinity?: { trad?: number; sport?: number; boulder?: number }
  external?: {
    bbcId?: string
    metOfficeId?: string
    windyZoom?: number
  }
}

export type Area = {
  id: string
  name: string
  lat: number
  lon: number
}

/** Display name for a region's parent area, looked up by id (never store this as a duplicated string). */
export function getAreaName(areaId?: string): string | undefined {
  return areaId ? areas.find(a => a.id === areaId)?.name : undefined
}

// Representative centroid for each area (average of constituent region points)
export const areas: Area[] = [
  { id: 'peak-district',         name: 'Peak District',           lat: 53.40, lon: -1.95 },
  { id: 'north-wales',           name: 'North Wales',             lat: 53.11, lon: -3.95 },
  { id: 'lake-district',         name: 'Lake District',           lat: 54.47, lon: -3.11 },
  { id: 'yorkshire',             name: 'Yorkshire',               lat: 53.97, lon: -1.82 },
  { id: 'northumberland',        name: 'Northumberland',          lat: 55.27, lon: -1.93 },
  { id: 'pembrokeshire',         name: 'Pembrokeshire (Sir Benfro)', lat: 51.62, lon: -5.00 },
  { id: 'south-wales',           name: 'South Wales',             lat: 51.65, lon: -3.60 },
  { id: 'south-west-england',    name: 'South West England',      lat: 50.81, lon: -4.22 },
  { id: 'south-coast-england',   name: 'South Coast England',     lat: 50.75, lon: -1.41 },
  { id: 'scotland-nw-highlands', name: 'NW Highlands & Skye (An t-Eilean Sgitheanach)', lat: 57.65, lon: -5.60 },
  { id: 'scotland-glencoe',      name: 'Beinn Nibheis (Ben Nevis) & Gleann Comhann (Glen Coe)', lat: 56.80, lon: -4.90 },
  { id: 'scotland-cairngorms',   name: 'Am Monadh Ruadh (Cairngorms) & East Scotland', lat: 57.10, lon: -2.90 },
  { id: 'scotland-central',      name: 'Central Scotland',        lat: 55.90, lon: -3.60 },
]

export const regions: Region[] = [
  // --- Peak District ---
  {
    id: "peak-n",
    name: "North Peak",
    areaId: "peak-district",
    points: [{ lat: 53.45, lon: -1.88 }],
    rock: ["grit"],
    tags: ["moorland", "exposed"],
    external: { metOfficeId: "gcw858zgz", bbcId: "2648405" }
  },
  {
    id: "peak-c",
    name: "Central Peak",
    areaId: "peak-district",
    points: [{ lat: 53.34, lon: -1.63 }],
    rock: ["grit", "limestone"],
    tags: ["quick-dry"],
    external: { metOfficeId: "gcqz6kgdx", bbcId: "2647338" }
  },
  {
    id: "peak-sw",
    name: "South West Peak",
    areaId: "peak-district",
    points: [{ lat: 53.17, lon: -2.03 }],
    rock: ["grit"],
    tags: ["quick-dry", "wind-exposed"],
    external: { metOfficeId: "gcqw1upty", bbcId: "2644684" }
  },
  {
    id: "peak-se",
    name: "South East Peak",
    areaId: "peak-district",
    points: [{ lat: 53.25, lon: -1.61 }],
    rock: ["grit"],
    tags: [],
    external: { metOfficeId: "gcqyhqyus", bbcId: "2642910" }
  },
  {
    id: "chew",
    name: "Chew Valley",
    areaId: "peak-district",
    points: [{ lat: 53.53, lon: -1.99 }],
    rock: ["grit"],
    external: { metOfficeId: "gcw8dkf8n", bbcId: "2647974" }
  },
  {
    id: "lancs-quarries",
    name: "Lancashire Quarries",
    areaId: "peak-district",
    points: [{ lat: 53.65, lon: -2.55 }],
    rock: ["quarried grit"],
    external: { metOfficeId: "gcw1hpk10", bbcId: "2653086" }
  },

  // --- North Wales ---
  {
    id: "nwales-n",
    name: "Eryri (Snowdonia) North",
    areaId: "north-wales",
    points: [{ lat: 53.12, lon: -4.05 }],
    rock: ["rhyolite", "slate"],
    tags: ["mountain"],
    external: { metOfficeId: "gcmn4jg3d", bbcId: "2644172" }
  },
  {
    id: "nwales-s",
    name: "Eryri (Snowdonia) South",
    areaId: "north-wales",
    points: [{ lat: 52.95, lon: -3.94 }],
    rock: ["rhyolite", "slate"],
    tags: ["mountain"],
    external: { metOfficeId: "gcmhp9k7v", bbcId: "2651154" }
  },
  {
    id: "nwales-coast",
    name: "Coastal (Gogarth & Ormes)",
    areaId: "north-wales",
    points: [{ lat: 53.31, lon: -4.63 }],
    rock: ["limestone"],
    tags: ["sea-cliff"],
    external: { metOfficeId: "gcmr2gmc8", bbcId: "2644120" }
  },
  {
    id: "nwales-clwyd",
    name: "Clwyd Limestone",
    areaId: "north-wales",
    points: [{ lat: 53.05, lon: -3.16 }],
    rock: ["limestone"],
    tags: [],
    external: { metOfficeId: "gcmtrfeqn", bbcId: "2644021" }
  },

  // --- Lake District ---
  {
    id: "lakes-n",
    name: "North Lakes",
    areaId: "lake-district",
    points: [{ lat: 54.62, lon: -3.13 }],
    rock: ["rhyolite"],
    tags: ["mountain"],
    external: { metOfficeId: "gcty8njjs", bbcId: "2645756" }
  },
  {
    id: "lakes-c",
    name: "Central Lakes",
    areaId: "lake-district",
    points: [{ lat: 54.45, lon: -3.1 }],
    rock: ["rhyolite"],
    tags: ["mountain"],
    external: { metOfficeId: "gctvssktt", bbcId: "2657360" }
  },
  {
    id: "lakes-s",
    name: "South Lakes",
    areaId: "lake-district",
    points: [{ lat: 54.35, lon: -3.1 }],
    rock: ["rhyolite"],
    tags: ["mountain"],
    external: { metOfficeId: "gctvmgsm7", bbcId: "2633851" }
  },

  // --- Yorkshire ---
  {
    id: "york-dales-w",
    name: "Dales West",
    areaId: "yorkshire",
    points: [{ lat: 54.07, lon: -2.16 }],
    rock: ["limestone"],
    external: { metOfficeId: "gcw7s4y98", bbcId: "2638192" }
  },
  {
    id: "york-dales-e",
    name: "Dales East",
    areaId: "yorkshire",
    points: [{ lat: 53.92, lon: -1.7 }],
    rock: ["grit"],
    external: { metOfficeId: "gcwg8jffz", bbcId: "2640579" }
  },
  {
    id: "york-dales-s",
    name: "Dales South",
    areaId: "yorkshire",
    points: [{ lat: 53.92, lon: -1.82 }],
    rock: ["grit"],
    external: { metOfficeId: "gcwdy8cc8", bbcId: "2646272" }
  },
  {
    id: "york-moors",
    name: "North York Moors",
    areaId: "yorkshire",
    points: [{ lat: 54.4, lon: -0.9 }],
    rock: ["sandstone"],
    external: { metOfficeId: "gcxtfnft4", bbcId: "2634135" }
  },

  // --- Northumberland ---
  {
    id: "northumberland",
    name: "Northumberland",
    areaId: "northumberland",
    points: [{ lat: 55.27, lon: -1.93 }],
    rock: ["sandstone"],
    external: { metOfficeId: "gcyefpzze", bbcId: "2633606" }
  },

  // --- Pembrokeshire ---
  {
    id: "pembroke",
    name: "Pembroke (Sir Benfro)",
    areaId: "pembrokeshire",
    points: [{ lat: 51.62, lon: -5.0 }],
    rock: ["limestone"],
    tags: ["sea-cliff"],
    external: { metOfficeId: "gchqwynv8", bbcId: "2647311" }
  },

  // --- South Wales ---
  {
    id: "gower",
    name: "Gower (Gŵyr)",
    areaId: "south-wales",
    points: [{ lat: 51.57, lon: -4.17 }],
    rock: ["limestone"],
    tags: ["sea-cliff"],
    external: { metOfficeId: "gcjjwm34p", bbcId: "2636432" }
  },
  {
    id: "wye",
    name: "Wye Valley (Dyffryn Gwy)",
    areaId: "south-wales",
    points: [{ lat: 51.83, lon: -2.63 }],
    rock: ["limestone"],
    external: { metOfficeId: "gcnjg1jby", bbcId: "2653256" }
  },

  // --- NW Highlands & Skye ---
  {
    id: "scotland-nw",
    name: "North West Highlands",
    areaId: "scotland-nw-highlands",
    points: [{ lat: 58.0, lon: -5.0 }],
    rock: ["gneiss", "sandstone"],
    tags: ["mountain"],
    external: { metOfficeId: "gfk36edd", bbcId: "72635199" }
  },
  {
    id: "scotland-skye",
    name: "Skye (An t-Eilean Sgitheanach) & Hebrides",
    areaId: "scotland-nw-highlands",
    points: [{ lat: 57.3, lon: -6.2 }],
    rock: ["gabbro", "gneiss"],
    tags: ["sea-cliff", "mountain"],
    external: { metOfficeId: "gf5we59j0", bbcId: "2640006" }
  },

  // --- Ben Nevis & Glen Coe ---
  {
    id: "scotland-c",
    name: "Beinn Nibheis (Ben Nevis) & Gleann Comhann (Glen Coe)",
    areaId: "scotland-glencoe",
    points: [{ lat: 56.8, lon: -4.9 }],
    rock: ["granite"],
    tags: ["mountain"],
    external: { metOfficeId: "gfh75zeru", bbcId: "2649169" }
  },

  // --- Cairngorms & East Scotland ---
  {
    id: "scotland-cairngorms",
    name: "Am Monadh Ruadh (Cairngorms)",
    areaId: "scotland-cairngorms",
    points: [{ lat: 57.1, lon: -3.67 }],
    rock: ["granite"],
    tags: ["mountain"],
    external: { metOfficeId: "gfjm2yj30", bbcId: "2656752" }
  },
  {
    id: "scotland-aberdeen",
    name: "Aberdeenshire",
    areaId: "scotland-cairngorms",
    points: [{ lat: 57.1, lon: -2.3 }],
    rock: ["granite"],
    tags: ["sea-cliff"],
    external: { metOfficeId: "gfjudctuv", bbcId: "2656565" }
  },

  // --- Central Scotland ---
  {
    id: "scotland-centralbelt",
    name: "Central Belt",
    areaId: "scotland-central",
    points: [{ lat: 55.9, lon: -3.6 }],
    rock: ["dolerite"],
    external: { metOfficeId: "gcvwr3zrw", bbcId: "2650225" }
  },

  // --- South West England ---
  {
    id: "avon-gorge",
    name: "Avon Gorge & Bristol",
    areaId: "south-west-england",
    points: [{ lat: 51.46, lon: -2.62 }],
    rock: ["limestone"],
    tags: [],
    external: { metOfficeId: "gcnjvmwgu", bbcId: "2656173" }
  },
  {
    id: "avon-cheddar",
    name: "Cheddar",
    areaId: "south-west-england",
    points: [{ lat: 51.28, lon: -2.76 }],
    rock: ["limestone"],
    external: { metOfficeId: "gcn58z5jb", bbcId: "2653281" }
  },
  {
    id: "dartmoor",
    name: "Dartmoor",
    areaId: "south-west-england",
    points: [{ lat: 50.58, lon: -3.95 }],
    rock: ["granite"],
    external: { metOfficeId: "gbvpt1q20", bbcId: "2639885" }
  },
  {
    id: "west-cornwall",
    name: "West Cornwall",
    areaId: "south-west-england",
    points: [{ lat: 50.17, lon: -5.55 }],
    rock: ["granite"],
    tags: ["sea-cliff"],
    external: { metOfficeId: "gbuj45b27", bbcId: "2640377" }
  },
  {
    id: "north-devon-cornwall",
    name: "North Devon & Cornwall",
    areaId: "south-west-england",
    points: [{ lat: 51.21, lon: -4.63 }],
    rock: ["culm", "granite"],
    tags: ["sea-cliff"],
    external: { metOfficeId: "gchc0ssk0", bbcId: "2654380" }
  },

  // --- South Coast England ---
  {
    id: "dorset-portland",
    name: "Portland",
    areaId: "south-coast-england",
    points: [{ lat: 50.54, lon: -2.44 }],
    rock: ["limestone"],
    external: { metOfficeId: "gbyr86r5p", bbcId: "6692041" }
  },
  {
    id: "dorset-swanage",
    name: "Swanage",
    areaId: "south-coast-england",
    points: [{ lat: 50.6, lon: -1.95 }],
    rock: ["limestone"],
    tags: ["sea-cliff"],
    external: { metOfficeId: "gbyxgkv5y", bbcId: "2636445" }
  },
  {
    id: "southern-sandstone",
    name: "Southern Sandstone",
    areaId: "south-coast-england",
    points: [{ lat: 51.1, lon: 0.15 }],
    rock: ["sandstone"],
    tags: ["fragile"],
    external: { metOfficeId: "u104yh627", bbcId: "2639022" }
  }
]
