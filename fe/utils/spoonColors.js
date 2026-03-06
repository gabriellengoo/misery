export const spoonColors = {
  5: 'rgb(236 200 206)',
  4: 'rgb(246 211 159)',
  3: 'rgb(198 209 229)',
  2: 'rgb(217 239 242)',
  1: 'rgb(230 240 200)',
  0: 'rgb(229 220 205)',
  default: 'rgb(245 248 243)',
}

export function resolveSpoonColor(level) {
  const parsed = Number.parseInt(level, 10)
  if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 5) {
    return spoonColors[parsed]
  }
  return spoonColors.default
}
