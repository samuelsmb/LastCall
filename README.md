<img src="assets/icon.svg" width="64" height="64" alt="">

# LastCall

The cancellation economy: businesses turn cancelled bookings into **Last Calls**, and customers grab them last-minute at a discount. A mocked hackathon demo set in Cooler Copenhagen.

## Run it

```
npm install
npm run dev
```

Open the URL Vite prints. Everything is fake and lives in your browser (localStorage).

- Open two tabs side by side (one Customer, one Business): they sync live.
- Add `?reset` to the URL to start from a fresh catalogue. Data also reseeds itself after 6 hours.

## Demo bricks

| Brick | Where |
| --- | --- |
| Marketplace (category chips, Now/Today/48h, sort, "Indulge me") | `#/` |
| Last Call detail + fake booking | `#/lc/<id>` → `#/booked/<id>` |
| Want + Alert (fake "AI" reads your text) | `#/wants` |
| Business calendar, simulate cancellation, manual Release | `#/biz` |
| Auto-release rule + dashboard | `#/biz` |
| Register your business | `#/biz/register` |

Ted's Garage has Auto-release **on** (1h before, 30% off): cancel the slot starting within the hour and it goes straight to the Marketplace; cancel a later one and it's held. Turn Auto-release off to demo manual Release.

Look and feel: quiet luxury. Ivory, ink, champagne gold and oxblood; Cormorant Garamond and Inter; hairline borders; gold monogram panels instead of photos; a line-drawn gold bell that swings when you strike it.

Planning docs: `GLOSSARY.md`, `docs/issues/lastcall-demo-spec.md`, `.scratch/lastcall-demo/issues/`.
