---
title: "Spec: LastCall hackathon demo"
labels: [ready-for-agent]
status: open
assignee:
---

## Problem Statement

When a Customer cancels a booking, the Business is left with an empty slot it can't sell. That is lost revenue, and doing anything about it takes manual work. Meanwhile, other people want something now: a tyre change in the next 48 hours, a spontaneous fine-dining evening, or just something fun to do because they're bored. They have no single place to find slots that suddenly became free.

At the hackathon, the team must get this idea across in a **2-minute pitch**. It needs a demo that looks real, feels whimsical, and lets the presenters tell the story in whatever order they settle on.

## Solution

A mocked, whimsical web app called **LastCall**, set in **Oslo**. It works on desktop and in a mobile view. It has two sides, switched with a Customer/Business toggle in the header:

- **Customer side:** a Marketplace of Last Calls (freed-up booking slots at full price ("Skip the queue") or a discount, each with a countdown), filtered by Category and time window. Customers can open a Last Call, book it with a fake booking, and save a Want ("tyres within 48h") so they get an Alert when a matching Last Call is released.
- **Business side:** a booking calendar where cancellations show up. The Business can Release a cancelled slot by hand in one click at full price or with a suggested discount, or set an Auto-release rule that holds the slot for full-price customers and releases it automatically at a set time before it starts. A dashboard shows the revenue recovered, the LastCall fee and the net.

Everything is fake. Data is hardcoded, and state lives in the browser and syncs across tabs, so a Business tab and a Customer tab side by side update live. The functionality is a set of independent bricks rather than one scripted flow.

## User Stories

### Customer: Marketplace

1. As a Customer, I want to open LastCall and immediately see a Marketplace of Last Calls in Oslo, so that I can see what's available right now.
2. As a Customer, I want each Last Call shown as a card with the Business name, Category, neighbourhood, start time and a picture or illustration, so that I can scan options quickly.
3. As a Customer, I want to see the original price struck through next to the Last Call price, so that I can see how much I save.
4. As a Customer, I want a live countdown on each Last Call ("starts in 2h 15m"), so that I feel the urgency and know how much time I have.
5. As a Customer, I want to filter by Category chips (Food, Beauty & Spa, Car, Health, Official appointments, Experiences), so that tyre changes and restaurant don't get mixed together.
6. As a Customer, I want to select several Category chips at once, or none to see everything, so that I can browse broadly or narrowly.
7. As a Customer, I want a time filter (Now / Today / Next 48h), so that I only see Last Calls that fit when I'm free.
8. As a Customer, I want to sort by Soonest, Biggest discount or Nearest, so that I can choose by what matters to me.
9. As a Customer who is bored, I want to browse with no filters and get inspired, so that I can find something fun to do on the spot.
10. As a Customer, I want a friendly, whimsical empty state when no Last Calls match my filters, so that I'm encouraged to widen my search or save a Want.
11. As a Customer, I want Last Calls that have started or been booked to disappear from the Marketplace, so that I only see what I can actually book.
12. As a Customer, I want a newly released Last Call to appear in the Marketplace without reloading, so that the platform feels live.
13. As a Customer, I want a newly released Last Call to be visually highlighted ("just released"), so that I notice fresh drops.

### Customer: Last Call detail and booking

14. As a Customer, I want to open a Last Call and see its details (description, Business, address or neighbourhood, start time, duration, original and Last Call price, countdown), so that I can decide whether to book.
15. As a Customer, I want a clear "Book" button on the detail view, so that I can grab the slot before someone else does.
16. As a Customer, I want booking to need at most a name and a confirm tap (no real payment), so that the demo moves quickly.
17. As a Customer, I want a delightful confirmation screen showing what I booked, when, where and how much I saved, so that I feel good about the deal.
18. As a Customer, I want a booked Last Call to be removed from the Marketplace for everyone, so that the same slot can't be booked twice.

### Customer: Want and Alert

19. As a Customer, I want to save a Want describing what I need, such as "change my tyres within 48h", so that I don't have to keep checking the Marketplace.
20. As a Customer, I want a Want to capture at least a Category and a time window, so that LastCall knows what to match.
21. As a Customer, I want to see and remove my saved Wants, so that I stay in control of what I'm alerted about.
22. As a Customer, I want an Alert to pop up when a Last Call matching one of my Wants is released ("Appointment at Ted's Garage is available, here's the location"), so that I can act straight away.
23. As a Customer, I want to tap an Alert to open that Last Call's detail, so that I can book it in one step.
24. As a Customer, I want Alerts to show on whichever tab or device the Customer side is open in, so that the presenter can show the Business releasing in one tab and the Customer being alerted in the other.
25. As a Customer, I want the Alert to say *why* it matched ("matches your Want: tyres within 48h"), so that the matching feels smart.

### Business: calendar and Release

