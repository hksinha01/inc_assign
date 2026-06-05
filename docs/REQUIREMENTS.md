# ACME HR — Salary Management Tool
## Requirements Document

---

## Goal

Replace Excel-based salary management for ACME org's 10,000 employees with a web-based tool. The primary user is an **HR Manager** who needs to manage employee records and get salary insights across countries and job titles.

---

## Scope & Features

### Page 1 — Employee Management (`/`)
- View all employees in a paginated, searchable table
- Add a new employee via a form
- Edit an existing employee's details inline or via a form
- Delete an employee
- Filter/search by name, country, or job title

**Employee record contains:**
| Field | Type | Notes |
|---|---|---|
| Full Name | String | Required |
| Job Title | String | Required |
| Department | String | Required |
| Gender | String | Required |
| Country | String | Required |
| Salary | Number | Stored as numeric value |
| Employment Type | Enum | Full-time / Part-time / Contract |
| Created At | Timestamp | Auto-set |
| Updated At | Timestamp | Auto-set |

### Page 2 — Insights (`/insights`)
Predefined API-driven salary insights, displayed as a dashboard. Designed to be extended with AI-enabled insights in the future.

**Metrics included:**
- Min / Max / Average salary by country
- Average salary by job title within a country
- Headcount by country
- Average salary by department
- Employment type distribution

---

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | FastAPI (Python) |
| Database | SQLite via SQLAlchemy |
| Frontend | React + Vite |
| Component Library | shadcn/ui + Tailwind CSS |

---

## Project Structure

```
acme-hr/
├── api/          ← FastAPI backend
├── ui/           ← React frontend
├── REQUIREMENTS.md
├── CLAUDE.md
└── README.md
```

---

## Deliberately Left Out

| Feature | Reason |
|---|---|
| **Authentication / Login** | Single internal user persona (HR Manager). Auth adds complexity without value for this demo scope. |
| **Currency conversion** | Employees span multiple countries but currency normalization requires live FX rates or a fixed mapping. Deferred to a future iteration. Salary stored as a plain number. |
| **Audit logs / change history** | Useful in production but out of scope for this demo. |
| **Bulk CSV import/export** | Not in requirements. Would be a natural next feature. Also, for one time migration, an internal script can be used | 
| **Role-based access control** | Only one persona defined — HR Manager. RBAC is premature. |
| **Payroll processing / payslips** | Different product domain entirely. |
| **Email / notification system** | No requirement for it. |
| **Deployment / hosting** | Runs locally only. This is a recruiter demo, not a production deployment. |
| **AI-enabled insights** | The Insights page architecture is designed to support this as a future extension, but AI integration itself is out of scope for added complexity. |

---

## Seeding

A seed script generates 10,000 realistic employee records using `first_names.txt` and `last_names.txt`. Uses bulk insert for performance. Engineers are expected to run this script when setting up locally.

---

## Non-functional Expectations

- Seed script completes in under 5 seconds for 10,000 rows
- UI feels fast and smooth — paginated API responses, no full-table loads
- Frontend and backend are fully decoupled — communicate only via REST API
