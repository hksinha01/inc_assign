import random
from pathlib import Path
from sqlalchemy.orm import Session
from database import engine, Base
from models import Employee, EmploymentType, Gender

NAMES_DIR = Path(__file__).resolve().parent.parent

first_names = (NAMES_DIR / "first_names.txt").read_text().splitlines()
last_names = (NAMES_DIR / "last_names.txt").read_text().splitlines()

JOB_TITLES = [
    "HR Manager",
    "HR Business Partner",
    "Recruiter",
    "HR Coordinator",
    "Compensation Analyst",
    "Talent Acquisition Specialist",
]

COUNTRIES = [
    "United States",
    "United Kingdom",
    "India",
    "Germany",
    "Canada",
    "Australia",
]

SALARY_RANGE = (30_000, 150_000)

EMPLOYMENT_TYPES = [
    EmploymentType.full_time,
    EmploymentType.part_time,
    EmploymentType.contract,
]


def seed():
    Base.metadata.create_all(bind=engine)

    employees = [
        Employee(
            full_name=f"{first} {last}",
            job_title=random.choice(JOB_TITLES),
            department="HR",
            country=random.choice(COUNTRIES),
            salary=round(random.uniform(*SALARY_RANGE), 2),
            gender=Gender.male,
            employment_type=random.choice(EMPLOYMENT_TYPES),
        )
        for first in first_names
        for last in last_names
    ]

    with Session(engine) as session:
        session.bulk_save_objects(employees)
        session.commit()

    print(f"Seeded {len(employees)} employees.")


if __name__ == "__main__":
    seed()
