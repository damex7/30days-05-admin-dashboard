import { rng } from './random.js'
import { addDays, daysBetween } from '../lib/dates.js'

const FIRST_NAMES = [
  'Adaeze', 'Chinedu', 'Ngozi', 'Emeka', 'Ifeoma', 'Obinna', 'Chiamaka', 'Uche', 'Nneka', 'Ikenna',
  'Tunde', 'Funmilayo', 'Adewale', 'Yetunde', 'Babajide', 'Folake', 'Olumide', 'Temitope', 'Kayode', 'Bisola',
  'Aminu', 'Hadiza', 'Musa', 'Zainab', 'Ibrahim', 'Aisha', 'Sani', 'Hauwa', 'Usman', 'Fatima',
  'Efosa', 'Osaro', 'Ese', 'Tamuno', 'Ebiere', 'Inyang', 'Eno', 'Terna', 'Doosuur', 'Ochuko',
  'David', 'Grace', 'Samuel', 'Blessing', 'Daniel', 'Joy', 'Michael', 'Esther', 'Victor', 'Favour',
]

const LAST_NAMES = [
  'Okafor', 'Nwosu', 'Eze', 'Okonkwo', 'Obi', 'Nwachukwu', 'Ibe', 'Anyanwu',
  'Adeyemi', 'Ogunleye', 'Balogun', 'Adebayo', 'Olatunji', 'Fashola', 'Akinola', 'Oyelaran',
  'Bello', 'Abubakar', 'Mohammed', 'Danjuma', 'Yusuf', 'Garba', 'Lawal', 'Suleiman',
  'Osagie', 'Igbinedion', 'Etim', 'Bassey', 'Akpan', 'Tor', 'Ukeje', 'Ekpo',
]

// [city, state, weight]: weights roughly follow where online orders come from
const CITIES = [
  ['Lagos', 'Lagos', 34],
  ['Abuja', 'FCT', 16],
  ['Port Harcourt', 'Rivers', 9],
  ['Ibadan', 'Oyo', 8],
  ['Kano', 'Kano', 6],
  ['Benin City', 'Edo', 5],
  ['Enugu', 'Enugu', 5],
  ['Abeokuta', 'Ogun', 4],
  ['Kaduna', 'Kaduna', 4],
  ['Uyo', 'Akwa Ibom', 3],
  ['Jos', 'Plateau', 3],
  ['Owerri', 'Imo', 3],
]

const CUSTOMER_COUNT = 520
// About a third of customers were already shopping before the order history
// starts (Oct 2024); the rest sign up over the two years, faster towards the end.
const EARLY_SIGNUP = '2023-03-01'
const HISTORY_START = '2024-10-01'
const LAST_SIGNUP = '2026-09-29'

function signupDate() {
  if (rng.chance(0.35)) return addDays(EARLY_SIGNUP, rng.int(0, daysBetween(EARLY_SIGNUP, HISTORY_START) - 1))
  // sqrt skews sign-ups later, so the store looks like it is growing
  return addDays(HISTORY_START, Math.floor(Math.sqrt(rng.next()) * daysBetween(HISTORY_START, LAST_SIGNUP)))
}

export const customers = Array.from({ length: CUSTOMER_COUNT }, (_, index) => {
  const first = rng.pick(FIRST_NAMES)
  const last = rng.pick(LAST_NAMES)
  const [city, state] = rng.weighted(CITIES.map((entry) => [entry, entry[2]]))
  const joinedAt = signupDate()
  const network = rng.pick(['803', '806', '813', '816', '703', '705', '802', '808', '809', '815'])

  return {
    id: `C-${String(index + 1).padStart(4, '0')}`,
    name: `${first} ${last}`,
    email: `${first}.${last}${index + 1}@example.com`.toLowerCase(),
    phone: `+234 ${network} ${rng.int(100, 999)} ${rng.int(1000, 9999)}`,
    city,
    state,
    joinedAt,
    // Some customers simply shop more; the order generator uses this weight.
    loyalty: rng.weighted([
      [1, 60],
      [2, 28],
      [4, 12],
    ]),
  }
}).sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))
