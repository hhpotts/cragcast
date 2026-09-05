import { regions, getAreaName } from "~/server/utils/regions"
import { getCragCountsByRegion } from "~/server/utils/crag-db"

export default defineEventHandler(async (event) => {
  const cragCounts = await getCragCountsByRegion(event)
  return regions.map(r => ({
    ...r,
    area: getAreaName(r.areaId),
    cragCount: cragCounts[r.id] || 0
  }))
})
