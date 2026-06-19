# Repository Layer

Repositories are contracts between the application layer and persistence.

They belong near the domain, but they do not contain Prisma details.

## Rule

Domain aggregates must not know about:

- Prisma

- PostgreSQL

- HTTP

- NestJS decorators

- controllers

- DTOs

- external APIs

## Flow

```text

Controller

↓

Application Service

↓

Repository Interface

↓

Prisma Repository Implementation

↓

PostgreSQL