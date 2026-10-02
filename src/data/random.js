/*
  mulberry32: a tiny seeded pseudo-random generator. The same seed always
  produces the same sequence, so the "random" store data is identical on
  every load. Math.random() can't be seeded, which is why we don't use it here.
*/
export function createRandom(seed) {
  let state = seed >>> 0

  function next() {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    next,
    /** Integer in [min, max], both inclusive. */
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: (list) => list[Math.floor(next() * list.length)],
    chance: (probability) => next() < probability,
    /** Pick from [[value, weight], ...] in proportion to the weights. */
    weighted(entries) {
      const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
      let roll = next() * total
      for (const [value, weight] of entries) {
        roll -= weight
        if (roll < 0) return value
      }
      return entries[entries.length - 1][0]
    },
  }
}

// One shared generator. Modules that use it are imported in a fixed order
// (products → customers → orders), so the sequence never changes.
export const rng = createRandom(20261002)
