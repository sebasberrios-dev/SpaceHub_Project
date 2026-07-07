# SpaceHub API

REST API for managing coworking spaces, bookings, and memberships. Built with Node.js, Express, TypeScript, and PostgreSQL.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT + bcrypt
- **Docs:** OpenAPI 3.0 via swagger-ui-express
- **Tests:** Bruno CLI
- **GraphQL:** graphql-http (queries) + graphql-ws (subscriptions)

---

## Prerequisites

- Node.js v18+
- PostgreSQL running locally or via a remote connection
- A PostgreSQL database created for this project

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and update the variables:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<database_name>"
JWT_SECRET="your_secret_key"
PORT=3000
```

`JWT_SECRET` is the private key the server uses to sign and verify JWT tokens. It should be a long, random string. You can generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Run migrations

Make sure PostgreSQL is running, then apply the schema and generate the Prisma client:

```bash
npx prisma migrate dev
```

This command creates all tables and generates the Prisma client.

> If your PostgreSQL user does not have `CREATE DATABASE` permissions, create the database manually first:
> ```bash
> psql -U <user> -c "CREATE DATABASE <database_name>;"
> ```

### 4. Start the development server

```bash
npm run dev
```

The server will be available at `http://localhost:3000`.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start server in development mode with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start compiled production server |
| `npm run seed` | Seed the database with the admin user required by the test suite |
| `npm test` | Run the Bruno test suite |

---

## API Endpoints

### Auth

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Log in and receive a JWT token | Public |

### Spaces

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/spaces` | List active spaces (supports filters) | Public |
| `GET` | `/api/spaces/:id` | Get a single space by ID | Public |
| `POST` | `/api/spaces` | Create a new space | Admin |
| `PUT` | `/api/spaces/:id` | Update a space | Admin |
| `DELETE` | `/api/spaces/:id` | Deactivate a space | Admin |

`GET /api/spaces` supports the following query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by space type |
| `minCapacity` | number | Minimum capacity |
| `date` | date (YYYY-MM-DD) | Show only spaces available on this date |

### Reservations

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/api/reservations` | Create a booking | Member / Admin |
| `GET` | `/api/reservations` | List bookings | Member / Admin |
| `GET` | `/api/reservations/:id` | Get a single booking | Member / Admin |
| `PATCH` | `/api/reservations/:id/cancel` | Cancel a booking | Member / Admin |

> Members can only see and cancel their own reservations. Admins can access all reservations.

### Memberships

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/memberships` | List all memberships | Admin |
| `PATCH` | `/api/memberships/:userId` | Update a user's membership plan | Admin |

### GraphQL

| Transport | Endpoint | Description | Auth |
|-----------|----------|-------------|------|
| HTTP `POST` | `/api/graphql` | Analytics query | Admin |
| WebSocket | `ws://localhost:3000/api/graphql` | Space availability subscription | Public |

#### Analytics query (admin only)

```graphql
query {
  occupancyAnalytics(startDate: "2026-01-01", endDate: "2026-12-31") {
    totalRevenue
    occupancyByLocation { location spaceCount bookedHours occupancyRate }
    occupancyByType     { type spaceCount bookedHours occupancyRate }
    revenueByPeriod     { period revenue }
    expiringMemberships { userId userName plan endDate }
    topUsers            { userId userName bookingCount totalSpent }
  }
}
```

`startDate` and `endDate` are optional — defaults to the last 30 days.

#### Space availability subscription

```graphql
subscription {
  spaceAvailability {
    spaceId spaceName location isAvailable startTime endTime
  }
}
```

Fires in real time whenever a booking is created (`isAvailable: false`) or cancelled (`isAvailable: true`). Connect via any `graphql-transport-ws` compatible client to `ws://localhost:3000/api/graphql`.

---

## Authentication

All protected endpoints require a JWT token in the `Authorization` header.

**1. Register or log in to get a token:**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

Response:

```json
{
  "user": { "id": 1, "name": "Jane Doe", "email": "user@example.com", "role": "member" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**2. Include the token in subsequent requests:**

```http
GET /api/reservations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Requests without a valid token return `401 Unauthorized`. Requests to admin-only endpoints from a member account return `403 Forbidden`.

---

## Interactive Documentation

With the server running, the full OpenAPI 3.0 documentation is available at:

```
http://localhost:3000/api/docs
```

All endpoints, parameters, request bodies, and response codes are documented and can be tested directly from the browser.

---

## Running Tests

The project includes a Bruno test collection covering all endpoints with both success and error cases.

Make sure the server is running, then:

```bash
npm test
```

The collection is located in `bruno/` and uses the `local` environment (`http://localhost:3000/api`).

The suite is fully autonomous — tokens and resource IDs are generated dynamically via `script:post-response` blocks. Before the first run, seed the admin user:

```bash
npm run seed
```

The seed uses `upsert`, so running it multiple times is safe.

---

## Project Structure

