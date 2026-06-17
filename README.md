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
| `POST` | `/api/reservations` | Create a booking | Member |
| `GET` | `/api/reservations` | List bookings | Member / Admin |
| `GET` | `/api/reservations/:id` | Get a single booking | Member / Admin |
| `PATCH` | `/api/reservations/:id/cancel` | Cancel a booking | Member / Admin |

> Members can only see and cancel their own reservations. Admins can access all reservations.

### Memberships

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/memberships` | List all memberships | Admin |
| `PATCH` | `/api/memberships/:userId` | Update a user's membership plan | Admin |

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

Before running tests that require authentication, set the `token` and `adminToken` variables in `bruno/environments/local.bru` with valid JWT tokens obtained from the login endpoint.

---

## Project Structure

```
├── bruno/                        # Bruno test collection
│   ├── bruno.json
│   ├── environments/
│   │   └── local.bru
│   ├── auth/
│   ├── spaces/
│   ├── reservations/
│   └── memberships/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── index.ts                  # Entry point
│   ├── docs/
│   │   └── openapi.ts            # OpenAPI spec
│   ├── lib/
│   │   └── prisma.ts             # Prisma client instance
│   ├── middleware/
│   │   └── auth.middleware.ts    # authenticate, requireAdmin, onlyMember
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
| role | String | `member` or `admin` |

### Space
| Field | Type | Description |
|-------|------|-------------|
| id | Int | Unique identifier |
| name | String | Space name |
| type | String | `individual_desk`, `private_room`, or `business_suite` |
| capacity | Int | Maximum number of people |
| pricePerHour | Int | Hourly rate |
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
| status | String | `confirmed` or `canceled` |
| totalPrice | Float | Calculated from duration × pricePerHour |

### Membership
| Field | Type | Description |
|-------|------|-------------|
| id | Int | Unique identifier |
| userId | Int | Reference to the user (unique) |
| plan | String | `basic`, `pro`, or `enterprise` |
| startDate | DateTime | Plan start date |
| endDate | DateTime | Plan expiration date |

---

## What Was Fixed and Implemented

This project was inherited from a previous development team. The following issues were identified and resolved:

### Security fixes

- **JWT verification:** The authentication middleware was using `jwt.decode()` instead of `jwt.verify()`, meaning any forged token with an arbitrary payload was accepted without signature validation. Fixed to use `jwt.verify()`.
- **Role in JWT payload:** The token issued on login and register did not include the user's role, making role-based access control impossible. The `role` field is now included in the payload.
- **Role-based access control:** No authorization middleware existed. Added `requireAdmin` and `onlyMember` middleware applied to all relevant routes. Admin-only routes now reject member tokens with `403`. The booking creation route is restricted to members only.
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
- **Bruno test suite:** Complete test collection in `bruno/` covering all endpoints with at least one success case and one error case each. Runnable with `npm test`.