26. As a Business, I want to see my booking calendar for today and the next couple of days, so that I can see booked, cancelled and released slots at a glance.
27. As a Business, I want cancelled slots to stand out clearly in the calendar, so that I notice lost revenue immediately.
28. As a Business, I want a way to mark a booking as cancelled in the demo, so that the presenter can make a cancellation "come in" at any point in the story.
29. As a Business, I want to Release a cancelled slot as a Last Call in one click, so that recovering revenue takes no effort.
30. As a Business, I want the Release to come with a suggested discount already filled in, which I can adjust before confirming, so that I get a sensible price without thinking.
31. As a Business, I want to choose *not* to Release a cancelled slot, so that I can keep it for a regular full-price customer.
32. As a Business, I want released slots shown as "released" in my calendar, with their Last Call price, so that I know what's on the Marketplace.
33. As a Business, I want to see when a released Last Call is booked through LastCall, so that I know the slot is filled again.
34. As a Business, I want to withdraw a released Last Call that hasn't been booked, so that I can take it back if a regular customer calls.

### Business: Auto-release rules

35. As a Business, I want to set an Auto-release rule ("if a cancelled slot is still empty 1 hour before it starts, release it at 30% off"), so that I get full price if possible and a discounted sale otherwise.
36. As a Business, I want to set how long before the start an Auto-release rule fires, so that the rule fits how my bookings work.
37. As a Business, I want to set the discount an Auto-release rule applies, so that I stay in control of my pricing.
38. As a Business, I want to turn Auto-release on or off, so that I can choose between automatic and manual Release.
39. As a Business, I want cancelled slots waiting on an Auto-release rule to show as "held until HH:MM", so that I know when they will go on the Marketplace.
40. As a Business, I want held slots to be released automatically when the rule's time comes, so that I don't have to do anything.
41. As a Business, I want to Release a held slot by hand earlier than the rule would, so that I keep full flexibility.

### Business: dashboard

42. As a Business, I want a dashboard showing revenue recovered through LastCall, so that I can see the value of the platform at a glance.
43. As a Business, I want to see how many Last Calls I've released and how many sold, so that I understand how well it works.
44. As a Business, I want to see my active Auto-release rule summarised on the dashboard, so that I know what LastCall is doing for me.
45. As a Business, I want dashboard numbers to update when one of my Last Calls is booked, so that the live demo shows money coming back.

### Business: onboarding

46. As a Business, I want a short, mocked "Register your business" moment (name, Category, neighbourhood), so that the pitch can show how easy it is to join.

### Presenter and app shell

47. As a presenter, I want a Customer/Business toggle in the header, so that I can switch sides on a single screen.
48. As a presenter, I want two browser tabs (Customer and Business) to stay in sync live, so that I can show cause and effect side by side.
49. As a presenter, I want the app to work well in a mobile-sized viewport, so that I can show it on a phone or in a phone frame.
50. As a presenter, I want the app to open with a rich, believable Oslo catalogue already loaded, so that the Marketplace never looks empty.
51. As a presenter, I want each brick (Marketplace, detail + book, Release, Auto-release rule, dashboard, Want + Alert) usable on its own and in any order, so that the story can change without code changes.
52. As a presenter, I want everything to feel whimsical (playful colours, illustrations, friendly copy, small animations), so that the pitch is memorable.
53. As a presenter, I want the demo to have no loading waits, logins or errors, so that 2 minutes is enough.

## Implementation Decisions

- **Stack:** Vite + React + TypeScript + Tailwind, built as a static site with no backend. Pick whichever routing and state libraries are quickest to build with.
- **Everything is mocked:** no accounts, payments, real notifications or real AI. Data is a hardcoded seed catalogue.
- **Domain model** (vocabulary from the glossary):
  - **Business:** id, name, Category, neighbourhood, a rough location for the "Nearest" sort, and an optional Auto-release rule.
  - **Slot:** a booking in a Business's calendar, with start, duration, full price and a status (`booked` → `cancelled` → `held` / `released` → `sold`, or `withdrawn` back to `cancelled`).
  - **Last Call:** a released Slot, with Last Call price (original price minus discount), release time, and an optional "just released" flag. It is shown on the Marketplace while it is unsold and has not started.
  - **Auto-release rule:** a Business's lead time before start plus a discount, with an enabled flag.
  - **Want:** a Customer's Category (or several) plus a time window (Now / Today / Next 48h), with optional free-text label.
  - **Alert:** a Want plus the matching Last Call, with seen/unseen state.
