from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("/", response_model=schemas.EmployeeListOut)
def list_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: str | None = Query(None, description="Filter by name (partial match)"),
    country: str | None = Query(None, description="Filter by exact country"),
    job_title: str | None = Query(None, description="Filter by job title (partial match)"),
    db: Session = Depends(get_db),
):
    total, items = crud.get_employees(
        db, skip=skip, limit=limit, search=search, country=country, job_title=job_title
    )
    return {"total": total, "items": items}


@router.post("/", response_model=schemas.EmployeeOut, status_code=201)
def create_employee(data: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    return crud.create_employee(db, data)


@router.get("/{employee_id}", response_model=schemas.EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = crud.get_employee(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.put("/{employee_id}", response_model=schemas.EmployeeOut)
def update_employee(
    employee_id: int, data: schemas.EmployeeUpdate, db: Session = Depends(get_db)
):
    employee = crud.update_employee(db, employee_id, data)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.delete("/{employee_id}", status_code=204)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_employee(db, employee_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Employee not found")
