# 01: Walking skeleton: Marketplace with the Cooler Copenhagen catalogue

**What to build:** A Customer opens LastCall in the browser and lands on a whimsical Marketplace full of Last Calls in Cooler Copenhagen. Each card shows Business, Category, neighbourhood, start time, original price struck through, Last Call price and a live countdown. A Customer/Business toggle sits in the header (the Business side can be a placeholder for now). All demo state lives in one state module, persists to localStorage and syncs live across tabs. Set up the Vite + React + TypeScript + Tailwind static app. Spec: `docs/issues/lastcall-demo-spec.md`.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] App runs locally with Vite + React + TypeScript + Tailwind, no backend
- [x] Base whimsical theme in place (playful palette, rounded shapes, Category emoji or illustrations)
- [x] Seed catalogue of ~10-15 Businesses and ~15-25 Last Calls across all six Categories (Food, Beauty & Spa, Car, Health, Official appointments, Experiences), with Ted's Garage (Car) as the hero Business including a calendar of Slots
- [x] Seed times are generated relative to app load so Last Calls are always upcoming
- [x] Marketplace cards show original price struck through, Last Call price and a live countdown
- [x] Last Calls that have started are hidden
- [x] Single state module holds all state and exposes actions; screens only read it and call actions
- [x] State persists to localStorage and changes in one tab appear in another tab without reload
- [x] Customer/Business toggle in the header switches sides
- [x] Layout works in a mobile-sized viewport and on desktop
