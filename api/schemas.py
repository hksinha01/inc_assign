from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator
from models import EmploymentType


class EmployeeBase(BaseModel):
    full_name: str
    job_title: str
    department: str
    country: str
    salary: float
    employment_type: EmploymentType

    @field_validator("salary")
    @classmethod
    def salary_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("salary must be a positive number")
        return v


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    country: Optional[str] = None
    salary: Optional[float] = None
    employment_type: Optional[EmploymentType] = None

    @field_validator("salary")
    @classmethod
    def salary_must_be_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("salary must be a positive number")
        return v


class EmployeeOut(EmployeeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EmployeeListOut(BaseModel):
    total: int
    items: list[EmployeeOut]


# --- Insight response schemas ---

class SalaryByCountry(BaseModel):
    country: str
    min_salary: float
    max_salary: float
    avg_salary: float


class SalaryByJobTitle(BaseModel):
    job_title: str
    avg_salary: float


class SalaryByDepartment(BaseModel):
    department: str
    avg_salary: float


class HeadcountByCountry(BaseModel):
    country: str
    headcount: int


class EmploymentTypeDistribution(BaseModel):
    employment_type: str
    count: int