- **One state module** holds all demo state and exposes actions: cancel slot, release (manual, with discount), withdraw, apply Auto-release rules at the current time, book, add/remove Want, mark Alert seen, register Business. Filtering and sorting of the Marketplace are pure derived functions of this state. React screens only read this module and call its actions.
- **Persistence and sync:** state is saved to localStorage, and other tabs pick up changes through the browser's `storage` event. That is how the Customer and Business tabs update each other live. Alerts are created when a Release happens, for every saved Want that matches it.
- **Want matching:** a Last Call matches a Want when its Category is among the Want's Categories and its start falls within the Want's time window, measured from now. The Alert copy explains the match.
- **Auto-release:** a periodic check (for example every few seconds) releases any held Slot whose start minus the rule's lead time has passed, using the rule's discount. No time fast-forwarding. In the pitch this is explained as an idea, but it still works for real if a slot is set up close to its start.
- **Suggested discount** for a manual Release: the Business's Auto-release rule discount if it has one, otherwise a fixed default (say 30%).
- **Time:** countdowns tick live against the real clock. Seed data times are generated relative to when the app loads, so the catalogue always looks "upcoming".
- **Seed catalogue:** about 15–25 Last Calls across all six Categories from roughly 10–15 Oslo Businesses, with fun names and neighbourhoods. There is one hero Business for the Business side, **Ted's Garage** (Car), whose calendar has a mix of booked slots and a slot that can be cancelled on stage.
- **Screens:** Customer Marketplace (header toggle, Category chips, time filter, sort, card grid/list), Last Call detail, booking confirm and confirmation, Wants (create and list), Alert toast plus a small inbox or badge, Business calendar, Release dialog, Auto-release rule settings, Business dashboard, mocked Register-a-business screen.
- **Layout:** responsive, mobile-first. On desktop the Customer side uses a card grid, and the Business side shows the calendar and dashboard side by side. The header toggle is always visible.
- **Look and feel:** whimsical but trustworthy. Use a bold playful palette, rounded shapes, friendly illustrations or emoji per Category, cheeky microcopy ("Someone bailed. Your gain."), and small celebratory animations on Release and on booking.

## Testing Decisions

- No automated tests. This is a throwaway hackathon demo. Check it by clicking through every brick by hand in both a desktop and a mobile-sized viewport, and with two tabs side by side to confirm live sync.

## Out of Scope

- Incentives for the Canceller.
- C2C resale of personal bookings, and B2B.
- Real AI matching or natural-language parsing of Wants.
- Real accounts, authentication, payments, push/email/SMS notifications, maps or geolocation.
- A demo control panel (time fast-forward, simulate, reset). Auto-release is explained as an idea in the pitch.
- The presentation script itself.
- Integrations with real booking systems.

## Iteration decisions (2026-11-11)

These override anything above where they conflict.

- **Market: Oslo.** Neighbourhoods Grünerløkka, Majorstuen, Frogner, Bjørvika, Gamle Oslo, Tøyen, Sagene, St. Hanshaugen. Currency NOK only, shown as `550 kr`. Growth story (copy only): Oslo → rest of Norway → Denmark → Northern Europe; two categories → any bookable service.
- **Language and brand.** All copy in English; Norwegian place names stay. Tone: short, direct, warm, a little cheeky; never shame the Canceller; emojis only in Alerts.
- **Hero categories.** Restaurant and Tyre change come first and have the most listings. Tyre change 450–700 kr (typical 550). Restaurant 1,500–3,500 kr per person, tables for 2 or 4, shown per person and in total.
- **Discount is optional.** Per release and in the Auto-release rule the Business picks *Full price* ("Skip the queue": no strike-through, no discount sticker) or *Discount*. Full-price Auto-release releases a cancelled slot at once; discount Auto-release holds it until the lead time, then releases at Y% off. Defaults: Ted's Garage full price; Restaurant Løkka 2 hours before at 20% off.
- **Business pricing.** 0 kr to join, no monthly fee, no lock-in. 49 kr per Filled spot (one appointment, or one guest; a table for 2 = 98 kr), capped at 10% of the final sold price after discount, only charged if the Customer shows up, invoiced monthly. First 10 Filled spots free (Intro offer), tracked per Business; a table is never split, so if fewer free spots remain than its guests the whole table is free and the counter goes to 0. One pure function, `calculateFee(listing, business)` in `src/domain/pricing.ts`, is used by the dashboard, Release dialog and onboarding. The Fee is fixed on the Slot when it sells.
- **Dashboard.** Revenue recovered (gross), LastCall fee (with "Free spots left: X/10" while the Intro offer applies), Net recovered, Released / Sold / Sell-through, and "You only pay when we fill a slot."
- **Onboarding** gets a pricing step: headline, three ticks, a calculator (cancellations per week × average price × 4.3 weeks, max cost via `calculateFee`), two examples, a short FAQ, and the default release mode.
- **Positioning.** "Already have a waitlist? Great. LastCall kicks in only when your waitlist can't fill the slot." Shown in onboarding and on the Business side.
- **Demo script** (two tabs, works after `?reset`, every step has a hash URL): see the README.

## Further Notes

- The planning map is at `docs/wayfinder/map.md`. These map tickets were still open when this spec was written, and the spec fills them with sensible defaults (above) so the build isn't blocked. Revisit if the team decides differently:
  - Look and feel – how whimsical?
  - The Oslo catalogue
  - How do Auto-release rules work for a Business?
  - How does a Customer create a Want and receive an Alert?
  - What does the Business dashboard show?
  - Customer screen layouts – marketplace, detail and booking
  - Business screen layout – calendar, release and dashboard
- Still unclear on the map: exactly how a booked Last Call feeds back to the Business side. The default here is that the Slot shows as "sold" in the calendar and the dashboard ticks up live.
- Keep each brick independently reachable (its own route or view), so the presenters can open any of them directly and reorder the story.
- The "AI" in "the cancellation AI-economy" is pitch framing. In the demo it is only suggested by the Alert explaining why something matched.
