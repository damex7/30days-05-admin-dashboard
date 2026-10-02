import { rng } from './random.js'

export const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty']

// [name, lowest price, highest price] in Naira
const CATALOGUE = {
  Electronics: [
    ['Android Smartphone 128GB', 165_000, 210_000],
    ['Android Smartphone 256GB', 248_000, 320_000],
    ['Wireless Earbuds Pro', 24_000, 38_000],
    ['Bluetooth Party Speaker', 42_000, 65_000],
    ['20,000mAh Power Bank', 18_500, 26_000],
    ['Smart Watch Series 5', 54_000, 78_000],
    ['32" LED Smart TV', 145_000, 185_000],
    ['1kVA Inverter + Battery', 380_000, 460_000],
    ['Rechargeable Standing Fan', 58_000, 79_000],
    ['Laptop 14" Core i5', 520_000, 640_000],
    ['USB-C Fast Charger 65W', 12_000, 17_500],
    ['Solar Lantern', 9_500, 14_000],
  ],
  Fashion: [
    ['Ankara Print Midi Dress', 28_000, 42_000],
    ['Agbada Set (3-piece)', 85_000, 140_000],
    ['Senator Kaftan', 38_000, 58_000],
    ['Aso Oke Gele & Ipele', 32_000, 55_000],
    ['Adire Tie-Dye Shirt', 16_000, 24_000],
    ['Leather Palm Slippers', 14_000, 22_000],
    ['Beaded Statement Necklace', 9_000, 16_000],
    ['Kente Bow Tie', 6_500, 9_500],
    ['Canvas Sneakers', 21_000, 32_000],
    ['Woven Raffia Tote', 18_000, 27_000],
    ['Slim-fit Chinos', 15_500, 22_000],
    ['Hand-stitched Fila Cap', 7_500, 12_000],
  ],
  Home: [
    ['Non-stick Pot Set (5-piece)', 46_000, 68_000],
    ['Electric Blender 1.5L', 32_000, 45_000],
    ['Yam Pounder Machine', 88_000, 120_000],
    ['Rice Cooker 1.8L', 36_000, 49_000],
    ['Mosquito Net Canopy', 11_000, 16_500],
    ['Ceramic Dinner Set', 39_000, 57_000],
    ['Memory Foam Pillow (pair)', 22_000, 31_000],
    ['Gas Cooker 4-burner', 165_000, 210_000],
    ['Woven Wall Basket Set', 19_000, 28_000],
    ['Cotton Duvet Set (King)', 48_000, 66_000],
  ],
  Beauty: [
    ['Shea Butter Body Cream', 6_500, 9_800],
    ['Black Soap (Ose Dudu)', 3_500, 5_500],
    ['Hair Growth Oil', 8_000, 12_500],
    ['Matte Lipstick Set', 11_000, 16_000],
    ['Natural Hair Detangler', 7_200, 10_500],
    ['Vitamin C Serum', 14_000, 21_000],
    ['Perfume Oil 50ml', 17_500, 28_000],
    ['Beard Grooming Kit', 13_000, 19_000],
    ['Braiding Hair (6 packs)', 9_500, 14_500],
    ['Sunscreen SPF 50', 10_500, 15_500],
  ],
}

const SKU_PREFIX = { Electronics: 'ELE', Fashion: 'FAS', Home: 'HOM', Beauty: 'BEA' }

// Round to a shop-looking price: ₦12,500 rather than ₦12,487
const roundPrice = (value) => (value >= 50_000 ? Math.round(value / 1000) * 1000 : Math.round(value / 100) * 100)

function stockLevel(reorderLevel) {
  const roll = rng.next()
  if (roll < 0.07) return 0 // sold out
  if (roll < 0.2) return rng.int(1, reorderLevel) // running low
  return rng.int(reorderLevel + 5, 180)
}

let counter = 0
export const products = CATEGORIES.flatMap((category) =>
  CATALOGUE[category].map(([name, low, high]) => {
    counter += 1
    const number = String(counter).padStart(3, '0')
    const reorderLevel = rng.pick([8, 10, 12, 15])
    return {
      id: `P-${number}`,
      sku: `${SKU_PREFIX[category]}-${number}`,
      name,
      category,
      price: roundPrice(rng.int(low, high)),
      stock: stockLevel(reorderLevel),
      reorderLevel,
    }
  }),
)

// A few best-sellers are sold out on purpose, so the "Out of stock" state
// always appears in the demo whatever the seed produces.
for (const id of ['P-003', 'P-016', 'P-037']) {
  products.find((product) => product.id === id).stock = 0
}
