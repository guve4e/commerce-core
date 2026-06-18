# Architecture

Current flow:

Controller
↓
Application Service
↓
Domain Aggregate
↓
Prisma
↓
PostgreSQL

Legacy PHP storefront:

PHP
↓
Legacy Controllers
↓
New Domain
↓
Prisma
↓
PostgreSQL

Future:

Nuxt Storefront
Nuxt Admin
↓
Modern Controllers
↓
Application Services
↓
Aggregates
↓
Prisma
