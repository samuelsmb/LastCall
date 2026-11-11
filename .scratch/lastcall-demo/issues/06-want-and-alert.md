# 06: Want and Alert

**What to build:** A Customer saves a Want ("tyres within 48h": one or more Categories plus a time window, optional label) and can see and remove their Wants. When a Last Call matching a Want is released, from any tab, an Alert pops up explaining why it matched ("Appointment at Ted's Garage is available - matches your Want: tyres within 48h"). Tapping the Alert opens the Last Call detail. A small inbox or badge keeps unseen Alerts.

**Blocked by:** 03 Last Call detail and booking, 04 Business calendar and manual Release

**Status:** ready-for-agent

- [ ] Create a Want with Categories + time window (Now / Today / Next 48h) and optional label
- [ ] List and remove saved Wants
- [ ] A Last Call matches when its Category is in the Want and its start falls in the Want's window from now
- [ ] Releasing a matching Last Call (manual or auto) creates an Alert
- [ ] Alert toast shows on the Customer side in whichever tab is open, including when the Release happened in another tab
- [ ] Alert copy names the Business, location and the matched Want
- [ ] Tapping an Alert opens the Last Call detail and marks it seen
- [ ] Inbox or badge shows unseen Alerts
