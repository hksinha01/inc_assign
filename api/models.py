from datetime import datetime, timezone
from sqlalchemy import Integer, String, Float, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column
from database import Base
import enum


class EmploymentType(str, enum.Enum):
    full_time = "Full-time"
    part_time = "Part-time"
    contract = "Contract"


class Gender(str, enum.Enum):
    male = "Male"
    female = "Female"
    other = "Other"


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    salary: Mapped[float] = mapped_column(Float, nullable=False)
    gender: Mapped[Gender] = mapped_column(
        Enum(Gender), nullable=False
    )
    employment_type: Mapped[EmploymentType] = mapped_column(
        Enum(EmploymentType), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