```
├── bruno/                        # Bruno test collection
│   ├── bruno.json
│   ├── environments/
│   │   └── local.bru
│   ├── 01-auth/
│   ├── 02-spaces/
│   ├── 03-reservations/
│   ├── 04-memberships/
│   └── 05-graphql/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── index.ts                  # Entry point
│   ├── docs/
│   │   └── openapi.ts            # OpenAPI spec
│   ├── graphql/
│   │   ├── pubsub.ts             # PubSub instance
│   │   ├── typeDefs.ts           # GraphQL SDL
│   │   ├── resolvers.ts          # Query and Subscription resolvers
│   │   └── schema.ts             # makeExecutableSchema
│   ├── lib/
│   │   ├── prisma.ts             # Prisma client instance
│   │   └── booking.utils.ts      # Shared overlap filter
│   ├── middleware/
│   │   └── auth.middleware.ts    # authenticate, requireAdmin
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── spaces.routes.ts
│   │   ├── reservations.routes.ts
│   │   └── memberships.routes.ts
│   └── types/
│       └── index.ts
├── .env.example
└── package.json
```

---

## Data Models

### User
| Field | Type | Description |
|-------|------|-------------|
| id | Int | Unique identifier |
| name | String | Full name |
| email | String | Unique email |
| password | String | bcrypt hash |
| role | Enum | `member` or `admin` |

### Space
| Field | Type | Description |
|-------|------|-------------|
| id | Int | Unique identifier |
| name | String | Space name |
| type | Enum | `individual_desk`, `private_room`, or `business_suite` |
| capacity | Int | Maximum number of people |
| pricePerHour | Float | Hourly rate (supports decimals) |
| location | String | Branch or location name |
| isActive | Boolean | Inactive spaces are hidden from the catalog |

### Booking
| Field | Type | Description |
|-------|------|-------------|
| id | Int | Unique identifier |
| userId | Int | Reference to the user |
| spaceId | Int | Reference to the space |
| startTime | DateTime | Booking start |
| endTime | DateTime | Booking end |
| status | Enum | `pending`, `confirmed`, or `canceled` |
| totalPrice | Float | Calculated from duration × pricePerHour |

### Membership
| Field | Type | Description |
|-------|------|-------------|
| id | Int | Unique identifier |
| userId | Int | Reference to the user (unique) |
| plan | Enum | `basic`, `pro`, or `enterprise` |
| startDate | DateTime | Plan start date |
| endDate | DateTime | Plan expiration date |

---

## What Was Fixed and Implemented

This project was inherited from a previous development team. The following issues were identified and resolved:

### Security fixes

- **JWT verification:** The authentication middleware was using `jwt.decode()` instead of `jwt.verify()`, meaning any forged token with an arbitrary payload was accepted without signature validation. Fixed to use `jwt.verify()`.
- **Role in JWT payload:** The token issued on login and register did not include the user's role, making role-based access control impossible. The `role` field is now included in the payload.
- **Role-based access control:** No authorization middleware existed. Added `requireAdmin` middleware applied to all admin routes. Admin-only routes now reject member tokens with `403`.
- **Reservation ownership:** Any authenticated user could list all reservations, view details of any reservation, and cancel reservations belonging to other users. Fixed: members now only see and can cancel their own reservations.
- **Password hashing:** Passwords were hashed with MD5, which is cryptographically broken for password storage. Replaced with `bcrypt` with a cost factor of 10.
- **GraphQL endpoint removed:** The previous team added a GraphQL layer that was not part of the project requirements. It exposed user password hashes in queries and used `jwt.decode()` without verification. The endpoint and all related code were removed.

### Bug fixes

- **Duplicate booking conflict detection:** The overlap query condition was inverted — it was finding reservations that did *not* conflict instead of those that did. Corrected to use `AND [startTime < end, endTime > start]` for proper overlap detection.
- **Total price calculation:** Two errors in the price formula: the millisecond-to-hour divisor was `1000 * 3500` instead of `1000 * 60 * 60`, and `.toFixed(67)` was used instead of `.toFixed(2)`, producing numbers with 67 decimal places.
- **Cancel before verify:** The cancel reservation handler was running `prisma.booking.update()` before checking ownership, meaning unauthorized users could cancel bookings before receiving a `403` response. Fixed to verify ownership before any database write.

### New features

