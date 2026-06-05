from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/by-country", response_model=list[schemas.SalaryByCountry])
def salary_by_country(db: Session = Depends(get_db)):
    return crud.get_salary_by_country(db)


@router.get("/by-jobtitle", response_model=list[schemas.SalaryByJobTitle])
def salary_by_jobtitle(
    country: str = Query(..., description="Country to filter job titles by"),
    db: Session = Depends(get_db),
):
    return crud.get_salary_by_jobtitle(db, country)


@router.get("/by-department", response_model=list[schemas.SalaryByDepartment])
def salary_by_department(db: Session = Depends(get_db)):
    return crud.get_salary_by_department(db)


@router.get("/headcount", response_model=list[schemas.HeadcountByCountry])
def headcount_by_country(db: Session = Depends(get_db)):
    return crud.get_headcount_by_country(db)


@router.get("/employment-type", response_model=list[schemas.EmploymentTypeDistribution])
def employment_type_distribution(db: Session = Depends(get_db)):
    return crud.get_employment_type_distribution(db)
