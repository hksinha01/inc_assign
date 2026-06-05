# CLAUDE.md — Project Guide for Claude Code CLI

This file helps Claude Code understand the project structure, conventions, and how to work effectively in this codebase.

---

## Project Overview

**ACME HR** is a salary management web tool for an HR Manager to manage 10,000 employees and view salary insights. It is a recruiter demo — local-only, no auth, no deployment.

---

## Repository Structure

```
acme-hr/
├── api/                  ← FastAPI backend (Python)
│   ├── main.py           ← App entrypoint, CORS, router registration
│   ├── database.py       ← SQLAlchemy engine + session setup
│   ├── models.py         ← SQLAlchemy ORM models
│   ├── schemas.py        ← Pydantic request/response schemas
│   ├── crud.py           ← DB query functions (no business logic in routes)
│   ├── seed.py           ← Seed script for 10,000 employees
│   ├── routers/
│   │   ├── employees.py  ← CRUD endpoints for employees
│   │   └── insights.py   ← Salary insight endpoints
│   ├── tests/
│   │   ├── test_employees.py
│   │   └── test_insights.py
│   └── requirements.txt
│
├── ui/                   ← React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Employees.jsx   ← Home page: employee table + CRUD
│   │   │   └── Insights.jsx    ← Insights dashboard
│   │   ├── components/         ← Reusable UI components
│   │   ├── api/                ← Axios API call functions
│   │   │   ├── employees.js
│   │   │   └── insights.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── docs/                  ← Any future doc/images
│   ├── REQUIREMENTS.md    
│   
│
├── first_names.txt
├── last_names.txt
├── CLAUDE.md             ← This file
└── README.md
```

---

## How to Run

### Backend
```bash
cd api
uv run uvicorn main:app --reload --port 8000
```

API runs at: http://localhost:8000
Auto docs at: http://localhost:8000/docs

### Frontend
```bash
cd ui
npm install
npm run dev
```

UI runs at: http://localhost:5173

### Seed the Database
```bash
cd api
python seed.py
```

---

## Key Conventions

### Backend
- **Separation of concerns**: routes call `crud.py` functions only. No raw DB queries in routers.
- **Schemas**: always use Pydantic schemas for request validation and response shaping. Never return ORM objects directly.
- **Database sessions**: use FastAPI's `Depends(get_db)` pattern for session injection.
- **Tests**: use pytest with an in-memory SQLite database. No mocking the DB — test against real queries.

### Frontend
- **API calls**: all fetch/axios calls live in `src/api/`. Pages never call fetch directly.
- **Pages vs Components**: pages are route-level; components are reusable UI pieces.
- **No global state library** (Redux etc.) — React Query or local state is sufficient for this scope.

---

## API Endpoints Reference

### Employees
| Method | Path | Description |
|---|---|---|
| GET | `/employees` | List employees (paginated, filterable) |
| POST | `/employees` | Create employee |
| GET | `/employees/{id}` | Get single employee |
| PUT | `/employees/{id}` | Update employee |
| DELETE | `/employees/{id}` | Delete employee |

### Insights
| Method | Path | Description |
|---|---|---|
| GET | `/insights/by-country` | Min/max/avg salary per country |
| GET | `/insights/by-jobtitle` | Avg salary by job title in a country |
| GET | `/insights/by-department` | Avg salary by department |
| GET | `/insights/headcount` | Employee count by country |
| GET | `/insights/employment-type` | Distribution by employment type |

---

## Employee Data Model

```python
id                int (PK, autoincrement)
full_name         str
job_title         str
department        str
country           str
salary            float
employment_type   str  # "Full-time" | "Part-time" | "Contract"
created_at        datetime
updated_at        datetime
```

---

## What Is Deliberately Out of Scope

- Authentication and Role Bifuracation
- Currency conversion
- Audit logs
- CSV import/export
- Deployment
- AI-enabled insights (architecture supports it as future extension)

See `docs/REQUIREMENTS.md` for full reasoning.

---

## Testing

```bash
cd api
pytest tests/ -v
```

Tests use an in-memory SQLite DB — fast, isolated, no state leakage between tests.