- **Space filters:** `GET /api/spaces` now filters by `isActive: true` by default (inactive spaces no longer appear in the catalog), and supports query parameters for `type`, `minCapacity`, and `date` (availability check).
- **Space update:** `PUT /api/spaces/:id` was a stub returning `501`. Fully implemented with existence check and field updates.
- **Space deactivation:** `DELETE /api/spaces/:id` was performing a hard delete. Changed to set `isActive: false`, preserving the space record and its booking history.
- **Memberships:** Both membership endpoints were empty stubs. Implemented `GET /api/memberships` (returns memberships with user data) and `PATCH /api/memberships/:userId` (updates the plan with existence check).
- **Schema corrections:** Added `location` field to the `Space` model. Changed `totalPrice` from `String` to `Float` in the `Booking` model. A migration with manual SQL casting was applied to handle existing data.
- **OpenAPI documentation:** Full OpenAPI 3.0 spec covering all endpoints, parameters, request bodies, and response codes. Served interactively via `swagger-ui-express` at `/api/docs`.
- **Bruno test suite:** Complete test collection in `bruno/` covering all endpoints with at least one success case and one error case each. Runnable with `npm test`. Suite is fully autonomous — tokens and resource IDs are generated dynamically via `script:post-response` blocks.
- **Input validation:** Email uniqueness returns `409` instead of `500`. Invalid membership plans return `400`. Bookings with `endTime` before `startTime` return `400`.
- **Membership on register:** User registration now creates a default `basic` membership (1 year validity) in the same database transaction.
- **Active memberships filter:** `GET /api/memberships` only returns memberships where `endDate` is in the future.
- **JWT_SECRET required:** Server fails at startup with a clear error if `JWT_SECRET` is not set in the environment.
- **Overlap logic extracted:** Booking conflict detection extracted to `src/lib/booking.utils.ts` and reused in both reservations and space availability filter.
- **GraphQL analytics panel:** `POST /api/graphql` exposes an `occupancyAnalytics` query (admin-only) returning occupancy rate by location and space type, accumulated revenue by period, memberships expiring in the next 30 days, and top users by booking activity.
- **GraphQL real-time subscription:** WebSocket endpoint at `ws://localhost:3000/api/graphql` exposes a `spaceAvailability` subscription. Every time a booking is created, all connected clients receive an event with the space ID, name, location, and the booked time range.

### Feedback corrections

**Security:**
- **JWT expiration:** Tokens issued on register and login now expire after 8 hours (`expiresIn: "8h"`). Previously tokens had no expiration and were valid indefinitely.
- **Password hash exposure:** Booking list and detail responses were returning the full user object including the bcrypt hash. User fields are now explicitly selected (`id`, `name`, `email`, `role`) — password is never returned.

**Logic:**
- **Booking initial status:** New bookings are created with `pending` status instead of `confirmed`.
- **Inactive space detail:** `GET /api/spaces/:id` now returns `404` for inactive spaces, consistent with the listing endpoint which already filtered them out.
- **Cancellation subscription:** The real-time subscription now also fires when a booking is cancelled, with `isAvailable: true`, so connected clients are notified when a space becomes available again.
- **Future date validation:** Creating a booking with a `startTime` in the past now returns `400`. Only future bookings are accepted.
- **Register input validation:** Registration now validates that `name` is non-empty, `email` matches a valid format, and `password` is at least 6 characters. Returns `400` with a descriptive error.
- **Space input validation:** Creating or updating a space validates that `name` is non-empty, `type` is one of the three valid enum values, `capacity` is greater than zero, and `pricePerHour` is greater than zero. Returns `400` on violation.

**Error handling:**
- **Cancel reservation error:** The `catch` block in the cancel route was returning `404`, masking database errors as "not found". It now returns `500` for unexpected errors.
- **Global error handler:** Added a global Express error handler that returns all unhandled errors as JSON `500`. Previously, unhandled errors could return HTML.
- **404 handler:** Added a catch-all route returning JSON `{ "error": "route not found" }` for unknown paths. Previously, Express returned its default HTML 404 page.

**Database:**
- **`pricePerHour` type:** Migrated from `Int` to `Float` so decimal prices (e.g. $19.50/h) are stored correctly. A manual migration with `CAST` was applied to preserve existing data.
- **Enum types:** `role`, `space.type`, `booking.status`, and `membership.plan` are now PostgreSQL enum types enforced at the database level. Previously they were free-text strings, allowing invalid values to be stored silently.
- **Indexes:** Added database indexes on `Booking` (`userId`, `spaceId`, `(startTime, endTime)`, `status`) and `Membership` (`endDate`) to improve query performance on filtered lookups.

**TypeScript:**
- **Strict mode enabled:** `strict: true` and `noImplicitAny: true` added to `tsconfig.json`. All resulting type errors were resolved.
- **`req.user` typed:** The `user` property on Express `Request` is now typed as `AuthUser` instead of `any`, enabling compile-time checks on middleware-injected data.
- **Stricter type definitions:** `role` in `AuthUser` is now a `"member" | "admin"` union literal instead of `string`. `spaceId` in `CreateBookingBody` is now `number` instead of `string`.

**Tests (Bruno):**
- **Dynamic reservation dates:** The create-reservation test now computes `startTime` and `endTime` at runtime (24 hours from now), avoiding failures caused by hardcoded past dates.
- **Dynamic resource IDs:** Update-space, deactivate-space, and cancel-reservation tests now use `{{spaceId}}` and `{{bookingId}}` set dynamically by previous steps, instead of hardcoded IDs.
- **Seed script:** Added `prisma/seed.ts` and `npm run seed` to provision `admin@example.com` (role: `admin`) required by the admin test cases. Uses `upsert` so it is safe to run multiple times.

**Documentation:**
- **Missing response codes:** Added `400` (validation errors), `409` (conflicts), and `500` (server errors) to all endpoints in the OpenAPI spec that were previously missing them. The spec now fully reflects the actual behavior of every route.
