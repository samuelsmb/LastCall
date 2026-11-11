# 02: Marketplace filters and sort

**What to build:** A Customer can narrow the Marketplace so tyre changes and fine dining aren't mixed: pick one or more Category chips, choose a time window, and sort the results. When nothing matches, a whimsical empty state nudges them to widen the search.

**Blocked by:** 01 Walking skeleton: Marketplace with the Cooler Copenhagen catalogue

**Status:** ready-for-agent

- [ ] Category chips for Food, Beauty & Spa, Car, Health, Official appointments, Experiences; several can be active, none = all
- [ ] Time filter Now / Today / Next 48h filters by Last Call start time
- [ ] Sort by Soonest, Biggest discount, Nearest (using the seed's rough locations)
- [ ] Filtering and sorting are derived from state, so newly released Last Calls respect the active filters
- [ ] Whimsical empty state when no Last Calls match
- [ ] Works on mobile (chips scroll horizontally) and desktop
