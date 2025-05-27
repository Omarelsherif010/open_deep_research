from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime
import os
import shutil
import uuid
from pathlib import Path

router = APIRouter(prefix="/api/documents", tags=["documents"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Mock database for documents
documents_db = {}

class DocumentInfo:
    def __init__(self, id: str, filename: str, project_id: str, content_type: str, 
                 size: int, upload_date: datetime, path: str):
        self.id = id
        self.filename = filename
        self.project_id = project_id
        self.content_type = content_type
        self.size = size
        self.upload_date = upload_date
        self.path = path
    
    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "project_id": self.project_id,
            "content_type": self.content_type,
            "size": self.size,
            "upload_date": self.upload_date.isoformat(),
            "path": str(self.path)
        }

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    project_id: str = Form(...),
    description: Optional[str] = Form(None)
):
    """Upload a document for a specific project."""
    # Create project directory if it doesn't exist
    project_dir = UPLOAD_DIR / project_id
    project_dir.mkdir(exist_ok=True)
    
    # Generate unique ID for the document
    doc_id = f"doc_{uuid.uuid4()}"
    
    # Save the file
    file_path = project_dir / file.filename
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()
    
    # Store document info
    doc_info = DocumentInfo(
        id=doc_id,
        filename=file.filename,
        project_id=project_id,
        content_type=file.content_type,
        size=os.path.getsize(file_path),
        upload_date=datetime.now(),
        path=file_path
    )
    
    # Add to mock database
    if project_id not in documents_db:
        documents_db[project_id] = {}
    documents_db[project_id][doc_id] = doc_info
    
    return doc_info.to_dict()

@router.get("/{project_id}")
async def get_project_documents(project_id: str):
    """Get all documents for a specific project."""
    if project_id not in documents_db:
        return {"documents": []}
    
    return {
        "documents": [doc.to_dict() for doc in documents_db[project_id].values()]
    }

@router.get("/{project_id}/{document_id}")
async def get_document(project_id: str, document_id: str):
    """Get information about a specific document."""
    if project_id not in documents_db or document_id not in documents_db[project_id]:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return documents_db[project_id][document_id].to_dict()

@router.delete("/{project_id}/{document_id}")
async def delete_document(project_id: str, document_id: str):
    """Delete a specific document."""
    if project_id not in documents_db or document_id not in documents_db[project_id]:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Get document info
    doc_info = documents_db[project_id][document_id]
    
    # Delete the file
    try:
        os.remove(doc_info.path)
    except OSError:
        # File might not exist, but we'll continue with removal from DB
        pass
    
    # Remove from database
    del documents_db[project_id][document_id]
    
    return {"status": "success", "message": "Document deleted successfully"}
