# Trade-off Explanations

---

## 1. SQLite vs PostgreSQL

**Chose:** SQLite

| | SQLite | PostgreSQL |
|---|---|---|
| Setup | Zero — single file | Requires server process |
| Performance at 10k rows | Excellent | Excellent |
| Concurrent writes | Limited (file lock) | Full concurrent support |
| Migration path | Drop-in via SQLAlchemy | Same ORM, different driver |

**Reasoning:** 10,000 rows is a small dataset. The HR Manager is a single user — no concurrent write contention. SQLite requires zero infrastructure, which matters for a local demo. The SQLAlchemy abstraction means switching to PostgreSQL later is a one-line change in `database.py`.

---

## 2. FastAPI vs Django vs Flask

**Chose:** FastAPI

| | FastAPI | Django REST | Flask |
|---|---|---|---|
| Auto API docs | Yes (OpenAPI) | No (needs drf-spectacular) | No |
| Validation | Built-in (Pydantic) | Serializers (verbose) | Manual |
| Boilerplate | Minimal | Heavy | Minimal |
| Async support | Native | Partial | Limited |

**Reasoning:** FastAPI gives Pydantic validation, auto-generated `/docs`, and async support out of the box with minimal code. Django adds too much overhead for a focused API with five endpoints. Flask requires assembling validation and docs separately.

---

## 3. React (SPA) vs Next.js (SSR)

**Chose:** React + Vite (SPA)

**Reasoning:** Server-side rendering adds complexity with no benefit for an internal HR tool accessed by one user on localhost, even with mutliple users for an internal tool, it isn't worth the effort since we don't need SEO either. A SPA is simpler to build, easier to deploy statically if needed, and perfectly suited for a data-heavy dashboard that fetches everything client-side via API.

---

## 4. Pagination strategy — offset vs cursor

**Chose:** Offset pagination (`LIMIT` / `OFFSET`)

**Reasoning:** Cursor-based pagination is better for large, append-only datasets (social feeds, logs). For an HR table where an employee can be sorted by name or salary and edited freely, offset pagination is simpler to implement and easier for the UI to reason about (jump to page 5, show "page 3 of 50"). At 10,000 rows, offset pagination has no meaningful performance penalty.

---

## 5. ORM vs raw SQL for insights queries

**Chose:** SQLAlchemy ORM with `func.min`, `func.max`, `func.avg`, `group_by`

**Reasoning:** The insight queries are aggregations — well within what SQLAlchemy expresses cleanly. Raw SQL would be faster to write initially but harder to maintain and test. The ORM keeps the codebase consistent and the queries are not complex enough to justify dropping down to raw SQL.

---

## 6. No authentication

**Chose:** No auth

**Reasoning:** Single user persona (HR Manager), local-only deployment, recruiter demo scope. Adding JWT or session auth would increase the backend complexity without demonstrating anything relevant to the assessment. The architecture supports adding an auth layer (FastAPI middleware) without restructuring anything.

---

## 7. Currency stored as plain number

**Chose:** Store salary as a float, no currency field

**Reasoning:** Currency conversion requires either a fixed mapping (INR=India, USD=USA — breaks for countries with multiple currencies) or live FX rates (external API dependency). Either adds complexity that distracts from the core HR tool. Salary comparisons within a country remain valid. Deferred to a future iteration with a `currency` field and conversion layer.

---

## 8. shadcn/ui + Tailwind CSS vs other component libraries

**Chose:** shadcn/ui + Tailwind CSS

| | shadcn/ui | MUI | Ant Design |
|---|---|---|---|
| Bundle size | Only what you use | Large | Large |
| Customisation | Full — you own the code | Theme overrides only | Theme overrides only |
| Design quality | High, clean | Corporate | Corporate |
| Tailwind-native | Yes | No | No |

**Reasoning:** shadcn/ui copies components directly into my codebase — no black-box library dependency, full control over styling. Tailwind keeps styles co-located with components, making the UI fast to build and easy to adjust. MUI and Ant Design ship large bundles and their default aesthetics require significant overriding to look polished.