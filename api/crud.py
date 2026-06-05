from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Employee
from schemas import EmployeeCreate, EmployeeUpdate


def get_employee(db: Session, employee_id: int):
    return db.query(Employee).filter(Employee.id == employee_id).first()


def get_countries(db: Session, search: str | None = None):
    query = db.query(Employee.country).distinct()
    if search:
        query = query.filter(Employee.country.ilike(f"%{search}%"))
    return [row.country for row in query.order_by(Employee.country).limit(10).all()]


def get_employees(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    search: str | None = None,
    country: str | None = None,
    job_title: str | None = None,
):
    query = db.query(Employee)
    if search:
        query = query.filter(Employee.full_name.ilike(f"%{search}%"))
    if country:
        query = query.filter(Employee.country == country)
    if job_title:
        query = query.filter(Employee.job_title.ilike(f"%{job_title}%"))
    total = query.count()
    items = query.order_by(Employee.id).offset(skip).limit(limit).all()
    return total, items


def create_employee(db: Session, data: EmployeeCreate) -> Employee:
    employee = Employee(**data.model_dump())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


def update_employee(db: Session, employee_id: int, data: EmployeeUpdate) -> Employee | None:
    employee = get_employee(db, employee_id)
    if not employee:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(employee, field, value)
    employee.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(employee)
    return employee


def delete_employee(db: Session, employee_id: int) -> bool:
    employee = get_employee(db, employee_id)
    if not employee:
        return False
    db.delete(employee)
    db.commit()
    return True


# --- Insight queries ---

def get_salary_by_country(db: Session):
    return (
        db.query(
            Employee.country,
            func.min(Employee.salary).label("min_salary"),
            func.max(Employee.salary).label("max_salary"),
            func.avg(Employee.salary).label("avg_salary"),
        )
        .group_by(Employee.country)
        .order_by(Employee.country)
        .all()
    )


def get_salary_by_jobtitle(db: Session, country: str):
    return (
        db.query(
            Employee.job_title,
            func.avg(Employee.salary).label("avg_salary"),
        )
        .filter(Employee.country == country)
        .group_by(Employee.job_title)
        .order_by(Employee.job_title)
        .all()
    )


def get_salary_by_department(db: Session):
    return (
        db.query(
            Employee.department,
            func.avg(Employee.salary).label("avg_salary"),
        )
        .group_by(Employee.department)
        .order_by(Employee.department)
        .all()
    )


def get_headcount_by_country(db: Session):
    return (
        db.query(
            Employee.country,
            func.count(Employee.id).label("headcount"),
        )
        .group_by(Employee.country)
        .order_by(Employee.country)
        .all()
    )


def get_employment_type_distribution(db: Session):
    return (
        db.query(
            Employee.employment_type,
            func.count(Employee.id).label("count"),
        )
        .group_by(Employee.employment_type)
        .all()
    )
