from conftest import EMPLOYEE


# --- Create ---

def test_create_employee(client):
    res = client.post("/employees/", json=EMPLOYEE)
    assert res.status_code == 201
    body = res.json()
    assert body["full_name"] == "Jane Doe"
    assert body["salary"] == 75000.0
    assert body["gender"] == "Female"
    assert body["employment_type"] == "Full-time"
    assert "id" in body
    assert "created_at" in body
    assert "updated_at" in body


def test_create_employee_negative_salary(client):
    res = client.post("/employees/", json={**EMPLOYEE, "salary": -1})
    assert res.status_code == 422


def test_create_employee_zero_salary(client):
    res = client.post("/employees/", json={**EMPLOYEE, "salary": 0})
    assert res.status_code == 422


def test_create_employee_missing_field(client):
    payload = {k: v for k, v in EMPLOYEE.items() if k != "gender"}
    res = client.post("/employees/", json=payload)
    assert res.status_code == 422


# --- Read ---

def test_get_employee(client):
    created = client.post("/employees/", json=EMPLOYEE).json()
    res = client.get(f"/employees/{created['id']}")
    assert res.status_code == 200
    assert res.json()["id"] == created["id"]
    assert res.json()["full_name"] == "Jane Doe"


def test_get_employee_not_found(client):
    res = client.get("/employees/99999")
    assert res.status_code == 404


# --- List + filters ---

def test_list_employees_returns_total_and_items(client):
    client.post("/employees/", json=EMPLOYEE)
    client.post("/employees/", json={**EMPLOYEE, "full_name": "John Smith"})
    res = client.get("/employees/")
    assert res.status_code == 200
    body = res.json()
    assert body["total"] == 2
    assert len(body["items"]) == 2


def test_list_employees_pagination(client):
    for i in range(5):
        client.post("/employees/", json={**EMPLOYEE, "full_name": f"Employee {i}"})
    res = client.get("/employees/?skip=2&limit=2")
    body = res.json()
    assert body["total"] == 5
    assert len(body["items"]) == 2


def test_list_employees_filter_by_name(client):
    client.post("/employees/", json={**EMPLOYEE, "full_name": "Alice Smith"})
    client.post("/employees/", json={**EMPLOYEE, "full_name": "Bob Jones"})
    res = client.get("/employees/?search=alice")
    body = res.json()
    assert body["total"] == 1
    assert body["items"][0]["full_name"] == "Alice Smith"


def test_list_employees_filter_by_country(client):
    client.post("/employees/", json={**EMPLOYEE, "country": "India"})
    client.post("/employees/", json={**EMPLOYEE, "country": "Germany"})
    res = client.get("/employees/?country=India")
    body = res.json()
    assert body["total"] == 1
    assert body["items"][0]["country"] == "India"


def test_list_employees_filter_by_job_title(client):
    client.post("/employees/", json={**EMPLOYEE, "job_title": "HR Manager"})
    client.post("/employees/", json={**EMPLOYEE, "job_title": "HR Analyst"})
    res = client.get("/employees/?job_title=manager")
    body = res.json()
    assert body["total"] == 1
    assert body["items"][0]["job_title"] == "HR Manager"


def test_list_employees_empty_db(client):
    res = client.get("/employees/")
    body = res.json()
    assert body["total"] == 0
    assert body["items"] == []


# --- Update ---

def test_update_employee_full(client):
    created = client.post("/employees/", json=EMPLOYEE).json()
    res = client.put(f"/employees/{created['id']}", json={
        "full_name": "Jane Updated",
        "salary": 90000.0,
        "country": "Germany",
        "job_title": "HR Director",
        "department": "HR",
        "gender": "Female",
        "employment_type": "Contract",
    })
    assert res.status_code == 200
    body = res.json()
    assert body["full_name"] == "Jane Updated"
    assert body["salary"] == 90000.0
    assert body["country"] == "Germany"


def test_update_employee_partial(client):
    created = client.post("/employees/", json=EMPLOYEE).json()
    res = client.put(f"/employees/{created['id']}", json={"salary": 95000.0})
    assert res.status_code == 200
    body = res.json()
    assert body["salary"] == 95000.0
    assert body["full_name"] == "Jane Doe"
    assert body["country"] == "India"


def test_update_employee_not_found(client):
    res = client.put("/employees/99999", json={"salary": 90000.0})
    assert res.status_code == 404


def test_update_employee_invalid_salary(client):
    created = client.post("/employees/", json=EMPLOYEE).json()
    res = client.put(f"/employees/{created['id']}", json={"salary": -500})
    assert res.status_code == 422


# --- Delete ---

def test_delete_employee(client):
    created = client.post("/employees/", json=EMPLOYEE).json()
    res = client.delete(f"/employees/{created['id']}")
    assert res.status_code == 204
    assert client.get(f"/employees/{created['id']}").status_code == 404


def test_delete_employee_not_found(client):
    res = client.delete("/employees/99999")
    assert res.status_code == 404


def test_delete_removes_from_list(client):
    created = client.post("/employees/", json=EMPLOYEE).json()
    client.delete(f"/employees/{created['id']}")
    body = client.get("/employees/").json()
    assert body["total"] == 0


# --- Countries ---

def test_list_countries_distinct(client):
    client.post("/employees/", json={**EMPLOYEE, "country": "India"})
    client.post("/employees/", json={**EMPLOYEE, "country": "Germany"})
    client.post("/employees/", json={**EMPLOYEE, "country": "India"})
    res = client.get("/employees/countries")
    assert res.status_code == 200
    countries = res.json()
    assert sorted(countries) == ["Germany", "India"]


def test_list_countries_search(client):
    client.post("/employees/", json={**EMPLOYEE, "country": "India"})
    client.post("/employees/", json={**EMPLOYEE, "country": "Indonesia"})
    client.post("/employees/", json={**EMPLOYEE, "country": "Germany"})
    res = client.get("/employees/countries?search=ind")
    assert res.status_code == 200
    countries = res.json()
    assert set(countries) == {"India", "Indonesia"}


def test_list_countries_empty_db(client):
    res = client.get("/employees/countries")
    assert res.status_code == 200
    assert res.json() == []
