# Performance Considerations

---

## 1. Seed script — bulk insert over row-by-row

**Problem:** Inserting 10,000 rows one at a time with individual `session.add()` + `session.commit()` calls creates 10,000 round-trips to the database. At even 1ms per insert, that's 10 seconds.

**Solution:** `session.bulk_insert_mappings()` — batches all 10,000 rows into a single SQL statement in one transaction.

```python
# Slow — 10,000 individual inserts
for employee in employees:
    session.add(Employee(**employee))
    session.commit()

# Fast — one bulk insert
session.bulk_insert_mappings(Employee, employees)
session.commit()
```

**Expected result:** Under 2 seconds for 10,000 rows on a standard laptop.

---

## 2. Database indexes

The employees table has indexes on the columns most used in `WHERE` and `ORDER BY` clauses:

```python
country    → Index  (insights queries group by country)
job_title  → Index  (insights queries group by job title)
full_name  → Index  (search filter on employee list)
```

Without indexes, every filter on 10,000 rows requires a full table scan. With indexes, lookups are O(log n).

---

## 3. API pagination — never return all rows

The `GET /employees` endpoint is paginated with a default `page_size` of 20. The database query uses `LIMIT` + `OFFSET` so the API never loads all 10,000 rows into memory at once.

```python
# Always bounded — regardless of total row count
query.offset((page - 1) * page_size).limit(page_size)
```

The response includes `total`, `page`, and `page_size` so the frontend can render a page navigator without an extra count query (total is computed in the same query).

---

## 4. Insights queries — aggregation in the database, not Python

Salary aggregations (min, max, avg, group by country) are computed entirely in SQL, not by fetching all rows into Python and computing in-memory.

```python
# Wrong — loads all rows into memory
employees = session.query(Employee).all()
avg = sum(e.salary for e in employees) / len(employees)

# Right — database does the work
session.query(
    Employee.country,
    func.avg(Employee.salary)
).group_by(Employee.country).all()
```

SQLite's aggregation engine is significantly faster than Python for this operation, and no unnecessary data crosses the ORM boundary.

---

## 5. Frontend — no all-at-once data loading

The Employees page fetches one page at a time. The Insights page fetches each metric independently via separate API calls, so the dashboard renders progressively — fast metrics appear first while slower aggregations load.

---

## 6. uv for dependency management

`uv` is used instead of `pip` for installing Python dependencies. It resolves and installs packages significantly faster (typically 10–100x), which matters when engineers run setup regularly.

```bash
uv run uvicorn main:app --reload --port 8000
```
---

## 7. Caching — deliberately skipped

API response caching (Redis, in-memory) or any other caching is not implemented.

**Reasoning:** At 10,000 rows on SQLite on localhost, insight queries run in under 50ms. Caching adds infrastructure complexity (cache invalidation, TTL decisions, stale data risk) that provides no measurable benefit at this scale.

**At scale:** If the dataset grew to millions of rows or the API served many concurrent users, caching insight endpoints (which are read-heavy and change infrequently) with a short TTL would be the first performance lever to pull — before any database sharding or infrastructure changes.