---
title: LastCall hackathon demo
labels: [wayfinder:map]
status: open
---

# LastCall hackathon demo

## Destination

A spec for a mocked, whimsical LastCall web demo (desktop + mobile view) set in Oslo, built from bricks that can be shown in any order in a 2-minute pitch. Done when every brick can be built without further questions.

## Notes

- Domain: the cancellation economy. Vocabulary lives in [GLOSSARY.md](../../GLOSSARY.md); consult it every session and use **domain-modeling** when terms shift.
- Tracker: local markdown. Tickets live in [tickets/](./tickets/); each has frontmatter `labels`, `status` (open/closed), `assignee` (the claim), `blocked_by`. Frontier = open, unassigned tickets whose `blocked_by` are all closed.
- Standing decisions (from charting, 2026-11-11):
  - Everything is mocked: hardcoded data, no accounts, payments or backend; state lives in the browser.
  - Stack: Vite + React + TypeScript + Tailwind, static site. Must look good: **whimsical**.
  - Web app with a mobile view.
  - Functionality is a set of bricks, not a scripted flow; the story and its order may change. Bricks: Marketplace, Last Call detail + book, Release (manual + Auto-release rule), Business dashboard, Want + Alert.
  - Marketplace sorting: category chips (Food, Beauty & Spa, Car, Health, Official appointments, Experiences), time filter (Now / Today / Next 48h), sort (Soonest / Biggest discount / Nearest).
  - A Last Call shows original price struck through, Last Call price, and a countdown to start.
  - Release is both manual (Business releases whenever) and automatic (Auto-release rule: hold for full-price customers, then release at a discount X time before start).
  - Customer/Business toggle in the app header, plus localStorage sync so two tabs side by side update live.
  - Language English; setting is **Oslo** (was Cooler Copenhagen until the 2026-11-11 iteration).

## Decisions so far

<!-- one line per closed ticket -->

- 2026-11-11 iteration (see "Iteration decisions" in [the spec](../issues/lastcall-demo-spec.md)): market is Oslo, NOK only (`550 kr`); all copy English with a single `TAGLINE` constant; Restaurant and Tyre change are the hero categories; discount is optional (full price = "Skip the queue"); Businesses pay 49 kr per Filled spot capped at 10%, first 10 spots free; dashboard shows recovered, fee and net; onboarding has a pricing step; LastCall complements a waitlist.

## Not yet specified

- How a booked Last Call feeds back to the Business side (does the dashboard tick up live, does the slot disappear from the calendar?). Likely graduates once the dashboard and screen layouts are settled.

## Out of scope

- C2C resale, B2B: future growth, mentioned in the pitch only. (Canceller incentives graduated into the Canceller bonus.)
- Real AI matching, real notifications, real payments.
- Demo control panel (time fast-forward, simulate, reset): not needed; Auto-release can be told as an idea in the pitch.
- The presentation script itself.
