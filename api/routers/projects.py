from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api/projects", tags=["projects"])

# Simple data models
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    company_name: str
    
class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Mock database
projects_db = {}

@router.post("/", response_model=Project)
async def create_project(project: ProjectCreate):
    """Create a new TDD project."""
    project_id = f"proj_{len(projects_db) + 1}"
    now = datetime.now()
    
    new_project = Project(
        id=project_id,
        created_at=now,
        updated_at=now,
        **project.dict()
    )
    
    projects_db[project_id] = new_project
    return new_project

@router.get("/", response_model=List[Project])
async def list_projects():
    """List all TDD projects."""
    return list(projects_db.values())

@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Get a specific TDD project."""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    return projects_db[project_id]
