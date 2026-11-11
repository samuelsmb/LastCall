---
title: Partner page for businesses with several locations
labels: [wayfinder:prototype, backlog]
status: open
assignee:
blocked_by: []
---

## Idea

When Add business finds that a business has several locations (underenheter in Brønnøysundregistrene, e.g. Vianor or Snap Drive), we show a clear "Bli partner" button. If they say yes, they get a partner page: a wider overview across all their locations than the single-location dashboard.

Builds on the location lookup in Add business (`listUnits` in `src/domain/brreg.ts`, PR #7). Comes after the work in progress (PR #7 and #9).

## Ideas for the page (be creative)

- Every location on one page: recovered revenue, fee, net and sell-through per location, plus totals for the chain.
- A map or list of locations with live Last Calls right now.
- Chain-wide Auto-release rule and Canceller bonus, with overrides per location.
- Move a cancelled slot to another location's customer queue, or point customers to the nearest location with a free slot.
- A shared brand page customers can follow, which alerts them about Last Calls at any location (follows from PR #9).
- Partner perks: partner badge on Last Call cards, own intro offer for the chain.

## Open questions

- What does "partner" mean commercially: a different fee, volume terms, or only the wider overview?
- Does the head office register every location at once, or does each location join on its own?
