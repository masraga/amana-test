# Amana Case Management

A secure Whistleblowing & Case Management platform where employees can submit incident reports and administrators can manage and resolve cases.

## Features

- **Role-based access control** — Reporter and Administrator roles, enforced on the backend
- **JWT Authentication** — Secure stateless auth
- **Incident Reports** — Create drafts, edit, submit, track status
- **Admin Dashboard** — Review submitted reports, update investigation status
- **Status workflow** — Draft → Submitted → Under Review → Resolved
- **Search & Filter** — Filter by title, category, and status

---

## Tech Stack

| Layer          | Technology                               |
| -------------- | ---------------------------------------- |
| Backend        | PHP 8.3, Laravel (API-only), JWT Auth    |
| Frontend       | React 18, TypeScript, Vite, Tailwind CSS |
| Database       | MySQL 8                                  |
| Infrastructure | Docker + nginx                           |

---

## Prerequisites

### For Docker (recommended)

- Docker Desktop 4+
- Docker Compose v2

### For direct terminal run

- PHP 8.5+
- Composer 2
- Node 18+
- MySQL 8

---

## Quick Start — Docker

```bash
# 1. Clone and enter the project
cd amana

# 2. Copy env files
cp backend/.env.docker backend/.env

# 3. Build and start containers
docker compose up -d --build

# 4. Wait for MySQL to be healthy, then run setup
docker compose exec app php artisan key:generate
docker compose exec app php artisan jwt:secret
docker compose exec app php artisan migrate --seed

# 5. Frontend is served automatically at http://localhost:5173
#    API is available at http://localhost:8000/api/v1
```

---

## Quick Start — Direct Terminal

Open **two terminals**:

**Terminal 1 — Backend**

```bash
cd backend
cp .env.example .env
# Edit .env: set DB_HOST=127.0.0.1, DB_DATABASE=amana, DB_USERNAME, DB_PASSWORD
composer install
php artisan key:generate
php artisan jwt:secret
php artisan migrate --seed
php artisan serve --port=8000
```

**Terminal 2 — Frontend**

```bash
cd frontend
cp .env.example .env
# .env already points to http://localhost:8000/api/v1
npm install
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:8000/api/v1

---

## Default Test Accounts

| Email               | Password | Role          |
| ------------------- | -------- | ------------- |
| admin@amana.test    | password | Administrator |
| reporter@amana.test | password | Reporter      |

---

## Running Tests

```bash
# From the backend/ directory
php artisan test                    # all tests (30 tests)
php artisan test --testsuite=Unit   # unit tests only
php artisan test --testsuite=Feature # feature tests only
php artisan test --filter ReportService # specific class
```

---

## API Reference

Base URL: `http://localhost:8000/api/v1`

### Auth

| Method | Endpoint       | Access        |
| ------ | -------------- | ------------- |
| POST   | /auth/register | Public        |
| POST   | /auth/login    | Public        |
| POST   | /auth/logout   | Authenticated |
| GET    | /auth/me       | Authenticated |

### Dashboard

| Method | Endpoint   | Access                     |
| ------ | ---------- | -------------------------- |
| GET    | /dashboard | Authenticated (role-aware) |

### Reporter Reports

| Method | Endpoint             | Description                   |
| ------ | -------------------- | ----------------------------- |
| GET    | /reports             | List own reports (filterable) |
| POST   | /reports             | Create draft                  |
| GET    | /reports/{id}        | View own report               |
| PUT    | /reports/{id}        | Update draft                  |
| DELETE | /reports/{id}        | Delete draft                  |
| PATCH  | /reports/{id}/submit | Submit draft                  |

### Admin Reports

| Method | Endpoint                   | Description                 |
| ------ | -------------------------- | --------------------------- |
| GET    | /admin/reports             | List all submitted+ reports |
| GET    | /admin/reports/{id}        | View any report             |
| PATCH  | /admin/reports/{id}/status | Update status               |

---

## Project Structure

```
amana/
  backend/          Laravel API
    app/
      Http/Controllers/Api/
      Http/Middleware/
      Http/Requests/
      Models/
      Policies/
      Repositories/Contracts/
      Repositories/
      Services/
    database/
      migrations/
      factories/
      seeders/
    tests/
      Unit/Services/
      Feature/Auth/
      Feature/Report/
  frontend/         React + TypeScript
    src/
      api/
      components/common/
      components/layout/
      pages/auth/
      pages/dashboard/
      pages/reports/
      pages/admin/
      store/
      types/
      utils/
  docker/
    nginx/default.conf
  docker-compose.yml
```
