import pytest
from conftest import EMPLOYEE


@pytest.fixture
def seeded(client):
    """
    Seeds a small, deterministic dataset so insight assertions are exact.

    India:   HR Manager @ 60,000  (Full-time)
             HR Manager @ 90,000  (Part-time)
    Germany: HR Analyst @ 100,000 (Contract)
    """
    rows = [
        {**EMPLOYEE, "country": "India",   "job_title": "HR Manager", "department": "HR",          "salary": 60_000, "employment_type": "Full-time"},
        {**EMPLOYEE, "country": "India",   "job_title": "HR Manager", "department": "HR",          "salary": 90_000, "employment_type": "Part-time"},
        {**EMPLOYEE, "country": "Germany", "job_title": "HR Analyst", "department": "Engineering", "salary": 100_000, "employment_type": "Contract"},
    ]
    for row in rows:
        client.post("/employees/", json=row)
    return client


# --- Salary by Country ---

def test_salary_by_country(seeded):
    res = seeded.get("/insights/by-country")
    assert res.status_code == 200
    data = {row["country"]: row for row in res.json()}

    assert data["India"]["min_salary"] == 60_000
    assert data["India"]["max_salary"] == 90_000
    assert data["India"]["avg_salary"] == 75_000

    assert data["Germany"]["min_salary"] == 100_000
    assert data["Germany"]["max_salary"] == 100_000
    assert data["Germany"]["avg_salary"] == 100_000


def test_salary_by_country_empty_db(client):
    res = client.get("/insights/by-country")
    assert res.status_code == 200
    assert res.json() == []


# --- Salary by Job Title ---

def test_salary_by_jobtitle(seeded):
    res = seeded.get("/insights/by-jobtitle?country=India")
    assert res.status_code == 200
    data = {row["job_title"]: row for row in res.json()}
    assert data["HR Manager"]["avg_salary"] == 75_000


def test_salary_by_jobtitle_filters_by_country(seeded):
    res = seeded.get("/insights/by-jobtitle?country=Germany")
    assert res.status_code == 200
    data = {row["job_title"]: row for row in res.json()}
    assert "HR Analyst" in data
    assert "HR Manager" not in data


def test_salary_by_jobtitle_missing_country_param(client):
    res = client.get("/insights/by-jobtitle")
    assert res.status_code == 422


def test_salary_by_jobtitle_unknown_country(seeded):
    res = seeded.get("/insights/by-jobtitle?country=Narnia")
    assert res.status_code == 200
    assert res.json() == []


# --- Salary by Department ---

def test_salary_by_department(seeded):
    res = seeded.get("/insights/by-department")
    assert res.status_code == 200
    data = {row["department"]: row for row in res.json()}
    assert data["HR"]["avg_salary"] == 75_000
    assert data["Engineering"]["avg_salary"] == 100_000


def test_salary_by_department_empty_db(client):
    res = client.get("/insights/by-department")
    assert res.status_code == 200
    assert res.json() == []


# --- Headcount by Country ---

def test_headcount_by_country(seeded):
    res = seeded.get("/insights/headcount")
    assert res.status_code == 200
    data = {row["country"]: row["headcount"] for row in res.json()}
    assert data["India"] == 2
    assert data["Germany"] == 1


def test_headcount_by_country_empty_db(client):
    res = client.get("/insights/headcount")
    assert res.status_code == 200
    assert res.json() == []


# --- Employment Type Distribution ---

def test_employment_type_distribution(seeded):
    res = seeded.get("/insights/employment-type")
    assert res.status_code == 200
    data = {row["employment_type"]: row["count"] for row in res.json()}
    assert data["Full-time"] == 1
    assert data["Part-time"] == 1
    assert data["Contract"] == 1


def test_employment_type_distribution_empty_db(client):
    res = client.get("/insights/employment-type")
    assert res.status_code == 200
    assert res.json() == []
