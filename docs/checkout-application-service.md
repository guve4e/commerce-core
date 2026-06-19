# Checkout Application Service

The CheckoutApplicationService orchestrates checkout creation and checkout state changes.

It does not own business rules directly.

## Responsibilities

- Load store

- Ask store if checkout is allowed

- Load customer

- Ask customer if ordering is allowed

- Use CheckoutCalculator to calculate totals

- Create CheckoutAggregate

- Save checkout through CheckoutRepository

## Flow

```text

Controller

↓

CheckoutApplicationService

↓

StoreRepository / CustomerRepository / CheckoutRepository

↓

StoreAggregate / CustomerAggregate / CheckoutAggregate