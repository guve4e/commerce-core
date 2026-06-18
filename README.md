# commerce-core

Modern commerce backend built with NestJS, Prisma, and PostgreSQL.

Goals:

- Keep the existing PHP storefront alive.
- Replace legacy Spring Boot services.
- Build a clean domain-driven backend.
- Remove legacy adapters later.

Current architecture:

Controller
↓
Application Service
↓
Domain Aggregate
↓
Prisma
↓
PostgreSQL

Current domains:

- Orders
- Inventory
- Payments
- Returns
- Coupons

Core commands:

npm test
npm run smoke
npm run smoke:legacy
