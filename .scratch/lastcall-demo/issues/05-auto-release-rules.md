# 05: Auto-release rules

**What to build:** A Business sets an Auto-release rule: hold cancelled Slots for full-price customers, then release them automatically a set time before start at a set discount. Cancelled Slots under an active rule show "held until HH:MM" and go onto the Marketplace on their own when that time arrives. The Business can still Release a held Slot early by hand.

**Blocked by:** 04 Business calendar and manual Release

**Status:** done

- [x] Rule settings: lead time before start, discount, enabled on/off
- [x] With the rule enabled, newly cancelled Slots become held and show "held until HH:MM"
- [x] A periodic check releases held Slots whose release time has passed, at the rule's discount, and they appear on the Marketplace like a manual Release
- [x] A held Slot can be released early via the manual Release dialog
- [x] Disabling the rule turns held Slots back into plain cancelled Slots
- [x] Rule persists and syncs across tabs
