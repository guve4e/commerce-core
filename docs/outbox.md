# Outbox Pattern

The outbox pattern lets the commerce engine persist business events safely before publishing them to external systems.

## Why

We do not want this:

```text

Save order

↓

Send email

↓

Email fails

↓

Database already changed