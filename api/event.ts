interface Req { url?: string | undefined; method?: string | undefined }
interface Res {
  statusCode: number
  setHeader(name: string, value: string): void
  end(body: string): void
}

const esc = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, '\\n')
const stamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]|\.\d{3}/g, '')

// Lager en .ics for én avtale. Brukes via webcal:// slik at kalenderappen åpnes uten nedlasting.
export default function handler(req: Req, res: Res) {
  const q = new URL(req.url ?? '', 'http://x').searchParams
  const start = Number(q.get('start'))
  const dur = Number(q.get('dur'))
  if (!start || !dur) {
    res.statusCode = 400
    res.end('Mangler start/dur')
    return
  }
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LastCall//NB',
    'BEGIN:VEVENT',
    `UID:${esc(q.get('id') ?? String(start))}@lastcall`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(start + dur * 60_000)}`,
    `SUMMARY:${esc(q.get('title') ?? 'Last Call')}`,
    `LOCATION:${esc(q.get('where') ?? '')}`,
    'DESCRIPTION:Bestilt via LastCall',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.setHeader('Content-Disposition', 'inline; filename="lastcall.ics"')
  res.end(ics)
}
