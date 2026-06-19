# Roadmap

Completed:

- Orders aggregate
- Inventory aggregate
- Payments aggregate
- Returns aggregate
- Coupons aggregate
- Commerce smoke flow
- Legacy smoke flow

Next:

- Coupon redemption
- Shipment aggregate
- Visitor aggregate
- Store aggregate
- Customer aggregate

Later:

- Stripe
- Emails
- Redis
- Kafka
- Analytics
- AI tools

Final goal:

Delete legacy controllers and PHP storefront.

## Pricing Domain

```bash

cat >> docs/roadmap.md <<'EOF'

## Repository Layer



DONE:

- DomainEvent base contract

- DomainEventRecorder

- CheckoutCreatedEvent

- CheckoutReadyEvent

- CheckoutAggregate records events

NEXT:

- Application service pulls domain events after saving

- Outbox interface

- Outbox repository implementation later