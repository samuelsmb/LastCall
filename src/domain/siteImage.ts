/** Henter forhåndsbildet (og:image) fra en bedrifts nettside via Microlink, siden nettleseren ikke kan lese andre nettsteder direkte. */
export async function fetchSiteImage(site: string): Promise<string | null> {
  const url = /^https?:\/\//i.test(site.trim()) ? site.trim() : `https://${site.trim()}`
  const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
  if (!res.ok) throw new Error(`Microlink ${res.status}`)
  const json = await res.json()
  return json?.data?.image?.url ?? null
}
