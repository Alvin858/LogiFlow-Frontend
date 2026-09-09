# LogiFlow — Member 1 Angular Frontend

Frontend ownership is limited to **Member 1**:

- M1 Authentication & Authorization
- M2 Customer/User Management
- M3 Vehicle & Driver Management

The project uses Angular + TypeScript + Angular Material and keeps the UI separated into
`core`, `shared`, and feature areas. Every component has a separate `.ts`, `.html`, and `.css` file.

## Backend contract used

The frontend is wired to the Member 1 ASP.NET Core API:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- `GET /api/auth/me`
- `GET/PUT /api/customers/profile`
- `GET/POST/PUT/DELETE /api/customers/addresses`
- `GET /api/customers/{id}`
- `GET/POST/PUT/DELETE /api/vehicles`
- `GET /api/vehicles/{id}`
- `PATCH /api/vehicles/{id}/status`
- `GET/POST/PUT/DELETE /api/drivers`
- `GET /api/drivers/{id}`
- `PATCH /api/drivers/{id}/availability`

## Requirements

- Node.js 20.19+ or 22.12+
- Angular CLI 20
- Member 1 backend running on `http://localhost:5080`

## Run

1. Start the ASP.NET Core backend:
   `dotnet run --project src/LogiFlow.API`
2. In this frontend folder:
   `npm install`
3. Start Angular:
   `npm start`
4. Open `http://localhost:4200`

The Angular development proxy forwards `/api/*` to `http://localhost:5080`.

## Important

Do not put database connection strings, JWT signing keys, passwords, or backend User Secrets in this frontend repository.
