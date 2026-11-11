# 04: Business calendar and manual Release

**What to build:** On the Business side, Ted's Garage sees its booking calendar for today and the next couple of days. The presenter can make a cancellation "come in" on any booked Slot; the cancelled Slot stands out. The Business Releases it in one click with a suggested discount they can tweak, and it appears instantly on the Marketplace (also in another tab), flagged "just released". A released, unsold Last Call can be withdrawn.

**Blocked by:** 01 Walking skeleton: Marketplace with the Cooler Copenhagen catalogue

**Status:** done

- [x] Calendar shows booked, cancelled, released and sold Slots with clear visual states
- [x] Each booked Slot has an action to mark it cancelled
- [x] Release dialog pre-fills a suggested discount (Auto-release rule discount if present, otherwise 30%), editable, showing the resulting Last Call price
- [x] Choosing not to Release leaves the Slot cancelled
- [x] Released Slot shows as released with its Last Call price
- [x] Released Last Call appears on the Marketplace immediately, in this and other tabs, with a "just released" highlight
- [x] Withdraw returns an unsold released Slot to cancelled and removes it from the Marketplace
- [x] Works on mobile and desktop
