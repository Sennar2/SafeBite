export const temperatureRanges = {
  fridge: { min: 0, max: 5 },
  freezer: { min: -25, max: -18 },
  food: { min: 63, max: 100 },
  delivery: { min: -100, max: 100 }, // No limit, very wide
}

export function isOutOfRange(type: string, value: number): boolean {
  const range = temperatureRanges[type]
  if (!range) return false
  return value < range.min || value > range.max
}
