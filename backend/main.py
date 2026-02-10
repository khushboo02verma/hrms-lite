from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, Integer, String, Date, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel, EmailStr
from datetime import date
from typing import List

app = FastAPI()

# Frontend connectivity (CORS)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Database Setup
DATABASE_URL = "sqlite:///./hrms.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class EmployeeDB(Base):
    __tablename__ = "employees"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    department = Column(String)

class AttendanceDB(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    emp_id = Column(String)
    date = Column(Date)
    status = Column(String)

# Tables banana [cite: 35]
Base.metadata.create_all(bind=engine)

# Schemas [cite: 36, 38]
class EmployeeCreate(BaseModel):
    id: str
    name: str
    email: EmailStr
    department: str

class AttendanceCreate(BaseModel):
    emp_id: str
    date: date
    status: str

# API Endpoints [cite: 34]
@app.post("/employees")
def add_employee(emp: EmployeeCreate):
    db = SessionLocal()
    # Duplicate check [cite: 39]
    if db.query(EmployeeDB).filter(EmployeeDB.id == emp.id).first():
        db.close()
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    new_emp = EmployeeDB(**emp.model_dump())
    db.add(new_emp)
    db.commit()
    db.close()
    return {"message": "Employee added"}

@app.get("/employees")
def get_employees():
    db = SessionLocal()
    emps = db.query(EmployeeDB).all()
    db.close()
    return emps

@app.delete("/employees/{emp_id}")
def delete_employee(emp_id: str):
    db = SessionLocal()
    emp = db.query(EmployeeDB).filter(EmployeeDB.id == emp_id).first()
    if emp:
        db.delete(emp)
        db.commit()
    db.close()
    return {"message": "Deleted"}

@app.post("/attendance")
def mark_attendance(att: AttendanceCreate):
    db = SessionLocal()
    new_att = AttendanceDB(**att.model_dump())
    db.add(new_att)
    db.commit()
    db.close()
    return {"message": "Attendance marked"}

@app.get("/attendance/{emp_id}")
def get_attendance(emp_id: str):
    db = SessionLocal()
    records = db.query(AttendanceDB).filter(AttendanceDB.emp_id == emp_id).all()
    db.close()
    return records