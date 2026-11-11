import type { Category } from './types'

/** What we keep from a Brønnøysundregistrene (Enhetsregisteret) lookup. */
export interface OrgInfo {
  orgNumber: string
  name: string
  address: string
  postcode: string
  place: string
  industryCode: string | null
  industry: string | null
}

export function cleanOrgNumber(input: string) {
  return input.replace(/\s/g, '')
}

/** Norwegian org numbers are 9 digits with a mod 11 check digit. */
export function isValidOrgNumber(orgnr: string) {
  if (!/^\d{9}$/.test(orgnr)) return false
  const weights = [3, 2, 7, 6, 5, 4, 3, 2]
  const sum = weights.reduce((s, w, i) => s + w * Number(orgnr[i]), 0)
  const check = 11 - (sum % 11)
  if (check === 10) return false
  return (check === 11 ? 0 : check) === Number(orgnr[8])
}

/** Returns null when the register has no such unit; throws when the register can't be reached. */
export async function lookupOrg(orgnr: string): Promise<OrgInfo | null> {
  const res = await fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${orgnr}`, { headers: { Accept: 'application/json' } })
  if (res.status === 404 || res.status === 410) return null
  if (!res.ok) throw new Error(`Brønnøysund lookup failed: ${res.status}`)
  const data = await res.json()
  const addr = data.forretningsadresse ?? data.postadresse ?? {}
  return {
    orgNumber: data.organisasjonsnummer,
    name: titleCase(data.navn ?? ''),
    address: ((addr.adresse ?? []) as string[]).filter(Boolean).join(', '),
    postcode: addr.postnummer ?? '',
    place: titleCase(addr.poststed ?? addr.kommune ?? ''),
    industryCode: data.naeringskode1?.kode ?? null,
    industry: data.naeringskode1?.beskrivelse ?? null,
  }
}

/** Industry code (NACE, both SN2007 and SN2025) prefixes that map onto a LastCall Category. */
const NACE_CATEGORIES: [string, Category][] = [
  ['56', 'food'],
  ['96.2', 'beauty'],
  ['96.02', 'beauty'],
  ['96.04', 'beauty'],
  ['95.31', 'car'],
  ['45.2', 'car'],
  ['86', 'health'],
  ['84', 'official'],
  ['59.14', 'experiences'],
  ['79', 'experiences'],
  ['90', 'experiences'],
  ['91', 'experiences'],
  ['93', 'experiences'],
]

export function categoryFromIndustry(code: string | null): Category | null {
  if (!code) return null
  return NACE_CATEGORIES.find(([prefix]) => code.startsWith(prefix))?.[1] ?? null
}

const KEEP_UPPER = new Set(['AS', 'ASA', 'ANS', 'DA', 'ENK', 'SA', 'NUF', 'BA'])

/** The register stores names in capitals: "MR DEKK AS" becomes "Mr Dekk AS". */
export function titleCase(s: string) {
  return s
    .split(' ')
    .map((w) => (KEEP_UPPER.has(w) ? w : w.toLowerCase().replace(/(^|[-&/])(\p{L})/gu, (_, sep, c) => sep + c.toUpperCase())))
    .join(' ')
}
