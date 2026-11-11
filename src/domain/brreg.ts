import { CITY } from '../brand'
import type { Category } from './types'

const API = 'https://data.brreg.no/enhetsregisteret/api'

export type OrgStatus = 'ok' | 'bankrupt' | 'winding-up' | 'deleted'

/** What we keep from a Brønnøysundregistrene (Enhetsregisteret) lookup. */
export interface OrgInfo {
  orgNumber: string
  name: string
  address: string
  postcode: string
  place: string
  /** Municipality, e.g. "Oslo". */
  kommune: string
  industryCode: string | null
  industry: string | null
  website: string | null
  status: OrgStatus
}

/** A hit in the name search, enough to show in a result list. */
export interface OrgHit {
  orgNumber: string
  name: string
  place: string
  industry: string | null
}

/** A location (underenhet) of a business, with its physical address. */
export interface OrgUnit {
  orgNumber: string
  name: string
  address: string
  postcode: string
  place: string
  kommune: string
}

export function cleanOrgNumber(input: string) {
  return input.replace(/\s/g, '')
}

/** "915615767" becomes "915 615 767"; shorter input is grouped as far as it goes. */
export function formatOrgNumber(digits: string) {
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ')
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

async function getJson(url: string, signal?: AbortSignal) {
  const res = await fetch(url, { headers: { Accept: 'application/json' }, signal })
  if (res.status === 404) return null
  // Deleted units answer 410 Gone, sometimes with the record still attached.
  if (res.status === 410) return res.json().catch(() => null)
  if (!res.ok) throw new Error(`Brønnøysund request failed: ${res.status}`)
  return res.json()
}

/** The register's JSON is loosely shaped; the helpers below read only the fields we use. */
type Raw = any

function addressOf(addr: Raw = {}) {
  return {
    address: ((addr.adresse ?? []) as string[]).filter(Boolean).join(', '),
    postcode: addr.postnummer ?? '',
    place: titleCase(addr.poststed ?? addr.kommune ?? ''),
    kommune: titleCase(addr.kommune ?? ''),
  }
}

function statusOf(data: Raw): OrgStatus {
  if (data.slettedato) return 'deleted'
  if (data.konkurs) return 'bankrupt'
  if (data.underAvvikling || data.underTvangsavviklingEllerTvangsopplosning) return 'winding-up'
  return 'ok'
}

/** Returns null when the register has no such unit; throws when the register can't be reached. */
export async function lookupOrg(orgnr: string, signal?: AbortSignal): Promise<OrgInfo | null> {
  const data = await getJson(`${API}/enheter/${orgnr}`, signal)
  if (!data?.organisasjonsnummer) return null
  const website = data.hjemmeside ? String(data.hjemmeside).replace(/^https?:\/\//, '') : null
  return {
    orgNumber: data.organisasjonsnummer,
    name: titleCase(data.navn ?? ''),
    ...addressOf(data.forretningsadresse ?? data.postadresse),
    industryCode: data.naeringskode1?.kode ?? null,
    industry: data.naeringskode1?.beskrivelse ?? null,
    website,
    status: statusOf(data),
  }
}

/** Name search; the register matches loosely, so "theatercaf" finds Theatercafeen AS. */
export async function searchOrgs(query: string, signal?: AbortSignal): Promise<OrgHit[]> {
  const data = await getJson(`${API}/enheter?navn=${encodeURIComponent(query)}&size=6`, signal)
  const hits: Raw[] = data?._embedded?.enheter ?? []
  return hits.map((e) => ({
    orgNumber: e.organisasjonsnummer,
    name: titleCase(e.navn ?? ''),
    place: addressOf(e.forretningsadresse ?? e.postadresse).place,
    industry: e.naeringskode1?.beskrivelse ?? null,
  }))
}

/** The business's open locations (underenheter), each with its physical address, our city first. */
export async function listUnits(orgnr: string, signal?: AbortSignal): Promise<OrgUnit[]> {
  const data = await getJson(`${API}/underenheter?overordnetEnhet=${orgnr}&size=50`, signal)
  const units: Raw[] = data?._embedded?.underenheter ?? []
  return units
    .filter((u) => !u.nedleggelsesdato && u.beliggenhetsadresse)
    .map((u): OrgUnit => ({ orgNumber: u.organisasjonsnummer, name: titleCase(u.navn ?? ''), ...addressOf(u.beliggenhetsadresse) }))
    .sort((a, b) => Number(b.kommune === CITY) - Number(a.kommune === CITY) || a.place.localeCompare(b.place, 'nb'))
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
