# LastCall

A marketplace for the cancellation economy: businesses resell booking slots freed up by cancellations to customers who want something now.

## Language

**Last Call**:
A freed-up booking slot that a business has put up for sale on the marketplace, at full price or a discount.
_Avoid_: Listing, event, appointment, deal, offer

**Release**:
The act of a Business putting a cancelled slot on the marketplace as a Last Call, either by hand or by an Auto-release rule.
_Avoid_: Publish, post, list

**Auto-release rule**:
A Business's standing instruction for cancelled slots: either release them at once at full price (Skip the queue), or hold them for full-price customers until a set time before they start and then release them at a set discount.
_Avoid_: Automation, trigger

**Want**:
A Customer's saved need, such as "tyre change within 48h", that LastCall matches new Last Calls against. A Want can also be open-ended ("any time"), such as "I like restaurants in Sentrum". Following a Business is a Want for that Business's Last Calls only.
_Avoid_: Wish, request, subscription

**Alert**:
A notice to a Customer that a newly released Last Call matches one of their Wants.
_Avoid_: Notification, push

**Taste profile**:
What LastCall knows about a Customer's interests in the background, e.g. "likes new music experiences". Used to recommend Last Calls; the Customer does not write it by hand.
_Avoid_: Preferences, persona, user profile

**Assistant**:
A chat helper for Customers that finds Last Calls, recommends ones that fit their Taste profile, and sets up Wants for them. Shown as "Assistent" in the UI.
_Avoid_: Agent, bot, chatbot, AI

**Category**:
The kind of service or experience a Last Call belongs to, e.g. tyre change, restaurant, spa.
_Avoid_: Type, vertical

**Business**:
A service provider that registers on LastCall and posts Last Calls.
_Avoid_: Provider, vendor, merchant, seller

**Customer**:
A person browsing and booking Last Calls.
_Avoid_: User, buyer, consumer

**Canceller**:
The person whose cancellation freed up the slot behind a Last Call.
_Avoid_: Original customer

**Canceller bonus**:
A share of the sold price a Business promises the Canceller (0–50 % in steps of 5, set with a slider next to its Auto-release rule) for cancelling in time. The percent is fixed when the slot is cancelled; it is paid in kroner, worked out from the price the slot sells for, and only if it sells on LastCall. It comes out of the Business's net.
_Avoid_: Refund, reward, cashback

**Skip the queue**:
A Last Call released at full price (0% off). The Customer's gain is getting in at all, not a lower price. Shown as a sticker instead of a discount.
_Avoid_: No-discount deal, full-price offer

**Filled spot**:
The unit LastCall charges for: one sold appointment, or one guest at a sold restaurant table (a table for 2 is 2 filled spots). Tables are never split.
_Avoid_: Booking, seat, cover

**Fee**:
What a Business pays LastCall for a sold Last Call: 49 kr per Filled spot, capped at 10% of the final sold price, only if the Customer shows up. Computed by `calculateFee`.
_Avoid_: Commission, cut, take rate

**Intro offer**:
A Business's first 10 Filled spots are free. A table that needs more free spots than remain is still entirely free; the counter then stops at 0.
_Avoid_: Trial, free tier
