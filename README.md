<img src="assets/icon.svg" width="64" height="64" alt="">

# LastCall

When someone cancels, a business is left with an empty slot it can't sell. LastCall puts that slot on a marketplace the moment it frees up, so someone who wants it right now can grab it, at full price ("Skip the queue") or at a discount the business chooses. A mocked hackathon demo set in **Oslo sentrum**, with the UI in Norwegian, starting with two hero categories: **Restaurant** and **Tyre change**.

Businesses pay nothing to join and nothing per month: 49 kr per filled spot, never more than 10% of the sold price, only when the customer shows up. The first 10 filled spots are free.

## Run it locally

```
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). There is no backend: everything is fake and lives in your browser's localStorage.

The Assistant (the ✦ bubble on Customer screens) calls OpenRouter straight from the browser. Put `VITE_OPENROUTER_KEY=sk-or-...` in a `.env` file (gitignored). The Pages build reads it from the `OPENROUTER_KEY` repo secret. The key ends up in the public bundle, so use a key with a low credit limit. Without a key, the rest of the app works and the Assistant says it isn't set up.

**Assistant demo:** open the bubble and type "Jeg har lyst til å gå på en comedyklubb i kveld". There is none, so the Assistant offers to alert you. Say "ja", and 5 seconds later a hidden standup Last Call at Latter is released and the Alert pops up. "Varsle meg om ting jeg vil like" does the same with a hidden jazz Last Call. Saving "standup i kveld" in the Wants form works too.

**⚡ Rask (Fast mode):** the switch in the chat header answers with one call to Jev, TypeSafe's decision model, through OpenRouter's `api/alpha/decisions` with the same key, in about 0.3 s instead of 3–7 s. Jev doesn't write text: it picks the intent (find, recommend, alert), Category, time window and the best Last Calls, and the reply comes from a template (`src/domain/fastAssistant.ts`). When it's unsure, or the message is something else ("Hvorfor er Maaemo så dyrt?"), the LLM takes over ("Tenker grundigere …"). After "Fant ikke…", a "ja" saves the offered Want with no model call. The hidden Last Calls live in `DEMO_STOCK` in `src/domain/seed.ts`. Saving another matching Want releases one again with a fresh Alert, so the demo can be repeated without `?reset`.

- Open two tabs side by side (one Customer, one Business): they sync live.
- Add `?reset` before the hash to start from a fresh catalogue, e.g. `http://localhost:5173/?reset#/`. Data also reseeds itself after 6 hours.
- `npm run build` typechecks and builds a static site into `dist/`.

## Demo script

Start with `?reset` once, then use two tabs: **Customer** (left) and **Business** (right). Every step has its own URL (replace the host if Vite picked another port).

| # | Tab | URL | What to do |
| --- | --- | --- | --- |
| 0 | any | `http://localhost:5173/?reset#/` | Fresh data. |
| 1 | Customer | `#/wants?q=dekkskift%20innen%2048%20timer%20n%C3%A6r%20Alna` | The fake AI has already read "dekkskift innen 48 timer nær Alna" and picked Dekkskift, Neste 48 t, Alna. Click **Lagre ønske**. |
| 2 | Business | `#/biz/teds-garage` | Mekonomen, Auto-release on at full price. Click **Simuler avbestilling** on **tomorrow 14:00, Tyre change**. It goes live at once as "Skip the queue". |
| 3 | Customer | `#/lc/demo-teds-tyre` → `#/booked/demo-teds-tyre` | The Alert pops up: "Someone cancelled. Tyre change at Mekonomen tomorrow 14:00, 15 min away. 900 kr." Open it, book. The ticket says "You skipped the queue". |
| 4 | Business | `#/biz/teds-garage` | "Empty slot filled. 900 kr saved." Revenue recovered goes from 26,450 kr to 27,350 kr (month-to-date history plus 900 kr), fee stays 1,127 kr (free spots left 9/10), net 26,223 kr. |
| 5 | Business | `#/biz/restaurant-lokka` | Theatercaféen, Auto-release 2 hours before at 20% off. **Simuler avbestilling** on **19:30, Table for 2** (850 kr pp). It is held until 17:30; click **Frigi nå** (20% preselected, fee preview shows 98 kr waived by the Intro offer). |
| 5b | Customer | `#/lc/demo-lokka-table` | Book the table: 680 kr pp, 1,360 kr total. The Business dashboard goes from 31,280 kr to 32,640 kr recovered, fee stays 2,058 kr, free spots left 8/10 (a table for 2 uses 2). |
| 6 | Third tab | `#/lc/demo-teds-tyre` | Open before step 3 and try to book after: "Too slow! Gone! We'll ping you when the next one drops." |

Notes: if it's later than about 18:45, the Theatercaféen table is seeded for tomorrow 19:30 instead of tonight. If it's within 2 hours of 19:30, the cancellation releases straight away without "Release now".

## Other screens

| Brick | Where |
| --- | --- |
| Marketplace (category chips, Now/Today/48h, sort, "Surprise me") | `#/` |
| Last Call detail + fake booking | `#/lc/<id>` → `#/booked/<id>` |
| Want + Alert (fake "AI" reads your text) | `#/wants`, or `#/wants?q=<text>` to prefill |
| Business calendar, Release dialog, Auto-release rule, dashboard | `#/biz` or `#/biz/<business-id>` |
| Register your business, with pricing step and fee calculator | `#/biz/register` |

## Where things live

- `src/brand.ts`: the city.
- `src/domain/pricing.ts`: `calculateFee` and the Intro offer rules.
- `src/domain/store.ts`, `selectors.ts`, `seed.ts`: state, business rules and the Oslo catalogue.
- `src/domain/assistant.ts`, `tasteProfile.ts`, `src/components/Assistant.tsx`: the Assistant (model, prompt, tools, chat UI) and the demo Customer's Taste profile.
- Look and feel follows the Notion design language in `docs/DESIGN.md`.
- Planning docs: `GLOSSARY.md`, `docs/issues/lastcall-demo-spec.md`, `docs/wayfinder/map.md`.

## Bildekreditter

Bilder av bedriftene ligger i `public/img/`. Bedrifter uten bilde får en farget kategoriboks.

- Theatercaféen: Larry Lamsa, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/), via Wikimedia Commons
- Statholdergaarden (og Statholderens Mat & Vinkjeller): Kjetil r, [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/), via Wikimedia Commons
- Herr Nilsen: Vidariv, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), via Wikimedia Commons
- Hope Posthallen: Jan-Tore Egge, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), via Wikimedia Commons
- Bristol Spa (illustrasjonsbilde): Conny Nordin, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), via Wikimedia Commons
- Studio Johnny (illustrasjonsbilde): Daderot, CC0, via Wikimedia Commons
- Bel Etage (illustrasjonsbilde): Wilfredor, CC0, via Wikimedia Commons
- Pass- og ID-kontoret (illustrasjonsbilde): Government of Norway, Public domain, via Wikimedia Commons
- Mekonomen, Snap Drive, Katla, Adam og Eva og KOK Badstue: bilder hentet fra bedriftenes nettsider, kun til demobruk
