function toDriveImageUrl(fileId) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`
}

function toDriveFallbackUrl(fileId) {
  return `https://drive.google.com/uc?export=view&id=${fileId}`
}

export const spoonMascotFileIds = {
  0: '1FTwAx222saa5WSY-_qR6Wv4BDeOnLzAb',
  1: '1jQ0scOsAqxjPvGwjF7-igz92HFPipMEG',
  2: '1wvfksrKs_MmCZl48GMnw9tavPujjK8BW',
  3: '1LxtFGKqTR3nLwmS_rFtiJX9Xq9sOGYTD',
  4: '11LQSG9AyZpPprYpdo5FBU85j7yymJfJk',
  5: '1sIgA1p0zF9Yv5Fve0GsBW5iUIHtm_fHf',
}

export const spoonMascots = Object.fromEntries(
  Object.entries(spoonMascotFileIds).map(([level, fileId]) => [level, toDriveImageUrl(fileId)])
)

export const spoonMascotFallbacks = Object.fromEntries(
  Object.entries(spoonMascotFileIds).map(([level, fileId]) => [level, toDriveFallbackUrl(fileId)])
)

export const allSpoonMascotEntries = [0, 1, 2, 3, 4, 5].map((level) => ({
  level,
  url: spoonMascots[level],
}))

export function resolveSpoonMascot(level) {
  const parsed = Number.parseInt(level, 10)
  if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 5) {
    return spoonMascots[parsed]
  }
  return ''
}
